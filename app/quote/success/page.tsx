import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Card } from '@/components/ui/Card';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatTHB } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ส่งคำขอสำเร็จ — K2 Factory OS',
};

export const dynamic = 'force-dynamic';

interface QuoteSummary {
  total: number;
  deposit_amount: number;
  items: { description: string; quantity: number; amount: number }[];
}

async function fetchSummary(ref: string): Promise<QuoteSummary | null> {
  try {
    const supabase = createAdminClient();
    const { data: quote } = await supabase
      .from('quotes')
      .select('id, total, deposit_amount')
      .eq('quote_number', ref)
      .single();
    if (!quote) return null;
    const { data: items } = await supabase
      .from('quote_items')
      .select('description, quantity, amount')
      .eq('quote_id', quote.id)
      .order('sort_order');
    return {
      total: Number(quote.total),
      deposit_amount: Number(quote.deposit_amount),
      items: items ?? [],
    };
  } catch {
    return null;
  }
}

export default async function QuoteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const summary = ref ? await fetchSummary(ref) : null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">ส่งคำขอใบเสนอราคาสำเร็จ</h1>
          <p className="mt-2 text-zinc-600">
            ทีมงานจะตรวจสอบและติดต่อกลับเพื่อยืนยันราคาจริงโดยเร็วที่สุด
          </p>
        </div>

        {ref && (
          <Card className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">เลขใบเสนอราคา</span>
              <span className="font-mono text-lg font-semibold text-orange-600">{ref}</span>
            </div>

            {summary && (
              <>
                <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
                  {summary.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="text-zinc-600">
                        {it.description} × {it.quantity}
                      </span>
                      <span className="shrink-0">{formatTHB(it.amount)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">ราคารวม (ประมาณการ)</span>
                    <span className="font-medium">{formatTHB(summary.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">มัดจำ</span>
                    <span className="font-medium text-orange-600">
                      {formatTHB(summary.deposit_amount)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              เก็บเลขนี้ไว้สำหรับติดตามสถานะงานในหน้า “ติดตามงาน” (ใช้คู่กับเบอร์โทร)
            </p>
          </Card>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={ref ? `/track?ref=${encodeURIComponent(ref)}` : '/track'}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-black font-medium text-white hover:bg-zinc-800"
          >
            ติดตามงาน
          </Link>
          <Link
            href="/products"
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-zinc-300 font-medium hover:bg-zinc-50"
          >
            ขอราคาเพิ่ม
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
