import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trackInput } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * GET /api/track?ref=QUO-000001&phone=08xxxxxxxx
 * ติดตามสถานะงานสำหรับลูกค้า — ต้องระบุ quote_number + phone ที่ตรงกันเท่านั้น
 * (ป้องกันการไล่ดูออเดอร์ของผู้อื่น)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = trackInput.safeParse({
    ref: searchParams.get('ref') ?? '',
    phone: searchParams.get('phone') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'กรุณากรอกเลขใบเสนอราคาและเบอร์โทรให้ถูกต้อง' },
      { status: 400 },
    );
  }
  const { ref, phone } = parsed.data;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล' },
      { status: 503 },
    );
  }

  // ใช้ข้อความ error เดียวกันทั้งกรณีไม่พบ/เบอร์ไม่ตรง เพื่อไม่ให้เดาข้อมูล
  const notFound = () =>
    NextResponse.json(
      { error: 'ไม่พบรายการ กรุณาตรวจสอบเลขใบเสนอราคาและเบอร์โทร' },
      { status: 404 },
    );

  // ค้นหา quote ตามเลข
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, quote_number, status, total, deposit_amount, created_at, customer_id')
    .eq('quote_number', ref)
    .single();

  if (!quote) return notFound();

  // ตรวจเบอร์โทรของลูกค้าให้ตรงกัน (แยก query เพื่อความชัดเจนของ type)
  const { data: customer } = await supabase
    .from('customers')
    .select('name, phone')
    .eq('id', quote.customer_id)
    .single();

  if (!customer || customer.phone !== phone) return notFound();

  // งานผลิต (ถ้ามี — สร้างเมื่อ quote ถูก approve)
  const { data: job } = await supabase
    .from('production_jobs')
    .select('id, job_number, status, due_date, created_at')
    .eq('quote_id', quote.id)
    .maybeSingle();

  let logs: { status_to: string; note: string | null; created_at: string }[] = [];
  let shipment: {
    tracking_number: string | null;
    carrier: string | null;
    status: string;
    shipped_at: string | null;
  } | null = null;

  if (job?.id) {
    const { data: logRows } = await supabase
      .from('production_logs')
      .select('status_to, note, created_at')
      .eq('job_id', job.id)
      .order('created_at', { ascending: true });
    logs = logRows ?? [];

    const { data: ship } = await supabase
      .from('shipments')
      .select('tracking_number, carrier, status, shipped_at')
      .eq('job_id', job.id)
      .maybeSingle();
    shipment = ship ?? null;
  }

  return NextResponse.json({
    quote: {
      quote_number: quote.quote_number,
      status: quote.status,
      total: quote.total,
      deposit_amount: quote.deposit_amount,
      created_at: quote.created_at,
      customer_name: customer.name,
    },
    job: job
      ? { job_number: job.job_number, status: job.status, due_date: job.due_date }
      : null,
    logs,
    shipment,
  });
}
