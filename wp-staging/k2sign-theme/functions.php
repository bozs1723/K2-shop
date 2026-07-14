<?php
/**
 * K2SIGN Theme — ตาม Developer Handoff Package Final v1.2 (LOCKED)
 * ห้ามแก้สี/ฟอนต์/ลำดับ section/ราคา ในโค้ด — ราคาอยู่ใน ACF (source of truth)
 */

define('K2_VER', '0.1.0');

/* ---------- Theme setup ---------- */
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'script', 'style']);
    register_nav_menus([
        'primary' => 'เมนูหลัก (หน้าแรก/บริการ/ผลงาน/ราคา/บทความ/ติดต่อเรา)',
        'footer'  => 'เมนู Footer',
    ]);
});

/* ---------- Assets ---------- */
add_action('wp_enqueue_scripts', function () {
    // Fonts LOCKED: Kanit 400,700 + Prompt 500 (subset thai+latin)
    wp_enqueue_style('k2-fonts',
        'https://fonts.googleapis.com/css2?family=Kanit:wght@400;700&family=Prompt:wght@500&display=swap',
        [], null);
    wp_enqueue_style('k2-tokens', get_template_directory_uri() . '/assets/css/tokens.css', [], K2_VER);

    if (is_singular('service')) {
        wp_enqueue_style('k2-service',
            get_template_directory_uri() . '/assets/css/page-acrylic-keychain.css', ['k2-tokens'], K2_VER);
        wp_enqueue_script('k2-pricing',
            get_template_directory_uri() . '/assets/js/pricing-selector.js', [], K2_VER, true);
    }
}, 20);

/* ---------- CPT + ACF ---------- */
require get_template_directory() . '/inc/cpt.php';
require get_template_directory() . '/inc/acf-fields.php';

/* ---------- SEO: Rank Math เป็นเจ้าของ sitemap — ปิด WP core sitemap ---------- */
add_filter('wp_sitemaps_enabled', '__return_false');

/* ---------- Staging guard: noindex ทั้งไซต์เมื่อ WP_ENVIRONMENT_TYPE != production ----------
 * (Basic Auth ตั้งที่ระดับ server/hosting ตาม S1) */
add_action('wp_head', function () {
    if (wp_get_environment_type() !== 'production') {
        echo '<meta name="robots" content="noindex, nofollow">' . "\n";
    }
}, 0);

/* ---------- Helper: ดึง pricing JSON จาก ACF (source of truth) ---------- */
function k2_get_pricing_json(): string {
    $json = function_exists('get_field') ? get_field('pricing_json') : '';
    if (!$json) {
        // Fallback ระหว่างยังไม่กรอก ACF: ไฟล์ locked ในธีม (ตัวเลขชุดเดียวกับเอกสาร §5)
        $json = file_get_contents(get_template_directory() . '/assets/js/pricing-data.json');
    }
    return $json;
}
