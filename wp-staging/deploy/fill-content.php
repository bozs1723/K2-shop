<?php
/**
 * S3 — Content entry สำหรับ service: acrylic-keychain
 * เนื้อหาคัดลอกจาก prototype/acrylic-keychain.html (reference ผ่าน QA แล้ว) — ไม่แต่งเอง
 * Pricing JSON คัดลอกทั้งก้อนจาก k2sign-theme/assets/js/pricing-data.json (LOCKED)
 */

$post_id = (int) ($args[0] ?? 0);
if (!$post_id) { WP_CLI::error('ต้องระบุ post ID'); }

$theme_dir = get_template_directory();
$pricing_json = file_get_contents($theme_dir . '/assets/js/pricing-data.json');
if (!$pricing_json || !json_decode($pricing_json)) { WP_CLI::error('pricing-data.json อ่านไม่ได้/ไม่ใช่ JSON'); }

// hero (ค่า LOCKED ตาม acf-fields.php defaults / prototype)
update_field('f_hero_h1', 'พวงกุญแจอะคริลิก พิมพ์ UV Flatbed รับผลิตตามแบบ ตั้งแต่ชิ้นเดียวถึงหลักหมื่น', $post_id);
update_field('f_hero_sub', 'พิมพ์คมชัด สีสดสวย ไดคัทตามแบบ เริ่มต้น 1 ชิ้น', $post_id);
update_field('f_usp', [
  ['f_usp_t' => 'พิมพ์ UV Flatbed สีคมชัด ติดทนบนอะคริลิก'],
  ['f_usp_t' => 'ไดคัทตามแบบทุกสไตล์'],
  ['f_usp_t' => 'เริ่มต้นสั่งได้ตั้งแต่ 1 ชิ้น'],
  ['f_usp_t' => 'โซ่ไข่ปลาสีเงินฟรีทุกชิ้น'],
], $post_id);
update_field('f_start_price', 16, $post_id);
update_field('f_price_cond', '*ขนาด 3 ซม. จำนวน 300–500 ชิ้น พิมพ์ 1 ด้าน พร้อมโซ่ไข่ปลาสีเงิน', $post_id);
// f_hero_img: ปล่อยว่าง = placeholder แสดงเอง (ตาม S3.5 — รออลันยืนยัน)

// trust 5 ใบ
update_field('f_trust', [
  ['f_tr_i' => '🏭', 'f_tr_t' => 'ผลิตเองควบคุมทุกงาน'],
  ['f_tr_i' => '1️⃣', 'f_tr_t' => 'เริ่มชิ้นเดียวถึงหลักหมื่น'],
  ['f_tr_i' => '✂️', 'f_tr_t' => 'ไดคัทตามแบบทุกสไตล์'],
  ['f_tr_i' => '⛓️', 'f_tr_t' => 'โซ่ไข่ปลาสีเงินฟรี'],
  ['f_tr_i' => '🚚', 'f_tr_t' => 'ผลิตประมาณ 7 วัน*'],
], $post_id);

// pricing JSON — ทั้งก้อนจากไฟล์ locked (S3.3)
update_field('f_pricing_json', $pricing_json, $post_id);

// accessories 5 การ์ด (ภาพว่าง = placeholder)
update_field('f_acc', [
  ['f_ac_n' => 'โซ่ไข่ปลาสีเงิน',   'f_ac_l' => 'ฟรี'],
  ['f_ac_n' => 'โซ่ไข่ปลาสีต่าง ๆ', 'f_ac_l' => '+2 บาท'],
  ['f_ac_n' => 'ห่วงวงกลมพร้อมโซ่', 'f_ac_l' => '+3 บาท'],
  ['f_ac_n' => 'ตะขอแบบ A',        'f_ac_l' => '+6 บาท'],
  ['f_ac_n' => 'ตะขอแบบ B',        'f_ac_l' => '+8 บาท'],
], $post_id);

// features 4 การ์ด
update_field('f_features', [
  ['f_fe_t' => 'ขนาดยอดนิยม 3–6 ซม.', 'f_fe_d' => 'เลือกได้ตั้งแต่ 3–10 ซม. ขนาดที่ลูกค้าสั่งมากที่สุดคือ 3–6 ซม.', 'f_fe_l' => ''],
  ['f_fe_t' => 'ไดคัทตามแบบ',         'f_fe_d' => 'ตัดขอบตามรูปทรงของแบบทุกสไตล์ โลโก้ การ์ตูน ตัวอักษร', 'f_fe_l' => ''],
  ['f_fe_t' => 'พิมพ์ UV Flatbed',     'f_fe_d' => 'สีคมชัด รายละเอียดครบ พิมพ์ได้ทั้ง 1 ด้านและ 2 ด้าน', 'f_fe_l' => ''],
  ['f_fe_t' => 'วัสดุอะคริลิก',        'f_fe_d' => 'อะคริลิกใสคุณภาพ', 'f_fe_l' => '#accordion'],
], $post_id);

// portfolio_gallery: กรอกภายหลังด้วย attachment IDs ของ placeholder (สคริปต์แยก)

// volume (C8) — ข้อความตาม prototype
update_field('f_vol_small', 'ขนาด 3 ซม. ช่วง 1–9 ชิ้น ราคา 80 บาท/ชิ้น เหมาะกับงานทดลองแบบ ของขวัญ ชิ้นเดียวในโลก', $post_id);
update_field('f_vol_corp', 'ผลิตจำนวนมากสำหรับของพรีเมียม แจกงานอีเวนต์ สินค้าที่ระลึก ราคาลดตามจำนวน', $post_id);
update_field('f_vol_bulk', 'ติดต่อรับราคาส่งพิเศษ พร้อมทีมดูแลงานผลิตโดยตรง', $post_id);

// steps 4 สเต็ป
update_field('f_steps', [
  ['f_st_t' => 'ส่งแบบ / แจ้งรายละเอียด',  'f_st_d' => 'ส่งไฟล์แบบ ขนาด จำนวน และอะไหล่ที่ต้องการ'],
  ['f_st_t' => 'ยืนยันราคาและเงื่อนไข',     'f_st_d' => 'รับใบเสนอราคา ยืนยันแบบก่อนเริ่มผลิต'],
  ['f_st_t' => 'ผลิตงาน',                  'f_st_d' => 'พิมพ์ UV Flatbed + ไดคัทตามแบบ พร้อมตรวจคุณภาพ'],
  ['f_st_t' => 'จัดส่ง',                   'f_st_d' => 'แพ็กและจัดส่งถึงมือ ตามรอบผลิตประมาณ 7 วัน*'],
], $post_id);

// FAQ 6 ข้อ (ข้อความ [รอฝ่ายผลิตยืนยัน] คงไว้ตาม prototype — ห้ามแต่งเอง)
update_field('f_faq', [
  ['f_fq_q' => 'สั่งขั้นต่ำกี่ชิ้น?',        'f_fq_a' => 'เริ่มต้นสั่งได้ตั้งแต่ 1 ชิ้น — ขนาด 3 ซม. ช่วง 1–9 ชิ้น ราคา 80 บาท/ชิ้น'],
  ['f_fq_q' => 'ใช้ไฟล์อะไรได้บ้าง?',       'f_fq_a' => '[รอฝ่ายผลิตยืนยัน — Data Checklist §G · ต้องมีคำตอบก่อน publish]'],
  ['f_fq_q' => 'ใช้เวลาผลิตกี่วัน?',        'f_fq_a' => 'ระยะเวลาผลิตประมาณ 7 วัน ขึ้นอยู่กับจำนวน'],
  ['f_fq_q' => 'หลายแบบหลายลายทำได้ไหม?',  'f_fq_a' => '[รอฝ่ายผลิตยืนยัน — Data Checklist §G · ต้องมีคำตอบก่อน publish]'],
  ['f_fq_q' => 'พิมพ์ 2 ด้านได้ไหม?',       'f_fq_a' => 'ได้ — มีค่าพิมพ์เพิ่ม +5 ถึง +20 บาท/ชิ้น ตามขนาด (ดูตารางราคา)'],
  ['f_fq_q' => 'ราคาเปลี่ยนแปลงไหม?',      'f_fq_a' => 'ราคาเริ่มต้น อาจเปลี่ยนแปลงตามความซับซ้อนของแบบ ขนาดจริง งานพิมพ์ และอะไหล่ที่เลือก'],
], $post_id);

// accordion กลุ่มเสริม — file_prep + packing ว่าง = ซ่อน (ตามหมายเหตุ prototype)
update_field('f_acc_fileprep', '', $post_id);
update_field('f_acc_prod', 'ระยะเวลาผลิตประมาณ 7 วัน ขึ้นอยู่กับจำนวน [รายละเอียดการจัดส่ง: รอฝ่ายผลิตยืนยัน]', $post_id);
update_field('f_acc_pack', '', $post_id);
update_field('f_acc_terms', 'ราคาเริ่มต้น อาจเปลี่ยนแปลงตามความซับซ้อนของแบบ ขนาดจริง งานพิมพ์ และอะไหล่ที่เลือก · ระยะเวลาผลิตประมาณ 7 วัน ขึ้นอยู่กับจำนวน', $post_id);

// CTA — LOCKED ✅Q1
update_field('f_cta_line', '@k2sign', $post_id);
update_field('f_cta_phone', '065-989-5887', $post_id);
update_field('f_cta_email', 'k2sign.thailand@gmail.com', $post_id);

WP_CLI::success("กรอก ACF ครบสำหรับ post #$post_id");
