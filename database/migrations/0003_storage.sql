-- =============================================================================
-- K2 Factory OS — Storage Setup
-- Migration: 0003_storage.sql  (รันหลัง 0001_schema.sql, 0002_rls.sql)
--
-- สร้าง bucket "artwork" สำหรับไฟล์งานที่ลูกค้าอัปโหลดผ่านหน้า Instant Quote
-- (ใช้โดย POST /api/upload)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Bucket: artwork
--   public = true  → เปิดดูไฟล์ผ่าน public URL ได้ (เหมาะกับ MVP)
--   ⚠️ ดู SETUP.md หัวข้อ "Storage Security" — แผนปรับเป็น private + signed URL ในอนาคต
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage RLS policies (บน storage.objects)
--   - อ่าน (select): เปิดสาธารณะสำหรับ bucket artwork
--   - เขียน/แก้/ลบ: ไม่เปิด policy ให้ anon/authenticated โดยตั้งใจ
--       การอัปโหลดทำผ่าน /api/upload ฝั่ง server ด้วย service-role ซึ่ง "ข้าม RLS"
--       จึงไม่จำเป็นต้องมี insert policy และปลอดภัยกว่า (กัน client อัปโหลดตรง)
-- ----------------------------------------------------------------------------
drop policy if exists "artwork public read" on storage.objects;
create policy "artwork public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'artwork');
