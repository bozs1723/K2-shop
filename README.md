# K2 Factory OS

> ระบบบริหารโรงงานผลิตงานพิมพ์และป้ายครบวงจร — ไม่ใช่แค่เว็บไซต์ขายสินค้า แต่เป็น **Operating System** ของบริษัท

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** (Theme: White / Black / Orange — สไตล์ Apple / Stripe / Linear / Notion)
- **Supabase** — PostgreSQL + Auth + Storage

## โครงสร้างโปรเจกต์

```
k2-factory-os/
├── app/                  # หน้าเว็บ (App Router) — Landing + (จะเพิ่ม) dashboard, quote, ฯลฯ
├── components/           # React components
│   └── ui/               # ปุ่ม / การ์ด / badge (theme)
├── lib/                  # โค้ดหลัก
│   ├── supabase/         # client / server / middleware clients
│   ├── constants.ts      # label ภาษาไทย + ค่าคงที่
│   ├── utils.ts          # ฟอร์แมตเงิน/วันที่ ฯลฯ
│   └── pricing.ts        # engine คำนวณราคา Instant Quote
├── database/             # PostgreSQL schema สำหรับ Supabase
│   ├── migrations/       # 0001_schema.sql, 0002_rls.sql
│   ├── seed.sql          # ข้อมูลตัวอย่าง
│   └── README.md
├── types/                # TypeScript types ของฐานข้อมูล
├── hooks/                # React hooks (useUser ฯลฯ)
└── middleware.ts         # รีเฟรช session + ป้องกันเส้นทาง /dashboard
```

## ฟีเจอร์ (Phase 1)

| # | ระบบ | สถานะ |
|---|------|-------|
| 1 | Website (Hero / หมวดสินค้า / ขั้นตอนสั่งงาน) | 🟢 Landing + `/products` พร้อม |
| 2 | Instant Quote (คำนวณราคาอัตโนมัติ + อัปโหลดไฟล์) | 🟢 หน้า `/quote` + engine + upload พร้อม |
| 3 | CRM ลูกค้า | 🟡 บันทึกลูกค้าอัตโนมัติตอนขอราคา (ยังไม่มี UI จัดการ) |
| 4 | Quotation (Draft / Sent / Approved / Rejected) | 🟡 สร้าง quote(status=sent) อัตโนมัติ (ยังไม่มี UI จัดการ) |
| 5 | Deposit (มัดจำ + หลักฐานการโอน) | ⚪ schema พร้อม |
| 6 | Production Job (เปิดใบงานอัตโนมัติ `JOB-000001`) | ⚪ schema + trigger พร้อม |
| 7 | Production Queue (รอผลิต → ผลิต → QC → แพ็ก → ส่ง) | 🟡 ลูกค้าติดตามได้ที่ `/track` (ยังไม่มี UI ฝ่ายผลิต) |
| 8 | Shipping (เลขพัสดุ / ขนส่ง / วันที่ส่ง) | 🟡 แสดงใน `/track` (ยังไม่มี UI ฝ่ายจัดส่ง) |
| — | Admin Dashboard (ยอดขาย / ใบเสนอราคา / งานผลิต / ใกล้ครบกำหนด) | ⚪ schema พร้อม |

### หน้าฝั่งลูกค้า (Sprint 2 — Customer First)
- `/` Landing · `/products` แคตตาล็อก · `/quote` Instant Quote · `/quote/success` ยืนยัน · `/track` ติดตามงาน
- API: `POST /api/quotes` (คำนวณราคาซ้ำฝั่ง server), `POST /api/upload` (ไฟล์ ≤20MB), `GET /api/track` (ref + phone)

> หมายเหตุ: ยังไม่ทำ CRM UI / Admin Dashboard / Production Queue (ฝ่ายผลิต) / Shipping UI / AI / HR / Payroll

## การตั้งค่า

### 1. ติดตั้ง dependencies
```bash
npm install
```

### 2. ตั้งค่า environment
```bash
cp .env.example .env.local
# แล้วใส่ค่าจาก Supabase Dashboard → Project Settings → API
```

### 3. ติดตั้ง Database
รัน SQL ตามลำดับใน Supabase SQL Editor (ดูรายละเอียดที่ `database/README.md`):
```
database/migrations/0001_schema.sql
database/migrations/0002_rls.sql
database/seed.sql
```

### 4. สร้าง Storage buckets (สำหรับไฟล์งาน/สลิป)
สร้าง bucket ใน Supabase Storage: `artwork`, `payment-slips`, `avatars`

### 5. รันโปรเจกต์
```bash
npm run dev
```
เปิด [http://localhost:3000](http://localhost:3000)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รันโหมดพัฒนา |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production server |
| `npm run lint` | ตรวจ ESLint |
