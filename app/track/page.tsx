import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { TrackingClient } from '@/components/track/TrackingClient';

export const metadata: Metadata = {
  title: 'ติดตามงาน — K2 Factory OS',
  description: 'ติดตามสถานะใบเสนอราคาและงานผลิตด้วยเลขใบเสนอราคาและเบอร์โทร',
};

export const dynamic = 'force-dynamic';

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ติดตามงาน</h1>
        <p className="mt-2 text-zinc-600">
          กรอกเลขใบเสนอราคาและเบอร์โทรที่ใช้สั่งงาน เพื่อดูสถานะล่าสุด
        </p>
        <div className="mt-8">
          <TrackingClient initialRef={ref} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
