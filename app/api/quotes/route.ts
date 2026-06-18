import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateQuote } from '@/lib/pricing';
import { createQuoteInput } from '@/lib/validation';
import { DEFAULT_DEPOSIT_PERCENT } from '@/lib/constants';
import type { PricingRule } from '@/types';

export const runtime = 'nodejs';

/**
 * POST /api/quotes
 * รับ Instant Quote submission จากลูกค้า (anon)
 * - validate ด้วย zod
 * - คำนวณราคาซ้ำฝั่ง server เสมอ (ไม่เชื่อราคาจาก client)
 * - upsert ลูกค้า (by phone) + สร้าง quote(status=sent) + quote_items
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  const parsed = createQuoteInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'ข้อมูลไม่ถูกต้อง', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล (ยังไม่ได้ตั้งค่า Supabase)' },
      { status: 503 },
    );
  }

  // ----- คำนวณราคาแต่ละรายการใหม่ฝั่ง server -----
  const computedItems: {
    product_id: string;
    description: string;
    size: string | null;
    material: string | null;
    options: Record<string, unknown>;
    quantity: number;
    unit_price: number;
    amount: number;
    file_url: string | null;
    production_days: number;
  }[] = [];

  let subtotal = 0;
  let maxDays = 0;

  for (const item of input.items) {
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, name, base_price, production_days, unit')
      .eq('id', item.product_id)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'ไม่พบสินค้าที่เลือก' }, { status: 400 });
    }

    const { data: rules } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('product_id', item.product_id);

    const ruleList = (rules ?? []) as PricingRule[];

    const result = calculateQuote(
      { base_price: Number(product.base_price), production_days: product.production_days },
      ruleList,
      {
        size: item.size,
        material: item.material,
        options: item.options,
        quantity: item.quantity,
      },
    );

    // สร้างคำอธิบายจาก label ของกฎที่เลือก
    const labelOf = (type: PricingRule['rule_type'], key?: string) =>
      key ? ruleList.find((r) => r.rule_type === type && r.key === key)?.label : undefined;
    const optionLabels = (item.options ?? [])
      .map((k) => labelOf('option', k))
      .filter(Boolean) as string[];
    const descParts = [
      product.name,
      labelOf('size', item.size),
      labelOf('material', item.material),
      ...optionLabels,
    ].filter(Boolean);

    subtotal += result.total;
    maxDays = Math.max(maxDays, result.productionDays);

    computedItems.push({
      product_id: product.id,
      description: descParts.join(' | '),
      size: labelOf('size', item.size) ?? item.size ?? null,
      material: labelOf('material', item.material) ?? item.material ?? null,
      options: { keys: item.options ?? [], labels: optionLabels, note: item.note ?? null },
      quantity: result.quantity,
      unit_price: result.unitPrice,
      amount: result.total,
      file_url: item.file_url ?? null,
      production_days: result.productionDays,
    });
  }

  const total = Math.round(subtotal * 100) / 100;
  const depositAmount = Math.round(total * (DEFAULT_DEPOSIT_PERCENT / 100) * 100) / 100;

  // ----- upsert ลูกค้า (by phone) -----
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', input.customer.phone)
    .maybeSingle();

  let customerId: string;
  if (existing?.id) {
    customerId = existing.id;
    await supabase
      .from('customers')
      .update({
        name: input.customer.name,
        line_id: input.customer.line_id || null,
        email: input.customer.email || null,
        company: input.customer.company || null,
      })
      .eq('id', customerId);
  } else {
    const { data: created, error: custErr } = await supabase
      .from('customers')
      .insert({
        name: input.customer.name,
        phone: input.customer.phone,
        line_id: input.customer.line_id || null,
        email: input.customer.email || null,
        company: input.customer.company || null,
      })
      .select('id')
      .single();
    if (custErr || !created) {
      return NextResponse.json({ error: 'บันทึกข้อมูลลูกค้าไม่สำเร็จ' }, { status: 500 });
    }
    customerId = created.id;
  }

  // ----- สร้างใบเสนอราคา (quote_number ถูกสร้างอัตโนมัติด้วย trigger) -----
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  const { data: quote, error: quoteErr } = await supabase
    .from('quotes')
    .insert({
      customer_id: customerId,
      status: 'sent',
      subtotal: total,
      total,
      deposit_percent: DEFAULT_DEPOSIT_PERCENT,
      deposit_amount: depositAmount,
      valid_until: validUntil.toISOString().slice(0, 10),
      notes: input.note || null,
      sent_at: new Date().toISOString(),
    })
    .select('id, quote_number')
    .single();

  if (quoteErr || !quote) {
    return NextResponse.json({ error: 'สร้างใบเสนอราคาไม่สำเร็จ' }, { status: 500 });
  }

  // ----- รายการในใบเสนอราคา -----
  const { error: itemsErr } = await supabase.from('quote_items').insert(
    computedItems.map((it, idx) => ({
      quote_id: quote.id,
      product_id: it.product_id,
      description: it.description,
      size: it.size,
      material: it.material,
      options: it.options,
      quantity: it.quantity,
      unit_price: it.unit_price,
      amount: it.amount,
      file_url: it.file_url,
      production_days: it.production_days,
      sort_order: idx,
    })),
  );

  if (itemsErr) {
    return NextResponse.json({ error: 'บันทึกรายการสินค้าไม่สำเร็จ' }, { status: 500 });
  }

  return NextResponse.json({
    quote_number: quote.quote_number,
    total,
    deposit_amount: depositAmount,
    production_days: maxDays,
  });
}
