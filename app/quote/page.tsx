import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { getProductsWithPricingRules } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'ขอราคาทันที — K2 Factory OS',
  description: 'เลือกสินค้า ขนาด วัสดุ จำนวน อัปโหลดไฟล์ แล้วรับราคาประมาณการทันที',
};

export const dynamic = 'force-dynamic';

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const products = await getProductsWithPricingRules();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ขอราคาทันที</h1>
        <p className="mt-2 text-zinc-600">
          เลือกตัวเลือกที่ต้องการ ระบบจะคำนวณราคาประมาณการและระยะเวลาผลิตให้ทันที
        </p>
        <div className="mt-8">
          <QuoteForm products={products} initialSlug={product} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
