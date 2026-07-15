<?php
/**
 * SCF Compatibility Check — รันด้วย: wp eval-file tests/scf-compat-check.php <post_id>
 * ตรวจตามมาตรฐานโปรเจกต์ (มติ 15 ก.ค. 2026: SCF เป็นปลั๊กอินมาตรฐาน ห้าม ACF Pro ซ้อน):
 *   1. field registration — acf_add_local_field_group ทำงาน, group_k2_service ลงทะเบียนครบทุก field
 *   2. repeater — field type มีจริง + get_field คืน array ครบแถวทุก repeater
 *   3. gallery — field type มีจริง + get_field คืน array ของ attachment
 *   4. get_field() — ค่า text/number/JSON ตรงกับที่กรอก + pricing JSON ตรงกับไฟล์ locked
 *   5. ห้าม ACF Pro ซ้อน — ตรวจว่าไม่มีปลั๊กอิน advanced-custom-fields-pro active
 */

$post_id = (int) ($args[0] ?? 0);
if (!$post_id) { WP_CLI::error('ระบุ post ID เช่น: wp eval-file scf-compat-check.php 4'); }

$fails = [];
$check = function (string $name, bool $ok, string $detail = '') use (&$fails) {
    printf("%s %s%s\n", $ok ? '✅' : '❌', $name, $detail ? " — $detail" : '');
    if (!$ok) { $fails[] = $name; }
};

// 0) ปลั๊กอินที่ active — ต้องเป็น SCF, ห้าม ACF/ACF Pro ซ้อน
$active = (array) get_option('active_plugins', []);
$scf_active = (bool) preg_grep('#^secure-custom-fields/#', $active);
$acf_active = (bool) preg_grep('#^advanced-custom-fields(-pro)?/#', $active);
$check('SCF active', $scf_active, implode(', ', $active));
$check('ไม่มี ACF/ACF Pro ซ้อน', !$acf_active);

// 1) field registration
$check('acf_add_local_field_group() มีจริง', function_exists('acf_add_local_field_group'));
$group = function_exists('acf_get_field_group') ? acf_get_field_group('group_k2_service') : null;
$check('field group group_k2_service ลงทะเบียน', (bool) $group);
$fields = $group ? acf_get_fields('group_k2_service') : [];
$expected_fields = ['hero_h1','hero_sub','usp_bullets','starting_price','price_condition','hero_image',
    'trust_items','pricing_json','accessories','feature_cards','portfolio_gallery',
    'volume_small','volume_corporate','volume_bulk_cta','steps','faq',
    'accordion_file_prep','accordion_production_time','accordion_packing','accordion_terms',
    'cta_line','cta_phone','cta_email'];
$names = array_column($fields ?: [], 'name');
$missing = array_diff($expected_fields, $names);
$check('field ครบ ' . count($expected_fields) . ' ตัว', !$missing, $missing ? 'ขาด: ' . implode(',', $missing) : count($names) . ' ตัว');

// 2) repeater + 3) gallery field types
$check('field type "repeater" ลงทะเบียน', (bool) acf_get_field_type('repeater'));
$check('field type "gallery" ลงทะเบียน', (bool) acf_get_field_type('gallery'));

// get_field() กับ repeater — จำนวนแถวตาม Handoff §3 (Trust 5 / Acc 5 / Features 4 / Steps 4 / FAQ 6 / USP 4)
$repeaters = ['usp_bullets' => 4, 'trust_items' => 5, 'accessories' => 5,
              'feature_cards' => 4, 'steps' => 4, 'faq' => 6];
foreach ($repeaters as $name => $want) {
    $rows = get_field($name, $post_id);
    $check("repeater $name = $want แถว", is_array($rows) && count($rows) === $want,
        is_array($rows) ? count($rows) . ' แถว' : gettype($rows));
}
// sub field แรกของแต่ละ repeater ต้อง format เป็น assoc key ตามชื่อ sub field
$trust = get_field('trust_items', $post_id);
$check('repeater sub fields format ถูก (trust_items[0][icon/title])',
    is_array($trust) && isset($trust[0]['icon'], $trust[0]['title']));

// gallery
$gal = get_field('portfolio_gallery', $post_id);
$check('gallery portfolio_gallery คืน array 6 ภาพ', is_array($gal) && count($gal) === 6,
    is_array($gal) ? count($gal) . ' ภาพ' : gettype($gal));
$check('gallery item มี url/sizes', is_array($gal) && isset($gal[0]['url']));

// 4) get_field ค่า scalar + pricing JSON ตรงไฟล์ locked
$check("get_field starting_price = 16", (string) get_field('starting_price', $post_id) === '16');
$check('get_field cta_phone = 065-989-5887', get_field('cta_phone', $post_id) === '065-989-5887');
$locked = json_decode(file_get_contents(get_template_directory() . '/assets/js/pricing-data.json'), true);
$stored = json_decode((string) get_field('pricing_json', $post_id), true);
$check('pricing_json ใน DB ตรงกับไฟล์ locked (เทียบเชิงโครงสร้าง)', $stored === $locked);
// helper ของธีมต้องได้ JSON ที่ decode แล้วตรง locked เช่นกัน (source of truth เดียว)
$check('k2_get_pricing_json() ตรง locked', json_decode(k2_get_pricing_json(), true) === $locked);

echo "\n";
if ($fails) { WP_CLI::error('SCF compat FAIL ' . count($fails) . ' ข้อ: ' . implode(' · ', $fails)); }
WP_CLI::success('SCF compatibility ผ่านครบทุกข้อ — พร้อม deploy');
