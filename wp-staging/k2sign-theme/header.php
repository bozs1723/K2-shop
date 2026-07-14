<?php /* G1 Header — ตาม Handoff (nav ล็อก · hamburger <960px) */ ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header class="site-header">
  <div class="wrap">
    <button class="nav-toggle" aria-label="เมนู" onclick="document.querySelector('.mobile-menu').classList.toggle('open')"><span></span></button>
    <a class="logo" href="<?php echo esc_url(home_url('/')); ?>">K2<em>SIGN</em></a>
    <nav class="main-nav"><?php
      wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'items_wrap' => '%3$s', 'fallback_cb' => false]);
    ?></nav>
    <a class="btn btn-primary header-cta" href="<?php echo esc_url(home_url('/quote/')); ?>">ส่งแบบประเมินราคา</a>
  </div>
  <nav class="mobile-menu"><?php
    wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'items_wrap' => '%3$s', 'fallback_cb' => false]);
  ?></nav>
</header>
