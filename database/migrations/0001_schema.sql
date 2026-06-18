-- =============================================================================
-- K2 Factory OS — Database Schema (Phase 1)
-- Migration: 0001_schema.sql
--
-- ระบบบริหารโรงงานผลิตงานพิมพ์และป้ายครบวงจร
-- ครอบคลุม: Website / Instant Quote / CRM / Quotation / Deposit /
--           Production Job / Production Queue / Shipping
--
-- หมายเหตุ: รันไฟล์นี้ก่อน แล้วตามด้วย 0002_rls.sql และ seed.sql
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- ค้นหาแบบ fuzzy (ชื่อลูกค้า ฯลฯ)

-- ----------------------------------------------------------------------------
-- Enums (ประเภทข้อมูลแบบกำหนดค่า)
-- ----------------------------------------------------------------------------

-- บทบาทผู้ใช้งานภายในระบบ
do $$ begin
  create type user_role as enum ('admin', 'sales', 'production', 'shipping', 'viewer');
exception when duplicate_object then null; end $$;

-- หมวดสินค้า (Phase 1)
do $$ begin
  create type product_category as enum ('qr_sign', 'acrylic_keychain', 'dtg_shirt', 'sticker');
exception when duplicate_object then null; end $$;

-- ประเภทกฎราคา สำหรับ Instant Quote
do $$ begin
  create type pricing_rule_type as enum ('size', 'material', 'quantity_tier', 'option', 'setup');
exception when duplicate_object then null; end $$;

-- วิธีคิดราคาของกฎแต่ละข้อ
do $$ begin
  create type price_modifier as enum ('flat', 'per_unit', 'multiplier');
exception when duplicate_object then null; end $$;

-- สถานะใบเสนอราคา: Draft / Sent / Approved / Rejected
do $$ begin
  create type quote_status as enum ('draft', 'sent', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ประเภทการชำระเงิน
do $$ begin
  create type payment_type as enum ('deposit', 'balance', 'full');
exception when duplicate_object then null; end $$;

-- สถานะการชำระเงิน
do $$ begin
  create type payment_status as enum ('pending', 'paid', 'refunded');
exception when duplicate_object then null; end $$;

-- สถานะคิวการผลิต: รอผลิต / กำลังผลิต / QC / แพ็กสินค้า / จัดส่งแล้ว
do $$ begin
  create type production_status as enum ('queued', 'in_production', 'qc', 'packing', 'shipped');
exception when duplicate_object then null; end $$;

-- สถานะการจัดส่ง
do $$ begin
  create type shipment_status as enum ('preparing', 'shipped', 'in_transit', 'delivered', 'returned');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------

-- อัปเดต updated_at อัตโนมัติทุกครั้งที่มีการแก้ไขแถว
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- TABLE: users (พนักงาน/ผู้ใช้งานระบบ — ผูกกับ Supabase Auth)
-- =============================================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  phone       text,
  role        user_role not null default 'viewer',
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is 'ผู้ใช้งานภายในระบบ (พนักงาน) ผูกกับ auth.users';

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- สร้างแถวใน public.users อัตโนมัติเมื่อมีผู้สมัครใหม่ใน Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- TABLE: customers (CRM ลูกค้า)
-- =============================================================================
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text,
  line_id       text,
  email         text,
  company       text,
  address       text,
  tax_id        text,
  notes         text,
  created_by    uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.customers is 'ข้อมูลลูกค้า (CRM): ชื่อ เบอร์โทร LINE และประวัติการสั่งซื้อผ่านความสัมพันธ์ quotes';

create index if not exists idx_customers_name_trgm on public.customers using gin (name gin_trgm_ops);
create index if not exists idx_customers_phone on public.customers (phone);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: products (หมวดสินค้า: ป้าย QR / พวงกุญแจอะคริลิก / เสื้อ DTG / สติ๊กเกอร์)
-- =============================================================================
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  category          product_category not null,
  description       text,
  base_price        numeric(12,2) not null default 0,   -- ราคาตั้งต้นต่อหน่วย
  unit              text not null default 'ชิ้น',
  production_days   integer not null default 3,          -- ระยะเวลาผลิตเริ่มต้น (วัน)
  min_quantity      integer not null default 1,
  image_url         text,
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.products is 'สินค้า/บริการที่โรงงานรับผลิต ใช้เป็นฐานของ Instant Quote';

create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_active on public.products (is_active);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: pricing_rules (กฎการคำนวณราคา สำหรับ Instant Quote)
-- =============================================================================
create table if not exists public.pricing_rules (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  rule_type       pricing_rule_type not null,
  key             text not null,                 -- รหัสตัวเลือก เช่น 'a4', 'pvc', 'tier_100'
  label           text not null,                 -- ชื่อแสดงผล เช่น 'ขนาด A4', 'วัสดุ PVC'
  modifier        price_modifier not null default 'per_unit',
  value           numeric(12,4) not null default 0,  -- จำนวนเงิน หรือ ตัวคูณ (กรณี multiplier)
  min_qty         integer,                       -- ใช้กับ quantity_tier
  max_qty         integer,                       -- ใช้กับ quantity_tier
  extra_days      integer not null default 0,    -- เพิ่มระยะเวลาผลิต (วัน)
  is_default      boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.pricing_rules is 'กฎคิดราคาแยกตามขนาด/วัสดุ/จำนวน/ตัวเลือก ของแต่ละสินค้า';

create index if not exists idx_pricing_rules_product on public.pricing_rules (product_id, rule_type);

create trigger trg_pricing_rules_updated_at
  before update on public.pricing_rules
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Sequences สำหรับเลขที่เอกสาร (QUO-000001 / JOB-000001)
-- =============================================================================
create sequence if not exists public.quote_number_seq start 1;
create sequence if not exists public.job_number_seq start 1;

-- =============================================================================
-- TABLE: quotes (ใบเสนอราคา)
-- =============================================================================
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  quote_number    text unique,                   -- QUO-000001 (สร้างอัตโนมัติ)
  customer_id     uuid not null references public.customers(id) on delete restrict,
  status          quote_status not null default 'draft',
  currency        text not null default 'THB',
  subtotal        numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  tax             numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  deposit_percent numeric(5,2) not null default 50,    -- % มัดจำ
  deposit_amount  numeric(12,2) not null default 0,
  valid_until     date,
  notes           text,
  created_by      uuid references public.users(id) on delete set null,
  sent_at         timestamptz,
  approved_at     timestamptz,
  rejected_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.quotes is 'ใบเสนอราคา สถานะ: draft/sent/approved/rejected';

create index if not exists idx_quotes_customer on public.quotes (customer_id);
create index if not exists idx_quotes_status on public.quotes (status);

create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- สร้าง quote_number อัตโนมัติเมื่อ insert
create or replace function public.assign_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.quote_number is null then
    new.quote_number := 'QUO-' || lpad(nextval('public.quote_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger trg_quotes_assign_number
  before insert on public.quotes
  for each row execute function public.assign_quote_number();

-- =============================================================================
-- TABLE: quote_items (รายการในใบเสนอราคา — มาจาก Instant Quote)
-- =============================================================================
create table if not exists public.quote_items (
  id              uuid primary key default gen_random_uuid(),
  quote_id        uuid not null references public.quotes(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  description     text not null,
  size            text,
  material        text,
  options         jsonb not null default '{}'::jsonb,   -- ตัวเลือกเพิ่มเติมจาก Instant Quote
  quantity        integer not null default 1,
  unit_price      numeric(12,2) not null default 0,
  amount          numeric(12,2) not null default 0,
  file_url        text,                                 -- ไฟล์งานที่ลูกค้าอัปโหลด (Supabase Storage)
  production_days integer not null default 0,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

comment on table public.quote_items is 'รายการสินค้าในใบเสนอราคา พร้อมไฟล์งานที่อัปโหลด';

create index if not exists idx_quote_items_quote on public.quote_items (quote_id);

-- =============================================================================
-- TABLE: payments (Deposit / การชำระเงิน)
-- =============================================================================
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references public.quotes(id) on delete cascade,
  type          payment_type not null default 'deposit',
  status        payment_status not null default 'pending',
  amount        numeric(12,2) not null default 0,        -- ยอดมัดจำ/ยอดชำระ
  paid_at       date,                                    -- วันที่ชำระ
  method        text,                                    -- เช่น โอนธนาคาร, เงินสด
  reference     text,                                    -- เลขอ้างอิง/เลขที่รายการ
  slip_url      text,                                    -- หลักฐานการโอน (Supabase Storage)
  note          text,
  recorded_by   uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.payments is 'บันทึกการชำระเงิน รวมยอดมัดจำ วันที่ชำระ และหลักฐานการโอน';

create index if not exists idx_payments_quote on public.payments (quote_id);

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: production_jobs (ใบงานผลิต — สร้างอัตโนมัติเมื่อ Quote ถูก Approve)
-- =============================================================================
create table if not exists public.production_jobs (
  id            uuid primary key default gen_random_uuid(),
  job_number    text unique,                       -- JOB-000001 (สร้างอัตโนมัติ)
  quote_id      uuid references public.quotes(id) on delete set null,
  customer_id   uuid references public.customers(id) on delete set null,
  status        production_status not null default 'queued',  -- คิวการผลิต
  priority      integer not null default 3,        -- 1 = ด่วนสุด
  due_date      date,                              -- กำหนดส่ง
  assigned_to   uuid references public.users(id) on delete set null,
  started_at    timestamptz,
  completed_at  timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.production_jobs is 'ใบงานผลิต สร้างอัตโนมัติเมื่อใบเสนอราคาได้รับการอนุมัติ';

create index if not exists idx_production_jobs_status on public.production_jobs (status);
create index if not exists idx_production_jobs_due on public.production_jobs (due_date);
create index if not exists idx_production_jobs_quote on public.production_jobs (quote_id);

create trigger trg_production_jobs_updated_at
  before update on public.production_jobs
  for each row execute function public.set_updated_at();

-- สร้าง job_number อัตโนมัติเมื่อ insert
create or replace function public.assign_job_number()
returns trigger
language plpgsql
as $$
begin
  if new.job_number is null then
    new.job_number := 'JOB-' || lpad(nextval('public.job_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger trg_production_jobs_assign_number
  before insert on public.production_jobs
  for each row execute function public.assign_job_number();

-- =============================================================================
-- TABLE: production_logs (ไทม์ไลน์การเปลี่ยนสถานะงานผลิต)
-- =============================================================================
create table if not exists public.production_logs (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.production_jobs(id) on delete cascade,
  status_from   production_status,
  status_to     production_status not null,
  note          text,
  logged_by     uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

comment on table public.production_logs is 'บันทึกประวัติการเปลี่ยนสถานะของใบงานผลิต';

create index if not exists idx_production_logs_job on public.production_logs (job_id, created_at);

-- บันทึก log อัตโนมัติทุกครั้งที่ status ของ production_jobs เปลี่ยน
create or replace function public.log_production_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.production_logs (job_id, status_from, status_to, note, logged_by)
    values (new.id, null, new.status, 'สร้างใบงาน', new.assigned_to);
  elsif new.status is distinct from old.status then
    insert into public.production_logs (job_id, status_from, status_to, logged_by)
    values (new.id, old.status, new.status, new.assigned_to);
  end if;
  return new;
end;
$$;

create trigger trg_production_jobs_log
  after insert or update of status on public.production_jobs
  for each row execute function public.log_production_status();

-- =============================================================================
-- TABLE: shipments (การจัดส่ง)
-- =============================================================================
create table if not exists public.shipments (
  id                uuid primary key default gen_random_uuid(),
  job_id            uuid not null references public.production_jobs(id) on delete cascade,
  tracking_number   text,                          -- เลขพัสดุ
  carrier           text,                          -- บริษัทขนส่ง (Kerry, Flash, ไปรษณีย์ไทย ฯลฯ)
  status            shipment_status not null default 'preparing',
  shipped_at        date,                          -- วันที่ส่ง
  delivered_at      date,
  recipient_name    text,
  recipient_phone   text,
  recipient_address text,
  cost              numeric(12,2) not null default 0,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.shipments is 'ข้อมูลการจัดส่ง: เลขพัสดุ บริษัทขนส่ง และวันที่ส่ง';

create index if not exists idx_shipments_job on public.shipments (job_id);
create index if not exists idx_shipments_tracking on public.shipments (tracking_number);

create trigger trg_shipments_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- AUTOMATION: เมื่อ Quote เปลี่ยนสถานะเป็น 'approved' ให้สร้าง Production Job อัตโนมัติ
-- =============================================================================
create or replace function public.create_job_on_quote_approval()
returns trigger
language plpgsql
as $$
declare
  v_max_days integer;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    -- ตั้ง approved_at หากยังไม่มี
    if new.approved_at is null then
      new.approved_at := now();
    end if;

    -- หาวันผลิตสูงสุดจากรายการในใบเสนอราคา เพื่อประมาณ due_date
    select coalesce(max(production_days), 3) into v_max_days
    from public.quote_items where quote_id = new.id;

    -- สร้างใบงานเฉพาะเมื่อยังไม่เคยสร้างจาก quote นี้
    if not exists (select 1 from public.production_jobs where quote_id = new.id) then
      insert into public.production_jobs (quote_id, customer_id, status, due_date, notes)
      values (
        new.id,
        new.customer_id,
        'queued',
        (current_date + (v_max_days || ' days')::interval)::date,
        'สร้างอัตโนมัติจากใบเสนอราคา ' || coalesce(new.quote_number, new.id::text)
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_quotes_create_job
  before update of status on public.quotes
  for each row execute function public.create_job_on_quote_approval();
