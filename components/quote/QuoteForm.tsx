'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OptionGroup, type Choice } from './OptionGroup';
import { QuantityInput } from './QuantityInput';
import { FileUpload } from './FileUpload';
import { PriceSummary } from './PriceSummary';
import { CustomerInfoForm, type CustomerInfo } from './CustomerInfoForm';
import { Card } from '@/components/ui/Card';
import { calculateQuote } from '@/lib/pricing';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import type { ProductWithPricing } from '@/lib/queries';
import type { PricingRule } from '@/types';

const emptyCustomer: CustomerInfo = { name: '', phone: '', line_id: '', email: '', company: '' };

function choicesByType(rules: PricingRule[], type: PricingRule['rule_type']): Choice[] {
  return rules
    .filter((r) => r.rule_type === type)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({ key: r.key, label: r.label }));
}

function defaultKey(rules: PricingRule[], type: PricingRule['rule_type']): string | undefined {
  const list = rules.filter((r) => r.rule_type === type).sort((a, b) => a.sort_order - b.sort_order);
  return (list.find((r) => r.is_default) ?? list[0])?.key;
}

export function QuoteForm({
  products,
  initialSlug,
}: {
  products: ProductWithPricing[];
  initialSlug?: string;
}) {
  const router = useRouter();

  const initialProduct = products.find((p) => p.slug === initialSlug) ?? products[0];
  const initialRules = initialProduct?.pricing_rules ?? [];

  const [productId, setProductId] = useState(initialProduct?.id ?? '');
  const [size, setSize] = useState<string | undefined>(() => defaultKey(initialRules, 'size'));
  const [material, setMaterial] = useState<string | undefined>(() =>
    defaultKey(initialRules, 'material'),
  );
  const [options, setOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(() => Math.max(1, initialProduct?.min_quantity ?? 1));
  const [file, setFile] = useState<{ url: string; name: string } | null>(null);
  const [note, setNote] = useState('');
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );
  const rules = useMemo(() => product?.pricing_rules ?? [], [product]);

  // รีเซ็ตตัวเลือกเป็นค่าเริ่มต้นเมื่อเปลี่ยนสินค้า (render-phase pattern แทน useEffect)
  const [prevProductId, setPrevProductId] = useState(productId);
  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setSize(defaultKey(rules, 'size'));
    setMaterial(defaultKey(rules, 'material'));
    setOptions([]);
    setQuantity(Math.max(1, product?.min_quantity ?? 1));
    setFile(null);
  }

  const estimate = useMemo(() => {
    if (!product) return null;
    return calculateQuote(
      { base_price: Number(product.base_price), production_days: product.production_days },
      rules,
      { size, material, options, quantity },
    );
  }, [product, rules, size, material, options, quantity]);

  async function handleSubmit() {
    if (!product) return;
    setError(null);

    if (!customer.name.trim()) return setError('กรุณากรอกชื่อ');
    if (!/^0\d{8,9}$/.test(customer.phone.replace(/[\s-]/g, '')))
      return setError('กรุณากรอกเบอร์โทรให้ถูกต้อง');

    setSubmitting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customer.name,
            phone: customer.phone,
            line_id: customer.line_id || undefined,
            email: customer.email || undefined,
            company: customer.company || undefined,
          },
          items: [
            {
              product_id: product.id,
              size,
              material,
              options,
              quantity,
              file_url: file?.url,
              note: note || undefined,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'ส่งคำขอไม่สำเร็จ');
        return;
      }
      router.push(`/quote/success?ref=${encodeURIComponent(data.quote_number)}`);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <Card className="text-center text-zinc-500">
        ยังไม่มีสินค้าให้เลือก
        <p className="mt-1 text-sm text-zinc-400">
          (หากเพิ่งติดตั้งระบบ กรุณารัน <code>database/seed.sql</code> และตั้งค่า Supabase)
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* คอลัมน์ซ้าย: ตัวเลือก */}
      <div className="space-y-6">
        <Card className="space-y-5">
          <OptionGroup
            label="เลือกสินค้า"
            choices={products.map((p) => ({
              key: p.id,
              label: `${p.name}`,
              hint: PRODUCT_CATEGORIES[p.category],
            }))}
            value={productId}
            onChange={(v) => setProductId(v as string)}
          />
        </Card>

        {product && (
          <Card className="space-y-5">
            <OptionGroup
              label="ขนาด"
              choices={choicesByType(rules, 'size')}
              value={size ?? ''}
              onChange={(v) => setSize(v as string)}
            />
            <OptionGroup
              label="วัสดุ"
              choices={choicesByType(rules, 'material')}
              value={material ?? ''}
              onChange={(v) => setMaterial(v as string)}
            />
            <OptionGroup
              label="ตัวเลือกเพิ่มเติม"
              multiple
              choices={choicesByType(rules, 'option')}
              value={options}
              onChange={(v) => setOptions(v as string[])}
            />
            <QuantityInput value={quantity} min={product.min_quantity} onChange={setQuantity} />
          </Card>
        )}

        <Card className="space-y-3">
          <label className="block text-sm font-medium text-zinc-700">ไฟล์งาน (ออกแบบ/อาร์ตเวิร์ก)</label>
          <FileUpload value={file} onChange={setFile} />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold">ข้อมูลผู้ติดต่อ</h2>
          <CustomerInfoForm value={customer} onChange={setCustomer} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">หมายเหตุ</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-200 p-3 text-base outline-none focus:border-orange-400"
              placeholder="รายละเอียดเพิ่มเติม เช่น สี ดีไซน์ กำหนดส่ง (ไม่บังคับ)"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
        </Card>
      </div>

      {/* คอลัมน์ขวา: สรุปราคา (sticky บนจอใหญ่) */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {estimate && (
          <PriceSummary
            result={estimate}
            unit={product?.unit ?? 'ชิ้น'}
            submitting={submitting}
            disabled={!product}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
