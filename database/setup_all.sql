-- =============================================================================
-- K2 Factory OS — Setup ทั้งหมดในไฟล์เดียว (สำหรับ psql / local)
--
-- ⚠️ ไฟล์นี้ใช้คำสั่ง \i ของ psql เท่านั้น — "ใช้ไม่ได้" บน Supabase SQL Editor
--    บน Supabase SQL Editor ให้เปิดและรันทีละไฟล์ตามลำดับแทน (ดู SETUP.md)
--
-- วิธีใช้ (รันจากโฟลเดอร์ database/ เพราะ \i อ้างอิง path จาก working directory):
--   cd database
--   psql "$DATABASE_URL" -f setup_all.sql
-- =============================================================================

\echo '>> 1/4 schema...'
\i migrations/0001_schema.sql

\echo '>> 2/4 rls...'
\i migrations/0002_rls.sql

\echo '>> 3/4 storage (bucket artwork)...'
\i migrations/0003_storage.sql

\echo '>> 4/4 seed (products + pricing_rules)...'
\i seed.sql

\echo '>> เสร็จสิ้น: schema + rls + storage + seed'
