<?php
/**
 * Template: single service — /services/{slug}/
 * ลำดับ section LOCKED: C1→C11 (ควบคุมโดย template — editor สลับไม่ได้)
 * ทุก block = ACF-driven · empty state = ซ่อน section
 */
get_header();
the_post();

$f = fn($k, $d = '') => (function_exists('get_field') ? (get_field($k) ?: $d) : $d);
$pricing_json = k2_get_pricing_json();
?>
<main>

<!-- C1 Hero -->
<section class="hero"><div class="wrap">
  <div class="hero-text">
    <h1><?php echo esc_html($f('hero_h1', get_the_title())); ?></h1>
    <p class="hero-sub body-lg"><?php echo esc_html($f('hero_sub')); ?></p>
    <?php if ($usp = $f('usp_bullets', [])) : ?>
    <ul class="usp"><?php foreach ($usp as $u) echo '<li>' . esc_html($u['text']) . '</li>'; ?></ul>
    <?php endif; ?>
    <div class="price-hero">เริ่มต้น <?php echo esc_html($f('starting_price', 16)); ?> บาท/ชิ้น*
      <small><?php echo esc_html($f('price_condition')); ?></small>
    </div>
    <div class="hero-cta-row">
      <a class="btn btn-primary" href="<?php echo esc_url(home_url('/quote/')); ?>" data-event="start_lead_form">ส่งแบบ / ขอใบเสนอราคา</a>
      <a class="btn btn-secondary" href="#pricing">ดูตารางราคา</a>
    </div>
  </div>
  <div class="hero-media">
    <?php if ($img = $f('hero_image')) : ?>
      <img src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>"
           width="<?php echo esc_attr($img['width']); ?>" height="<?php echo esc_attr($img['height']); ?>">
    <?php else : ?>
      <div class="hero-img-ph">[Hero Placeholder]<br>รอภาพจริงจากคลัง Drive (อลันยืนยัน)</div>
    <?php endif; ?>
  </div>
</div></section>

<!-- C2 Trust Icons -->
<?php if ($trust = $f('trust_items', [])) : ?>
<section class="sec-trust"><div class="wrap"><div class="trust-grid">
  <?php foreach ($trust as $t) : ?>
  <div class="trust-item"><div class="ic"><?php echo esc_html($t['icon']); ?></div><p><?php echo esc_html($t['title']); ?></p></div>
  <?php endforeach; ?>
</div></div></section>
<?php endif; ?>

<!-- C3+C4 Pricing (ราคาจาก ACF JSON — ห้าม hardcode) -->
<section class="sec-pricing" id="pricing"><div class="wrap">
  <div class="sec-head"><h2>ราคาพวงกุญแจอะคริลิก</h2>
    <p class="small" style="color:var(--color-muted)">ราคาต่อชิ้น (บาท) ตามขนาดและจำนวน</p></div>
  <script type="application/json" id="k2-pricing-data"><?php echo $pricing_json; ?></script>
  <div class="price-tables">
    <div class="price-table-card"><h3 style="margin-bottom:14px">ราคาพิมพ์ 1 ด้าน (บาท/ชิ้น)</h3><div id="k2-table-1side"></div></div>
    <div class="price-table-card"><h3 style="margin-bottom:14px">เพิ่มพิมพ์ 2 ด้าน (บาท/ชิ้น ตามขนาด)</h3><div id="k2-table-2side"></div></div>
    <p class="price-note" id="k2-note-desktop"></p>
  </div>
  <div id="k2-pricing-selector">
    <p class="k2-ps-label">เลือกขนาด (ซม.)</p>
    <div class="k2-ps-sizes"><?php
      $data = json_decode($pricing_json, true);
      foreach (($data['sizes_cm'] ?? []) as $s) {
        $badge = ((int)$s === (int)($data['popular_size'] ?? 0)) ? '<span class="badge-popular">ยอดนิยม</span>' : '';
        echo '<button data-size="' . (int)$s . '">' . (int)$s . ' ซม.' . $badge . '</button>';
      }
    ?></div>
    <div class="k2-ps-sides">
      <button data-side="1">พิมพ์ 1 ด้าน</button>
      <button data-side="2">พิมพ์ 2 ด้าน <span class="sur"></span></button>
    </div>
    <h3 class="k2-ps-title"></h3>
    <div class="k2-ps-rows"></div>
    <a class="k2-ps-500" href="<?php echo esc_url(home_url('/quote/')); ?>"><?php echo esc_html($data['over_500_label'] ?? ''); ?></a>
    <p class="price-note" id="k2-note-mobile"></p>
  </div>
</div></section>

<!-- C5 Accessories -->
<?php if ($acc = $f('accessories', [])) : ?>
<section class="sec-acc"><div class="wrap">
  <div class="sec-head"><h2>อุปกรณ์และตัวเลือก (ห่วง / โซ่ / ตะขอ)</h2></div>
  <div class="acc-grid"><?php foreach ($acc as $a) : ?>
    <div class="acc-card">
      <?php if (!empty($a['image'])) : ?><img src="<?php echo esc_url($a['image']['sizes']['medium'] ?? $a['image']['url']); ?>" alt="<?php echo esc_attr($a['name']); ?>">
      <?php else : ?><div class="img-ph">[ภาพจริงจากคลัง Drive]</div><?php endif; ?>
      <h3><?php echo esc_html($a['name']); ?></h3>
      <div class="add<?php echo ($a['label'] === 'ฟรี') ? ' free' : ''; ?>"><?php echo esc_html($a['label']); ?></div>
    </div>
  <?php endforeach; ?></div>
</div></section>
<?php endif; ?>

<!-- C6 Feature Cards -->
<?php if ($fc = $f('feature_cards', [])) : ?>
<section class="sec-features"><div class="wrap">
  <div class="sec-head"><h2>จุดเด่นพวงกุญแจอะคริลิก K2SIGN</h2></div>
  <div class="feature-grid"><?php foreach ($fc as $c) : ?>
    <div class="feature-card"><h3><?php echo esc_html($c['title']); ?></h3>
      <p><?php echo esc_html($c['desc']); ?><?php if (!empty($c['link'])) : ?> <a href="<?php echo esc_url($c['link']); ?>">อ่านเพิ่มเติม</a><?php endif; ?></p></div>
  <?php endforeach; ?></div>
</div></section>
<?php endif; ?>

<!-- C7 Portfolio -->
<?php if ($gal = $f('portfolio_gallery', [])) : ?>
<section class="sec-portfolio"><div class="wrap">
  <div class="sec-head"><h2>ผลงานพวงกุญแจอะคริลิกของเรา</h2></div>
  <div class="pf-grid"><?php foreach (array_slice($gal, 0, 6) as $g) : ?>
    <img class="pf-item" src="<?php echo esc_url($g['sizes']['large'] ?? $g['url']); ?>" alt="<?php echo esc_attr($g['alt']); ?>" loading="lazy">
  <?php endforeach; ?></div>
  <div class="pf-more"><a class="btn btn-secondary" href="<?php echo esc_url(home_url('/portfolio/')); ?>">ดูผลงานทั้งหมด</a></div>
</div></section>
<?php endif; ?>

<!-- C8 Volume -->
<section class="sec-volume"><div class="wrap">
  <div class="sec-head"><h2>สั่งน้อยก็ได้ สั่งมากก็คุ้ม</h2></div>
  <div class="vol-grid">
    <div class="vol-card"><h3>ชิ้นเดียวก็ทำได้</h3><p class="small"><?php echo esc_html($f('volume_small')); ?></p></div>
    <div class="vol-card"><h3>งานองค์กร / โปรโมชั่น</h3><p class="small"><?php echo esc_html($f('volume_corporate')); ?></p></div>
    <div class="vol-card bulk"><h3>มากกว่า 500 ชิ้น</h3><p class="small"><?php echo esc_html($f('volume_bulk_cta')); ?></p>
      <a class="btn btn-primary" href="<?php echo esc_url(home_url('/quote/')); ?>" data-event="start_lead_form">ขอราคาส่งพิเศษ</a></div>
  </div>
</div></section>

<!-- C9 Steps -->
<?php if ($steps = $f('steps', [])) : ?>
<section class="sec-steps"><div class="wrap">
  <div class="sec-head"><h2>ขั้นตอนสั่งผลิต 4 ขั้นตอน</h2></div>
  <div class="steps-grid"><?php foreach ($steps as $i => $s) : ?>
    <div class="step-card"><div class="num"><?php echo $i + 1; ?></div>
      <h3><?php echo esc_html($s['title']); ?></h3><p><?php echo esc_html($s['desc']); ?></p></div>
  <?php endforeach; ?></div>
</div></section>
<?php endif; ?>

<!-- C10 Accordion (FAQ 6 ข้อ ✅Q10 · กลุ่มว่าง = ซ่อน) -->
<section class="sec-accordion" id="accordion"><div class="wrap">
  <?php if ($faq = $f('faq', [])) : ?>
  <div class="sec-head"><h2>คำถามที่พบบ่อย</h2></div>
  <div class="faq-cols"><?php foreach ($faq as $q) : ?>
    <details class="k2-acc"><summary><?php echo esc_html($q['q']); ?></summary>
      <div class="acc-body"><?php echo esc_html($q['a']); ?></div></details>
  <?php endforeach; ?></div>
  <?php endif; ?>
  <div style="margin-top:20px">
    <?php foreach (['accordion_file_prep' => 'วิธีเตรียมไฟล์', 'accordion_production_time' => 'ระยะเวลาผลิตและจัดส่ง',
                    'accordion_packing' => 'การแพ็กและการจัดส่ง', 'accordion_terms' => 'หมายเหตุและเงื่อนไข'] as $k => $label) :
      if ($body = $f($k)) : ?>
      <details class="k2-acc" style="margin-top:12px"><summary><?php echo esc_html($label); ?></summary>
        <div class="acc-body"><?php echo wp_kses_post($body); ?></div></details>
    <?php endif; endforeach; ?>
  </div>
</div></section>

<!-- C11 CTA ปิดท้าย -->
<?php
$line = $f('cta_line', '@k2sign'); $phone = $f('cta_phone', '065-989-5887');
$tel = preg_replace('/\D/', '', $phone);
?>
<section class="sec-cta"><div class="wrap">
  <h2>สั่งผลิตพวงกุญแจอะคริลิกกับ K2SIGN</h2>
  <p class="sub body-lg">ผู้ผลิตโดยตรง เริ่มชิ้นเดียวถึงหลักหมื่น พิมพ์ UV Flatbed ไดคัทตามแบบ</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="<?php echo esc_url(home_url('/quote/')); ?>" data-event="start_lead_form">ส่งแบบ / ขอใบเสนอราคา</a>
    <a class="btn btn-ghost" href="https://line.me/R/ti/p/<?php echo esc_attr($line); ?>" data-event="click_line">LINE <?php echo esc_html($line); ?></a>
    <a class="btn btn-ghost" href="tel:<?php echo esc_attr($tel); ?>" data-event="click_phone">โทร <?php echo esc_html($phone); ?></a>
  </div>
  <p class="cta-points">เริ่มต้น <?php echo esc_html($f('starting_price', 16)); ?> บาท/ชิ้น* · โซ่ไข่ปลาสีเงินฟรี · ผลิตประมาณ 7 วัน*</p>
</div></section>

</main>
<?php get_footer(); ?>
