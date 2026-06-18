import { notFound } from 'next/navigation';
import { checkSupabaseHealth } from '@/lib/supabase/health';

// หน้านี้ใช้ได้เฉพาะ development เท่านั้น
export const dynamic = 'force-dynamic';

function Row({ label, ok, value }: { label: string; ok: boolean | null; value?: string }) {
  const icon = ok === null ? '⚪' : ok ? '✅' : '❌';
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-0">
      <span className="text-sm text-zinc-600">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium">
        {value !== undefined && <span className="text-zinc-900">{value}</span>}
        <span>{icon}</span>
      </span>
    </div>
  );
}

export default async function SupabaseDebugPage() {
  // ปิดใน production อย่างเด็ดขาด
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const h = await checkSupabaseHealth();

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Supabase Health Check</h1>
      <p className="mt-1 text-sm text-zinc-500">
        หน้า debug สำหรับ development เท่านั้น — แสดงเฉพาะสถานะ ไม่แสดงค่า env จริง
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-500">Environment</h2>
        <Row label="NEXT_PUBLIC_SUPABASE_URL" ok={h.env.url} />
        <Row label="NEXT_PUBLIC_SUPABASE_ANON_KEY" ok={h.env.anonKey} />
        <Row label="SUPABASE_SERVICE_ROLE_KEY" ok={h.env.serviceRoleKey} />
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-500">Connection &amp; Data</h2>
        <Row label="เชื่อมต่อ Supabase" ok={h.connected} />
        <Row
          label="จำนวนสินค้า (products)"
          ok={h.productCount === null ? null : h.productCount > 0}
          value={h.productCount === null ? '—' : String(h.productCount)}
        />
        <Row
          label="จำนวนกฎราคา (pricing_rules)"
          ok={h.pricingRuleCount === null ? null : h.pricingRuleCount > 0}
          value={h.pricingRuleCount === null ? '—' : String(h.pricingRuleCount)}
        />
        <Row label='Storage bucket "artwork"' ok={h.artworkBucketExists} />
      </div>

      {h.error && (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{h.error}</p>
      )}

      <div className="mt-6 text-sm text-zinc-500">
        {h.connected && (h.productCount ?? 0) > 0 && h.artworkBucketExists ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-green-700">
            ✅ พร้อมใช้งาน end-to-end — ทดสอบ flow ลูกค้าได้เลย
          </p>
        ) : (
          <p>
            ดูวิธีตั้งค่าให้ครบที่ <code>SETUP.md</code> (env + รัน SQL + สร้าง bucket)
          </p>
        )}
      </div>
    </div>
  );
}
