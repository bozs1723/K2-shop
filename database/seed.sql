-- =============================================================================
-- K2 Factory OS — Seed Data (ตัวอย่างข้อมูลเริ่มต้น)
-- รันหลัง 0001_schema.sql และ 0002_rls.sql
--
-- ครอบคลุมหมวดสินค้า Phase 1 พร้อมกฎราคาตัวอย่างสำหรับ Instant Quote
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Products (หมวดสินค้า)
-- ---------------------------------------------------------------------------
insert into public.products (slug, name, category, description, base_price, unit, production_days, min_quantity, sort_order)
values
  ('qr-sign',          'ป้าย QR Code',        'qr_sign',          'ป้าย QR Code สแกนเชื่อมต่อเมนู/ลิงก์ วัสดุแข็งแรง ทนแดดทนฝน', 150, 'ชิ้น', 3, 1, 1),
  ('acrylic-keychain', 'พวงกุญแจอะคริลิก',     'acrylic_keychain', 'พวงกุญแจอะคริลิกตัดตามรูป พิมพ์ UV สีคมชัด',                  35,  'ชิ้น', 5, 10, 2),
  ('dtg-shirt',        'เสื้อ DTG',           'dtg_shirt',        'เสื้อพิมพ์ลายระบบ DTG (Direct to Garment) สีสดทุกดีไซน์',      199, 'ตัว',  4, 1, 3),
  ('sticker',          'สติ๊กเกอร์',          'sticker',          'สติ๊กเกอร์ไดคัท/ฉลากสินค้า กันน้ำ พิมพ์คุณภาพสูง',            5,   'ดวง', 2, 50, 4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Pricing rules — ป้าย QR Code
-- ---------------------------------------------------------------------------
with p as (select id from public.products where slug = 'qr-sign')
insert into public.pricing_rules (product_id, rule_type, key, label, modifier, value, min_qty, max_qty, extra_days, is_default, sort_order)
select p.id, v.rule_type::pricing_rule_type, v.key, v.label, v.modifier::price_modifier, v.value, v.min_qty, v.max_qty, v.extra_days, v.is_default, v.sort_order
from p, (values
  ('size','10x10','ขนาด 10x10 ซม.','per_unit',0,    null::int, null::int, 0, true,  1),
  ('size','20x20','ขนาด 20x20 ซม.','per_unit',120,  null, null, 0, false, 2),
  ('size','30x30','ขนาด 30x30 ซม.','per_unit',280,  null, null, 1, false, 3),
  ('material','pvc','วัสดุ PVC',     'per_unit',0,    null, null, 0, true,  1),
  ('material','acrylic','วัสดุอะคริลิก','per_unit',150, null, null, 1, false, 2),
  ('material','metal','วัสดุเมทัล',  'per_unit',350,  null, null, 2, false, 3),
  ('quantity_tier','tier_1','1-9 ชิ้น',   'multiplier',1.00, 1,   9,   0, true,  1),
  ('quantity_tier','tier_10','10-49 ชิ้น','multiplier',0.90, 10,  49,  0, false, 2),
  ('quantity_tier','tier_50','50+ ชิ้น',  'multiplier',0.80, 50,  null,0, false, 3)
) as v(rule_type,key,label,modifier,value,min_qty,max_qty,extra_days,is_default,sort_order);

-- ---------------------------------------------------------------------------
-- Pricing rules — พวงกุญแจอะคริลิก
-- ---------------------------------------------------------------------------
with p as (select id from public.products where slug = 'acrylic-keychain')
insert into public.pricing_rules (product_id, rule_type, key, label, modifier, value, min_qty, max_qty, extra_days, is_default, sort_order)
select p.id, v.rule_type::pricing_rule_type, v.key, v.label, v.modifier::price_modifier, v.value, v.min_qty, v.max_qty, v.extra_days, v.is_default, v.sort_order
from p, (values
  ('size','3cm','ขนาด 3 ซม.','per_unit',0,   null::int, null::int, 0, true,  1),
  ('size','5cm','ขนาด 5 ซม.','per_unit',15,  null, null, 0, false, 2),
  ('size','7cm','ขนาด 7 ซม.','per_unit',30,  null, null, 0, false, 3),
  ('option','epoxy','เคลือบ Epoxy','per_unit',10, null, null, 1, false, 1),
  ('quantity_tier','tier_10','10-49 ชิ้น','multiplier',1.00, 10,  49,  0, true,  1),
  ('quantity_tier','tier_50','50-199 ชิ้น','multiplier',0.85, 50, 199, 0, false, 2),
  ('quantity_tier','tier_200','200+ ชิ้น','multiplier',0.70, 200, null,0, false, 3)
) as v(rule_type,key,label,modifier,value,min_qty,max_qty,extra_days,is_default,sort_order);

-- ---------------------------------------------------------------------------
-- Pricing rules — เสื้อ DTG
-- ---------------------------------------------------------------------------
with p as (select id from public.products where slug = 'dtg-shirt')
insert into public.pricing_rules (product_id, rule_type, key, label, modifier, value, min_qty, max_qty, extra_days, is_default, sort_order)
select p.id, v.rule_type::pricing_rule_type, v.key, v.label, v.modifier::price_modifier, v.value, v.min_qty, v.max_qty, v.extra_days, v.is_default, v.sort_order
from p, (values
  ('size','s','ไซส์ S',   'per_unit',0,  null::int, null::int, 0, false, 1),
  ('size','m','ไซส์ M',   'per_unit',0,  null, null, 0, true,  2),
  ('size','l','ไซส์ L',   'per_unit',0,  null, null, 0, false, 3),
  ('size','xl','ไซส์ XL', 'per_unit',20, null, null, 0, false, 4),
  ('material','cotton','ผ้าคอตตอน 100%','per_unit',0,  null, null, 0, true,  1),
  ('material','tk','ผ้า TK','per_unit',-30, null, null, 0, false, 2),
  ('option','front_back','พิมพ์หน้า-หลัง','per_unit',60, null, null, 1, false, 1),
  ('quantity_tier','tier_1','1-9 ตัว',  'multiplier',1.00, 1,  9,   0, true,  1),
  ('quantity_tier','tier_10','10-49 ตัว','multiplier',0.88, 10, 49,  0, false, 2),
  ('quantity_tier','tier_50','50+ ตัว',  'multiplier',0.75, 50, null,0, false, 3)
) as v(rule_type,key,label,modifier,value,min_qty,max_qty,extra_days,is_default,sort_order);

-- ---------------------------------------------------------------------------
-- Pricing rules — สติ๊กเกอร์
-- ---------------------------------------------------------------------------
with p as (select id from public.products where slug = 'sticker')
insert into public.pricing_rules (product_id, rule_type, key, label, modifier, value, min_qty, max_qty, extra_days, is_default, sort_order)
select p.id, v.rule_type::pricing_rule_type, v.key, v.label, v.modifier::price_modifier, v.value, v.min_qty, v.max_qty, v.extra_days, v.is_default, v.sort_order
from p, (values
  ('size','3cm','ขนาด 3 ซม.','per_unit',0,  null::int, null::int, 0, true,  1),
  ('size','5cm','ขนาด 5 ซม.','per_unit',3,  null, null, 0, false, 2),
  ('size','10cm','ขนาด 10 ซม.','per_unit',8, null, null, 0, false, 3),
  ('material','paper','กระดาษ',   'per_unit',0, null, null, 0, true,  1),
  ('material','pvc','PVC กันน้ำ', 'per_unit',2, null, null, 0, false, 2),
  ('material','clear','ใส',       'per_unit',3, null, null, 0, false, 3),
  ('quantity_tier','tier_50','50-199 ดวง', 'multiplier',1.00, 50,  199, 0, true,  1),
  ('quantity_tier','tier_200','200-999 ดวง','multiplier',0.80, 200, 999, 0, false, 2),
  ('quantity_tier','tier_1000','1000+ ดวง','multiplier',0.60, 1000,null,0, false, 3)
) as v(rule_type,key,label,modifier,value,min_qty,max_qty,extra_days,is_default,sort_order);
