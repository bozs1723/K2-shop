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
| 1 | Website (Hero / หมวดสินค้า / รีวิว / Portfolio / ขั้นตอนสั่งงาน) | 🟡 Landing เบื้องต้น |
| 2 | Instant Quote (คำนวณราคาอัตโนมัติ + อัปโหลดไฟล์) | ⚪ schema + engine พร้อม |
| 3 | CRM ลูกค้า | ⚪ schema พร้อม |
| 4 | Quotation (Draft / Sent / Approved / Rejected) | ⚪ schema พร้อม |
| 5 | Deposit (มัดจำ + หลักฐานการโอน) | ⚪ schema พร้อม |
| 6 | Production Job (เปิดใบงานอัตโนมัติ `JOB-000001`) | ⚪ schema + trigger พร้อม |
| 7 | Production Queue (รอผลิต → ผลิต → QC → แพ็ก → ส่ง) | ⚪ schema พร้อม |
| 8 | Shipping (เลขพัสดุ / ขนส่ง / วันที่ส่ง) | ⚪ schema พร้อม |
| — | Admin Dashboard (ยอดขาย / ใบเสนอราคา / งานผลิต / ใกล้ครบกำหนด) | ⚪ schema พร้อม |

> หมายเหตุ: รอบนี้โฟกัสที่ **Database Schema + Project Structure** ตามที่ตกลงไว้ — ยังไม่ทำ AI / HR / Payroll

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
