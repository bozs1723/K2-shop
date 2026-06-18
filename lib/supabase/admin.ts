import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Supabase Admin client (Service Role) — ใช้เฉพาะฝั่ง server เท่านั้น!
 *
 * ⚠️ ห้าม import ไฟล์นี้ใน Client Component หรือโค้ดที่ส่งไป browser เด็ดขาด
 * service-role key ข้าม RLS ทั้งหมด จึงใช้ได้เฉพาะใน Route Handlers / Server Actions
 *
 * ใช้สำหรับ flow ของลูกค้า (anon) เช่น สร้างใบเสนอราคา, อัปโหลดไฟล์, ติดตามงาน
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ใน environment',
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
