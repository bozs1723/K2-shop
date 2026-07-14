/* Screenshot 3 ขนาดตามข้อ 12: Desktop 1440 / Tablet 768 / Mobile 390 (full page) */
const { chromium } = require('playwright');
const path = require('path');

const SHOTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const url = 'file://' + path.resolve(__dirname, '../prototype/acrylic-keychain.html');
  for (const s of SHOTS) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // ให้ฟอนต์ Kanit/Prompt โหลดเสร็จ
    // ซ่อน sticky bar ตอนถ่าย full page (fixed element จะซ้อนทับกลางภาพ) — ถ่ายแยกด้านล่าง
    await page.addStyleTag({ content: '.sticky-cta{display:none!important}' });
    const out = path.resolve(__dirname, `../screenshots/acrylic-keychain-${s.name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log('saved', out);
    await page.close();
  }
  // ภาพเสริม: Mobile viewport จริง โชว์ G2 sticky bottom CTA (✅Q7)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const out = path.resolve(__dirname, '../screenshots/acrylic-keychain-mobile-390-sticky-cta.png');
    await page.screenshot({ path: out });
    console.log('saved', out);
    await page.close();
  }
  await browser.close();
})();
