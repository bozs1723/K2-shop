# คู่มือติดตั้ง K2 Factory OS (End-to-End)

คู่มือนี้ทำให้ระบบฝั่งลูกค้า (ดูสินค้า → ขอราคา → อัปโหลดไฟล์ → ส่งคำขอ → ติดตามงาน) **ใช้งานได้จริงตั้งแต่ต้นจนจบ** ทำตามทีละขั้นได้เลย แม้ไม่ใช่ผู้พัฒนา

---

## ส่วนที่ 1 — ค่า Environment ที่ต้องใช้

ระบบใช้ค่าทั้งหมด **3 ตัว** (คัดลอกจาก `.env.example` ไปเป็นไฟล์ `.env.local`)

| ตัวแปร | ใช้ทำอะไร | หาได้จาก |
|--------|-----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ที่อยู่โปรเจกต์ Supabase | Supabase Dashboard → Project Settings → **API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | กุญแจสาธารณะ (ฝั่งเบราว์เซอร์ + อ่านสินค้า/ราคา) | หน้าเดียวกัน → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | กุญแจฝั่งเซิร์ฟเวอร์ (สร้างใบเสนอราคา/อัปโหลด/ติดตามงาน) | หน้าเดียวกัน → **service_role** ⚠️ ความลับสูง |

> ⚠️ **ห้าม** นำ `service_role` ไปใส่ตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_` และห้าม commit ไฟล์ `.env.local` ขึ้น git (ถูก ignore ไว้แล้ว)

```bash
cp .env.example .env.local
# จากนั้นเปิด .env.local แล้วใส่ค่าจริงทั้ง 3 ตัว
```

---

## ส่วนที่ 2 — ติดตั้งฐานข้อมูล (เลือก 1 วิธี)

ต้องรัน SQL **4 ส่วนตามลำดับ**: schema → rls → storage → seed

### วิธี A — Supabase SQL Editor (แนะนำ ไม่ต้องลงโปรแกรม)

> หมายเหตุ: `setup_all.sql` ใช้คำสั่ง `\i` ซึ่งเป็นของโปรแกรม `psql` เท่านั้น **ใช้ไม่ได้** บน SQL Editor — บน SQL Editor ต้องเปิดทีละไฟล์

1. เปิด Supabase Dashboard → เมนู **SQL Editor** → **New query**
2. เปิดไฟล์ `database/migrations/0001_schema.sql` คัดลอกเนื้อหาทั้งหมดไปวาง แล้วกด **Run**
3. ทำซ้ำกับ `database/migrations/0002_rls.sql` → **Run**
4. ทำซ้ำกับ `database/migrations/0003_storage.sql` → **Run** (สร้าง bucket `artwork`)
5. ทำซ้ำกับ `database/seed.sql` → **Run** (ใส่สินค้า 4 หมวด + กฎราคา)

**Expected result:** แต่ละครั้งขึ้น "Success. No rows returned" (หรือคล้ายกัน) ไม่มีข้อความ error สีแดง

### วิธี B — เครื่อง local ด้วย psql

```bash
cd database
psql "$DATABASE_URL" -f setup_all.sql
```
(`$DATABASE_URL` หาได้จาก Supabase → Project Settings → Database → Connection string)

**Expected result:** เห็นข้อความ `>> 1/4 ... >> 4/4 ... เสร็จสิ้น` โดยไม่มี error

---

## ส่วนที่ 3 — ตรวจ bucket `artwork`

ไฟล์ `0003_storage.sql` สร้าง bucket ให้อัตโนมัติแล้ว ตรวจได้ที่ Supabase → **Storage** ควรเห็น bucket ชื่อ `artwork`

หากไม่เห็น สร้างเองผ่าน UI: **Storage → New bucket** → ชื่อ `artwork` → ติ๊ก **Public bucket** → Create

### ⚠️ Storage Security (อ่านให้เข้าใจ)

- ตอนนี้ bucket `artwork` เป็น **public** — แปลว่า **ไฟล์งานของลูกค้าเปิดดูได้ผ่าน URL** โดยไม่ต้องล็อกอิน (URL เดายาก แต่ถ้าหลุดก็เปิดได้)
- เหมาะกับช่วง **MVP** เท่านั้น
- **แผนอนาคต (เมื่อขึ้น production จริง):** เปลี่ยนเป็น **private bucket** แล้วออก **signed URL** (หมดอายุได้) เฉพาะตอนต้องเปิดไฟล์ — ปรับที่ `/api/upload` (เก็บ path แทน public URL) และเพิ่ม endpoint สร้าง signed URL
- การ **อัปโหลด** ปลอดภัยอยู่แล้ว: ทำผ่าน `/api/upload` ฝั่งเซิร์ฟเวอร์ด้วย service-role เท่านั้น (ไม่เปิดให้ผู้ใช้ทั่วไปเขียน bucket ได้)

---

## ส่วนที่ 4 — รันแอปและตรวจการเชื่อมต่อ

```bash
npm install
npm run dev
```

เปิดหน้า health-check (เฉพาะตอน dev): **http://localhost:3000/debug/supabase**

**Expected result:** เห็น ✅ ครบทุกข้อ
- Environment ครบ 3 ตัว ✅
- เชื่อมต่อ Supabase ✅
- จำนวนสินค้า > 0 (ควรเป็น 4) ✅
- จำนวนกฎราคา > 0 ✅
- Storage bucket "artwork" ✅

> หน้านี้จะ **หายไป (404) อัตโนมัติบน production** และไม่แสดงค่า env จริง แสดงเฉพาะสถานะ

---

## ส่วนที่ 5 — End-to-End Test Checklist

ทำตามทีละ Step พร้อมตรวจ "ผลที่ควรได้" (Expected) ในแต่ละขั้น

### Step 1 — ดูสินค้า
1. เปิด `http://localhost:3000/products`
- **Expected:** เห็นสินค้า 4 รายการ (ป้าย QR, พวงกุญแจอะคริลิก, เสื้อ DTG, สติ๊กเกอร์) และกดแท็บกรองหมวดได้

### Step 2 — ขอราคา (Instant Quote)
1. กด **ขอราคา** ที่สินค้าใดก็ได้ (หรือเปิด `/quote`)
2. ลองเปลี่ยน **ขนาด / วัสดุ / ตัวเลือกเพิ่มเติม / จำนวน**
- **Expected:** "ราคาประมาณการ" และ "ระยะเวลาผลิต" ทางขวา (บนมือถืออยู่ด้านล่าง) เปลี่ยนตามทันที

### Step 3 — อัปโหลดไฟล์งาน
1. กดกล่องอัปโหลด เลือกรูป (.jpg/.png) หรือ .pdf
- **Expected:** ขึ้นชื่อไฟล์พร้อมปุ่ม "ลบ"
2. ลองไฟล์ใหญ่เกิน 20MB หรือไฟล์นามสกุลอื่น (เช่น .zip)
- **Expected:** ขึ้นข้อความเตือน ไม่ให้อัปโหลด

### Step 4 — ส่งคำขอใบเสนอราคา
1. กรอก **ชื่อ** และ **เบอร์โทร** (เบอร์ไทยขึ้นต้น 0)
2. กด **ส่งคำขอใบเสนอราคา**
- **Expected:** เด้งไปหน้า success แสดงเลข **QUO-000001** (หรือเลขถัดไป) พร้อมสรุปยอดรวมและมัดจำ

### Step 5 — ตรวจข้อมูลในฐานข้อมูล
1. ไปที่ Supabase → **Table Editor**
- **Expected:** มีแถวใหม่ใน `customers` (ชื่อ/เบอร์ที่กรอก), `quotes` (status = `sent`), และ `quote_items`

### Step 6 — ติดตามงาน
1. เปิด `/track` กรอก **เลข QUO-xxxxxx** + **เบอร์โทรเดียวกับที่สั่ง**
- **Expected:** เห็นการ์ดใบเสนอราคา + แถบสถานะการผลิต (ยังไม่เริ่มผลิต)
2. ลองกรอกเบอร์ผิด
- **Expected:** ขึ้น "ไม่พบรายการ..." (กันการดูข้อมูลผู้อื่น)

### Step 7 — (ตัวเลือก) ทดสอบเปิดใบงานอัตโนมัติ
1. ใน Supabase → Table Editor → ตาราง `quotes` แก้ `status` ของใบที่สร้างเป็น `approved` → Save
2. เปิดตาราง `production_jobs`
- **Expected:** มีใบงานใหม่ **JOB-000001** ผูกกับ quote นั้นอัตโนมัติ (จาก trigger)
3. กลับไปหน้า `/track` ค้นหาอีกครั้ง
- **Expected:** เห็นเลข JOB และแถบสถานะการผลิตเริ่มทำงาน

---

## สรุปลำดับสั้น ๆ

1. `cp .env.example .env.local` → ใส่ค่า 3 ตัว
2. รัน SQL 4 ไฟล์ (schema → rls → storage → seed)
3. ตรวจ bucket `artwork` มีอยู่
4. `npm run dev` → เปิด `/debug/supabase` ให้ขึ้น ✅ ครบ
5. ทดสอบตาม Step 1–7
