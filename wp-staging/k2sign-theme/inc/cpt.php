<?php
/** CPT: service + portfolio — ตาม Handoff §2 (URL: /services/{slug}/ · /portfolio/{slug}/) */

add_action('init', function () {
    register_post_type('service', [
        'labels' => ['name' => 'บริการ', 'singular_name' => 'บริการ'],
        'public' => true,
        'has_archive' => 'services',
        'rewrite' => ['slug' => 'services', 'with_front' => false],
        'menu_icon' => 'dashicons-hammer',
        'supports' => ['title', 'editor', 'thumbnail', 'revisions'],
        'show_in_rest' => true,
    ]);
    register_post_type('portfolio', [
        'labels' => ['name' => 'ผลงาน', 'singular_name' => 'ผลงาน'],
        'public' => true,
        'has_archive' => 'portfolio',
        'rewrite' => ['slug' => 'portfolio', 'with_front' => false],
        'menu_icon' => 'dashicons-format-gallery',
        'supports' => ['title', 'editor', 'thumbnail', 'revisions'],
        'show_in_rest' => true,
    ]);
});
