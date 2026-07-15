<?php
/**
 * ACF Field Groups — CPT service (acrylic-keychain) ตาม Handoff §3
 * ลงทะเบียนแบบ local field group — ปลั๊กอินมาตรฐานที่ล็อก: **Secure Custom Fields (SCF)** จาก wordpress.org
 * (มติ 15 ก.ค. 2026 · API เดียวกับ ACF · ห้ามสลับปลั๊กอินโดยไม่แก้ STAGING-INSTALL-GUIDE.md)
 * หมายเหตุ: ราคาเก็บเป็น JSON textarea ก้อนเดียว (pricing_json) เพื่อกันตัวเลขกระจาย/พิมพ์ผิด
 */

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group([
        'key' => 'group_k2_service',
        'title' => 'Service — Acrylic Keychain (Handoff Final v1.2)',
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'service']]],
        'fields' => [
            // hero
            ['key' => 'f_hero_h1', 'name' => 'hero_h1', 'label' => 'Hero H1 (LOCKED)', 'type' => 'text',
             'default_value' => 'พวงกุญแจอะคริลิก พิมพ์ UV Flatbed รับผลิตตามแบบ ตั้งแต่ชิ้นเดียวถึงหลักหมื่น'],
            ['key' => 'f_hero_sub', 'name' => 'hero_sub', 'label' => 'Hero Sub (LOCKED — ไม่มี "ผลิตไว")', 'type' => 'text',
             'default_value' => 'พิมพ์คมชัด สีสดสวย ไดคัทตามแบบ เริ่มต้น 1 ชิ้น'],
            ['key' => 'f_usp', 'name' => 'usp_bullets', 'label' => 'USP 4 ข้อ (ตาม mockup)', 'type' => 'repeater',
             'sub_fields' => [['key' => 'f_usp_t', 'name' => 'text', 'label' => 'ข้อความ', 'type' => 'text']]],
            ['key' => 'f_start_price', 'name' => 'starting_price', 'label' => 'ราคาเริ่มต้น (LOCKED = 16)', 'type' => 'number', 'default_value' => 16],
            ['key' => 'f_price_cond', 'name' => 'price_condition', 'label' => 'เงื่อนไขราคา (ต้องติดราคาเสมอ)', 'type' => 'text',
             'default_value' => '*ขนาด 3 ซม. จำนวน 300–500 ชิ้น พิมพ์ 1 ด้าน พร้อมโซ่ไข่ปลาสีเงิน'],
            ['key' => 'f_hero_img', 'name' => 'hero_image', 'label' => 'Hero Image (ภาพจริงจาก Drive — ห้าม generated · รออลันยืนยัน)', 'type' => 'image', 'return_format' => 'array'],
            // trust
            ['key' => 'f_trust', 'name' => 'trust_items', 'label' => 'Trust Icons 5 ใบ', 'type' => 'repeater',
             'sub_fields' => [
                ['key' => 'f_tr_i', 'name' => 'icon', 'label' => 'ไอคอน', 'type' => 'text'],
                ['key' => 'f_tr_t', 'name' => 'title', 'label' => 'ข้อความ', 'type' => 'text'],
             ]],
            // pricing — JSON ก้อนเดียว (โครงตาม Handoff §5)
            ['key' => 'f_pricing_json', 'name' => 'pricing_json', 'label' => 'Pricing JSON (LOCKED — โครงตาม Handoff §5)', 'type' => 'textarea', 'rows' => 14,
             'instructions' => 'ห้ามแก้ตัวเลขโดยไม่ผ่านท่านประธาน · ใช้โครงเดียวกับ assets/js/pricing-data.json'],
            // accessories
            ['key' => 'f_acc', 'name' => 'accessories', 'label' => 'อุปกรณ์ 5 การ์ด', 'type' => 'repeater',
             'sub_fields' => [
                ['key' => 'f_ac_img', 'name' => 'image', 'label' => 'ภาพ', 'type' => 'image'],
                ['key' => 'f_ac_n', 'name' => 'name', 'label' => 'ชื่อ', 'type' => 'text'],
                ['key' => 'f_ac_l', 'name' => 'label', 'label' => 'ราคา (ฟรี/+2 บาท…)', 'type' => 'text'],
             ]],
            // features
            ['key' => 'f_features', 'name' => 'feature_cards', 'label' => 'คุณสมบัติย่อย 4 การ์ด', 'type' => 'repeater',
             'sub_fields' => [
                ['key' => 'f_fe_t', 'name' => 'title', 'label' => 'หัวข้อ', 'type' => 'text'],
                ['key' => 'f_fe_d', 'name' => 'desc', 'label' => 'รายละเอียด', 'type' => 'textarea', 'rows' => 2],
                ['key' => 'f_fe_l', 'name' => 'link', 'label' => 'ลิงก์ (ถ้ามี)', 'type' => 'url'],
             ]],
            // portfolio
            ['key' => 'f_pf', 'name' => 'portfolio_gallery', 'label' => 'ผลงาน 5–6 ภาพ (ชุดแนะนำของอลัน)', 'type' => 'gallery'],
            // volume (C8)
            ['key' => 'f_vol_small', 'name' => 'volume_small', 'label' => 'งานชิ้นเดียว (LOCKED)', 'type' => 'text',
             'default_value' => 'ชิ้นเดียวก็ทำได้ — ขนาด 3 ซม. ช่วง 1–9 ชิ้น ราคา 80 บาท/ชิ้น'],
            ['key' => 'f_vol_corp', 'name' => 'volume_corporate', 'label' => 'งานองค์กร/โปรโมชั่น', 'type' => 'textarea', 'rows' => 2],
            ['key' => 'f_vol_bulk', 'name' => 'volume_bulk_cta', 'label' => 'CTA 500+', 'type' => 'text',
             'default_value' => 'มากกว่า 500 ชิ้น ติดต่อรับราคาส่งพิเศษ'],
            // steps
            ['key' => 'f_steps', 'name' => 'steps', 'label' => 'ขั้นตอน 4 สเต็ป', 'type' => 'repeater',
             'sub_fields' => [
                ['key' => 'f_st_t', 'name' => 'title', 'label' => 'หัวข้อ', 'type' => 'text'],
                ['key' => 'f_st_d', 'name' => 'desc', 'label' => 'รายละเอียด', 'type' => 'text'],
             ]],
            // accordion
            ['key' => 'f_faq', 'name' => 'faq', 'label' => 'FAQ 6 ข้อ (✅Q10 เท่ากันทุกอุปกรณ์)', 'type' => 'repeater',
             'sub_fields' => [
                ['key' => 'f_fq_q', 'name' => 'q', 'label' => 'คำถาม', 'type' => 'text'],
                ['key' => 'f_fq_a', 'name' => 'a', 'label' => 'คำตอบ', 'type' => 'textarea', 'rows' => 3],
             ]],
            ['key' => 'f_acc_fileprep', 'name' => 'accordion_file_prep', 'label' => 'วิธีเตรียมไฟล์ (ว่าง = ซ่อน section)', 'type' => 'wysiwyg'],
            ['key' => 'f_acc_prod', 'name' => 'accordion_production_time', 'label' => 'ระยะเวลาผลิตและจัดส่ง', 'type' => 'wysiwyg'],
            ['key' => 'f_acc_pack', 'name' => 'accordion_packing', 'label' => 'การแพ็กและการจัดส่ง (ว่าง = ซ่อน)', 'type' => 'wysiwyg'],
            ['key' => 'f_acc_terms', 'name' => 'accordion_terms', 'label' => 'หมายเหตุและเงื่อนไข', 'type' => 'wysiwyg'],
            // cta — LOCKED ✅Q1
            ['key' => 'f_cta_line', 'name' => 'cta_line', 'label' => 'LINE (LOCKED)', 'type' => 'text', 'default_value' => '@k2sign'],
            ['key' => 'f_cta_phone', 'name' => 'cta_phone', 'label' => 'โทร (LOCKED)', 'type' => 'text', 'default_value' => '065-989-5887'],
            ['key' => 'f_cta_email', 'name' => 'cta_email', 'label' => 'อีเมล (LOCKED)', 'type' => 'text', 'default_value' => 'k2sign.thailand@gmail.com'],
        ],
    ]);
});
