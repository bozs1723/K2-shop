<?php /* G3 Footer + G2 Mobile Sticky CTA — LOCKED ✅Q1/Q7 */
$line  = function_exists('get_field') ? (get_field('cta_line') ?: '@k2sign') : '@k2sign';
$phone = function_exists('get_field') ? (get_field('cta_phone') ?: '065-989-5887') : '065-989-5887';
$email = function_exists('get_field') ? (get_field('cta_email') ?: 'k2sign.thailand@gmail.com') : 'k2sign.thailand@gmail.com';
$tel   = preg_replace('/\D/', '', $phone);
?>
<footer class="site-footer">
  <div class="wrap">
    <nav><?php wp_nav_menu(['theme_location' => 'footer', 'container' => false, 'items_wrap' => '%3$s', 'fallback_cb' => false]); ?></nav>
    <div class="contact">
      <span>LINE: <?php echo esc_html($line); ?></span>
      <span>โทร: <?php echo esc_html($phone); ?></span>
      <span>อีเมล: <?php echo esc_html($email); ?></span>
      <span class="caption">© K2SIGN Media Co., Ltd.</span>
    </div>
  </div>
</footer>

<div class="sticky-cta">
  <a class="btn btn-line" href="https://line.me/R/ti/p/<?php echo esc_attr($line); ?>" data-event="click_line">LINE</a>
  <a class="btn btn-tel" href="tel:<?php echo esc_attr($tel); ?>" data-event="click_phone">โทร</a>
  <a class="btn btn-primary" href="<?php echo esc_url(home_url('/quote/')); ?>" data-event="start_lead_form">ส่งแบบ</a>
</div>

<?php wp_footer(); ?>
</body>
</html>
