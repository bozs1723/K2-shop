/* Screenshot staging 4 ขนาด (1440/768/390/320) + QA checks:
 * - sticky CTA ไม่บังเนื้อหา (เลื่อนสุดหน้าแล้ว footer ต้องไม่ถูกทับ)
 * - Hero mobile กับ Header mobile ไม่ชนกัน (h1 อยู่ใต้ header เสมอ)
 * ดัดแปลงจาก tests/screenshots.js ของแพ็กเกจ — เพิ่ม 320px ตามคำสั่งงานข้อ 16 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = process.env.STAGING_URL || 'http://127.0.0.1:8043/services/acrylic-keychain/';
const AUTH = { username: 'k2staging', password: 'K2preview2026' };
const SHOTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 568 },
];

(async () => {
  const outDir = path.resolve(__dirname, '../screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const results = [];

  for (const s of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: s.width, height: s.height }, httpCredentials: AUTH });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // ให้ฟอนต์ Kanit/Prompt โหลดเสร็จ

    // ---- QA: Hero ไม่ชน Header (ตรวจก่อนซ่อน sticky) ----
    const headerBox = await page.locator('.site-header').boundingBox();
    const h1Box = await page.locator('.hero h1').boundingBox();
    const headerPos = await page.locator('.site-header').evaluate(el => getComputedStyle(el).position);
    const heroClear = !(['fixed', 'sticky'].includes(headerPos)) || h1Box.y >= headerBox.y + headerBox.height;

    // ---- QA: sticky CTA ไม่บังเนื้อหา (เลื่อนสุดหน้า) ----
    let stickyOK = 'n/a (ซ่อนใน viewport นี้)';
    const sticky = page.locator('.sticky-cta');
    const stickyVisible = await sticky.isVisible();
    if (stickyVisible) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      const sb = await sticky.boundingBox();
      const fb = await page.locator('.site-footer .contact').boundingBox();
      // footer contact ทั้งบล็อกต้องจบเหนือขอบบน sticky bar
      stickyOK = fb.y + fb.height <= sb.y + 1 ? 'ผ่าน — footer ไม่ถูกทับ' :
        `FAIL — footer ล้ำเข้าใต้ sticky ${Math.round(fb.y + fb.height - sb.y)}px`;
      await page.screenshot({ path: path.join(outDir, `acrylic-keychain-${s.name}-sticky-cta.png`) });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
    }

    // ---- Full page (ซ่อน sticky ตามแนวทาง screenshots.js เดิม — fixed element จะซ้อนกลางภาพ) ----
    // เลื่อนไล่ทั้งหน้าให้ภาพ loading="lazy" (C7 portfolio) โหลดครบก่อนถ่าย
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      // รอภาพโหลดครบ สูงสุด 5 วิ (กันค้างกรณี event ไม่ยิง)
      await Promise.race([
        Promise.all(Array.from(document.images)
          .map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))),
        new Promise(r => setTimeout(r, 5000)),
      ]);
    });
    await page.waitForTimeout(300);
    await page.addStyleTag({ content: '.sticky-cta{display:none!important}' });
    await page.screenshot({ path: path.join(outDir, `acrylic-keychain-${s.name}.png`), fullPage: true });

    results.push({ size: s.name, headerPos, heroClear: heroClear ? 'ผ่าน' : 'FAIL — h1 ชน header',
      sticky: stickyVisible ? stickyOK : 'ไม่แสดง (desktop)' });
    console.log(`saved ${s.name}`);
    await context.close();
  }

  console.log('\n== QA summary ==');
  for (const r of results)
    console.log(`${r.size}: header=${r.headerPos} · hero/header: ${r.heroClear} · sticky CTA: ${r.sticky}`);
  await browser.close();
})();
