/**
 * Dynamic Item Page: Services (Item) — /services/{slug}
 * แทน single-service.php — ลำดับ section C1→C11 ล็อกใน layout ของ Studio (editor สลับไม่ได้)
 *
 * ต้องมี element ตาม ID ที่กำหนดใน WIX-SETUP-GUIDE.md (สร้างใน Studio editor ก่อนวางโค้ดนี้)
 * dataset: #servicesDataset (อ่านอย่างเดียว, เชื่อม collection Services, filter ด้วย URL slug)
 */
import { parsePricing, K2_CALC, rowsFor, surchargeLabel, desktopTable1Side, desktopTable2Side } from 'public/k2-pricing.js';

let pricing;              // ข้อมูลราคา (LOCKED) จาก CMS
let selSize = 5;          // default = ขนาดยอดนิยม (popular_size)
let selSides = 1;

$w.onReady(async function () {
  const item = $w('#servicesDataset').getCurrentItem();
  if (!item) return;

  // ---- C1 Hero ----
  $w('#heroH1').text = item.heroH1 || item.title;
  $w('#heroSub').text = item.heroSub || '';
  $w('#priceHero').text = `เริ่มต้น ${item.startingPrice} บาท/ชิ้น*`;
  $w('#priceCondition').text = item.priceCondition || '';
  bindRepeater('#uspRepeater', (item.uspBullets || []).map((t, i) => ({ _id: `u${i}`, text: t })),
    ($i, d) => { $i('#uspText').text = d.text; });
  if (item.heroImage) { $w('#heroImage').src = item.heroImage; $w('#heroImage').expand(); $w('#heroPlaceholder').collapse(); }
  else { $w('#heroImage').collapse(); $w('#heroPlaceholder').expand(); } // ✅Q2 placeholder — ห้ามภาพ generated

  // ---- C2 Trust (ว่าง = ซ่อน section) ----
  sectionRepeater('#trustSection', '#trustRepeater', item.trustItems,
    ($i, d) => { $i('#trustIcon').text = d.icon; $i('#trustTitle').text = d.title; });

  // ---- C3+C4 Pricing (ราคาจาก CMS เท่านั้น — ห้าม hardcode) ----
  pricing = parsePricing(item.pricingJson);
  selSize = pricing.popular_size || pricing.sizes_cm[0];
  initPricingSelector();
  initDesktopTables();
  $w('#priceNoteDesktop').text = pricing.price_note;
  $w('#priceNoteMobile').text = pricing.price_note;
  $w('#over500Link').label = pricing.over_500_label;

  // ---- C5 Accessories ----
  sectionRepeater('#accSection', '#accRepeater', item.accessories, ($i, d) => {
    $i('#accName').text = d.name; $i('#accLabel').text = d.label;
    // ภาพจริงเท่านั้น: ยังไม่ผูกภาพจนกว่าคลัง Drive ผ่านการคัด
  });

  // ---- C6 Features ----
  sectionRepeater('#featureSection', '#featureRepeater', item.featureCards, ($i, d) => {
    $i('#featureTitle').text = d.title; $i('#featureDesc').text = d.desc;
  });

  // ---- C7 Portfolio (ภาพจริงเท่านั้น — gallery ว่าง = ซ่อนทั้ง section) ----
  if (item.portfolioGallery && item.portfolioGallery.length) {
    $w('#portfolioGallery').items = item.portfolioGallery;
    $w('#portfolioSection').expand();
  } else { $w('#portfolioSection').collapse(); }

  // ---- C8 Volume ----
  $w('#volumeSmall').text = item.volumeSmall || '';
  $w('#volumeCorporate').text = item.volumeCorporate || '';
  $w('#volumeBulkCta').text = item.volumeBulkCta || '';

  // ---- C9 Steps ----
  sectionRepeater('#stepsSection', '#stepsRepeater',
    (item.steps || []).map((s, i) => ({ ...s, num: String(i + 1), _id: `s${i}` })),
    ($i, d) => { $i('#stepNum').text = d.num; $i('#stepTitle').text = d.title; $i('#stepDesc').text = d.desc; });

  // ---- C10 FAQ + accordion เสริม (ว่าง = ซ่อน) ----
  sectionRepeater('#faqSection', '#faqRepeater', item.faq,
    ($i, d) => { $i('#faqQ').text = d.q; $i('#faqA').text = d.a; });
  richOrCollapse('#accProdTime', '#accProdTimeBox', item.accordionProductionTime);
  richOrCollapse('#accTerms', '#accTermsBox', item.accordionTerms);
  richOrCollapse('#accFilePrep', '#accFilePrepBox', item.accordionFilePrep);
  richOrCollapse('#accPacking', '#accPackingBox', item.accordionPacking);

  // ---- C11 + G2 CTA (LOCKED ✅Q1) ----
  const line = item.ctaLine || '@k2sign';
  const tel = (item.ctaPhone || '065-989-5887').replace(/\D/g, '');
  $w('#ctaLineBtn').label = `LINE ${line}`;
  $w('#ctaLineBtn').link = `https://line.me/R/ti/p/${line}`;
  $w('#ctaPhoneBtn').label = `โทร ${item.ctaPhone}`;
  $w('#ctaPhoneBtn').link = `tel:${tel}`;
  $w('#stickyLineBtn').link = `https://line.me/R/ti/p/${line}`;
  $w('#stickyTelBtn').link = `tel:${tel}`;
  $w('#ctaPoints').text = `เริ่มต้น ${item.startingPrice} บาท/ชิ้น* · โซ่ไข่ปลาสีเงินฟรี · ผลิตประมาณ 7 วัน*`;
});

/* ---------- Pricing Selector (Tablet/Mobile — C4) ---------- */
function initPricingSelector() {
  bindRepeater('#psSizeRepeater', pricing.sizes_cm.map((s) => ({ _id: `sz${s}`, size: s })), ($i, d) => {
    $i('#psSizeBtn').label = `${d.size} ซม.`;
    $i('#psSizeBadge')[d.size === pricing.popular_size ? 'expand' : 'collapse']();
    $i('#psSizeBtn').onClick(() => { selSize = d.size; renderRows(); });
  });
  $w('#psSide1Btn').onClick(() => { selSides = 1; renderRows(); });
  $w('#psSide2Btn').onClick(() => { selSides = 2; renderRows(); });
  renderRows();
}

function renderRows() {
  $w('#psTitle').text = `ขนาด ${selSize} ซม. — พิมพ์ ${selSides} ด้าน`;
  $w('#psSide2Sur').text = surchargeLabel(pricing, selSize);
  bindRepeater('#psRows', rowsFor(pricing, selSize, selSides), ($i, d) => {
    $i('#psRowTier').text = `${d.tier} ชิ้น`;
    $i('#psRowPrice').text = String(d.price);   // <strong> เทียบเท่า .k2-ps-row strong ใน prototype
  });
}

/* ---------- Desktop ตารางเต็ม (C3) — สร้างจาก JSON เท่านั้น ---------- */
function initDesktopTables() {
  const t1 = desktopTable1Side(pricing);
  bindRepeater('#tbl1Rows', t1.map((r) => ({ _id: `r${r.size}`, size: `${r.size} ซม.`,
    c0: r.prices[0], c1: r.prices[1], c2: r.prices[2], c3: r.prices[3], c4: r.prices[4], c5: r.prices[5], c6: r.prices[6] })),
    ($i, d) => { ['size','c0','c1','c2','c3','c4','c5','c6'].forEach((k) => { $i(`#tbl1${k}`).text = String(d[k]); }); });
  bindRepeater('#tbl2Rows', desktopTable2Side(pricing).map((r) => ({ _id: `s${r.size}`, size: `${r.size} ซม.`, sur: `+${r.surcharge}` })),
    ($i, d) => { $i('#tbl2size').text = d.size; $i('#tbl2sur').text = d.sur; });
}

/* ---------- helpers ---------- */
function bindRepeater(id, data, onItem) {
  $w(id).data = data;
  $w(id).onItemReady(($item, itemData) => onItem($item, itemData));
  $w(id).data = data; // ผูกซ้ำหลังตั้ง onItemReady เพื่อให้ render ครบ
}
function sectionRepeater(sectionId, repeaterId, data, onItem) {
  if (data && data.length) { bindRepeater(repeaterId, data.map((d, i) => ({ _id: d._id || `i${i}`, ...d })), onItem); $w(sectionId).expand(); }
  else { $w(sectionId).collapse(); }
}
function richOrCollapse(elId, boxId, html) {
  if (html) { $w(elId).text = String(html); $w(boxId).expand(); } else { $w(boxId).collapse(); }
}
