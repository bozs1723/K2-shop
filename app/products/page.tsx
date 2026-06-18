import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ProductCatalog } from '@/components/products/ProductCatalog';
import { getActiveProducts } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'หมวดสินค้า — K2 Factory OS',
  description: 'ป้าย QR · พวงกุญแจอะคริลิก · เสื้อ DTG · สติ๊กเกอร์ — ขอราคาได้ทันที',
};

// ดึงข้อมูลสินค้าแบบ dynamic (ขึ้นกับฐานข้อมูล)
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">หมวดสินค้า</h1>
        <p className="mt-2 text-zinc-600">เลือกสินค้าที่ต้องการ แล้วกด “ขอราคา” เพื่อคำนวณราคาทันที</p>
        <div className="mt-8">
          <ProductCatalog products={products} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
