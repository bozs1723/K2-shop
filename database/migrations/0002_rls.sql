-- =============================================================================
-- K2 Factory OS — Row Level Security (RLS) Policies
-- Migration: 0002_rls.sql  (รันหลัง 0001_schema.sql)
--
-- หลักการ Phase 1:
--   - products / pricing_rules : เปิดให้อ่านสาธารณะ (anon) เพราะใช้บนเว็บไซต์
--     และหน้า Instant Quote ; การแก้ไขสงวนไว้ให้พนักงาน (authenticated)
--   - ตารางภายในอื่น ๆ : เข้าถึงได้เฉพาะผู้ใช้ที่ล็อกอิน (authenticated)
--   - สามารถปรับให้ละเอียดตาม role ภายหลังได้ (admin/sales/production/shipping)
-- =============================================================================

-- helper: อ่าน role ของผู้ใช้ปัจจุบันจากตาราง users
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- helper: เป็น admin หรือไม่
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- ---------------------------------------------------------------------------
-- เปิดใช้งาน RLS ทุกตาราง
-- ---------------------------------------------------------------------------
alter table public.users            enable row level security;
alter table public.customers        enable row level security;
alter table public.products         enable row level security;
alter table public.pricing_rules    enable row level security;
alter table public.quotes           enable row level security;
alter table public.quote_items      enable row level security;
alter table public.payments         enable row level security;
alter table public.production_jobs  enable row level security;
alter table public.production_logs  enable row level security;
alter table public.shipments        enable row level security;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create policy "users readable by authenticated"
  on public.users for select to authenticated using (true);

create policy "users update self or admin"
  on public.users for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- products / pricing_rules : อ่านได้สาธารณะ, เขียนเฉพาะพนักงาน
-- ---------------------------------------------------------------------------
create policy "products public read"
  on public.products for select to anon, authenticated using (true);
create policy "products staff write"
  on public.products for all to authenticated using (true) with check (true);

create policy "pricing_rules public read"
  on public.pricing_rules for select to anon, authenticated using (true);
create policy "pricing_rules staff write"
  on public.pricing_rules for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- ตารางภายใน : เฉพาะผู้ใช้ที่ล็อกอิน (ทำทุกอย่างได้)
-- ปรับเป็นแบบ role-based ได้ภายหลัง
-- ---------------------------------------------------------------------------
create policy "customers authenticated all"
  on public.customers for all to authenticated using (true) with check (true);

create policy "quotes authenticated all"
  on public.quotes for all to authenticated using (true) with check (true);

create policy "quote_items authenticated all"
  on public.quote_items for all to authenticated using (true) with check (true);

create policy "payments authenticated all"
  on public.payments for all to authenticated using (true) with check (true);

create policy "production_jobs authenticated all"
  on public.production_jobs for all to authenticated using (true) with check (true);

create policy "production_logs authenticated all"
  on public.production_logs for all to authenticated using (true) with check (true);

create policy "shipments authenticated all"
  on public.shipments for all to authenticated using (true) with check (true);
