# Database — K2 Factory OS

PostgreSQL schema สำหรับรันบน **Supabase**

## โครงสร้างไฟล์

```
database/
├── migrations/
│   ├── 0001_schema.sql   # extensions, enums, ตารางทั้งหมด, indexes, auto-numbering, triggers
│   └── 0002_rls.sql      # Row Level Security policies
├── seed.sql              # ข้อมูลตัวอย่าง (สินค้า + กฎราคา Instant Quote)
└── README.md
```

## ตารางหลัก (10 ตาราง)

| ตาราง | คำอธิบาย |
|-------|----------|
| `users` | พนักงาน/ผู้ใช้งานระบบ (ผูกกับ Supabase Auth) |
| `customers` | CRM ลูกค้า — ชื่อ / เบอร์ / LINE |
| `products` | หมวดสินค้า — ป้าย QR / พวงกุญแจอะคริลิก / เสื้อ DTG / สติ๊กเกอร์ |
| `pricing_rules` | กฎคิดราคาของ Instant Quote (ขนาด/วัสดุ/จำนวน/ตัวเลือก) |
| `quotes` | ใบเสนอราคา (draft / sent / approved / rejected) |
| `quote_items` | รายการในใบเสนอราคา + ไฟล์งานที่อัปโหลด |
| `payments` | Deposit / การชำระเงิน + หลักฐานการโอน |
| `production_jobs` | ใบงานผลิต (`JOB-000001`) |
| `production_logs` | ไทม์ไลน์การเปลี่ยนสถานะงานผลิต |
| `shipments` | การจัดส่ง — เลขพัสดุ / บริษัทขนส่ง / วันที่ส่ง |

## ระบบอัตโนมัติ (Triggers)

- **เลขที่เอกสารอัตโนมัติ** — `quotes.quote_number` → `QUO-000001`, `production_jobs.job_number` → `JOB-000001`
- **สร้างใบงานอัตโนมัติ** — เมื่อ `quotes.status` เปลี่ยนเป็น `approved` ระบบสร้าง `production_jobs` ให้ทันที พร้อมประมาณ `due_date` จากระยะเวลาผลิตของรายการ
- **บันทึก log อัตโนมัติ** — ทุกครั้งที่ `production_jobs.status` เปลี่ยน จะเพิ่มแถวใน `production_logs`
- **`updated_at` อัตโนมัติ** ทุกตาราง
- **สร้าง profile อัตโนมัติ** — เมื่อมีผู้สมัครใหม่ใน Supabase Auth จะเพิ่มแถวใน `public.users`

## วิธีติดตั้ง

### ตัวเลือก A — Supabase SQL Editor
1. เปิด Supabase Dashboard → SQL Editor
2. รันไฟล์ตามลำดับ: `0001_schema.sql` → `0002_rls.sql` → `seed.sql`

### ตัวเลือก B — Supabase CLI
```bash
supabase db push          # หรือ
psql "$DATABASE_URL" -f database/migrations/0001_schema.sql
psql "$DATABASE_URL" -f database/migrations/0002_rls.sql
psql "$DATABASE_URL" -f database/seed.sql
```

## Storage buckets

สร้าง bucket ใน Supabase Storage ก่อนใช้งานหน้า Instant Quote:
- **`artwork`** — ไฟล์งานที่ลูกค้าอัปโหลด (ใช้โดย `POST /api/upload`); ตั้งเป็น public หากต้องการเปิดดูไฟล์ผ่าน URL ได้ทันที
- `payment-slips` — หลักฐานการโอน (ใช้ภายหลัง)
- `avatars` — รูปโปรไฟล์พนักงาน (ใช้ภายหลัง)

## หมายเหตุเรื่อง RLS

Phase 1 ตั้งค่าแบบพื้นฐาน:
- `products`, `pricing_rules` — อ่านได้สาธารณะ (ใช้บนเว็บไซต์ + Instant Quote), เขียนเฉพาะพนักงาน
- ตารางภายในอื่น ๆ — เข้าถึงเฉพาะผู้ใช้ที่ล็อกอิน (`authenticated`)

สามารถปรับเป็น role-based (admin / sales / production / shipping) ได้ภายหลังด้วย helper `public.current_user_role()`
