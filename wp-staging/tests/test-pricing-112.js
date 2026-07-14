/* QA §8: ทดสอบราคาอัตโนมัติ 8 ขนาด × 7 ช่วง × 2 ด้าน = 112 ค่า
 * Expected matrix ฝังในไฟล์นี้แยกอิสระจาก pricing-data.json — ถ้า JSON เพี้ยนจะจับได้
 * ตรวจ 2 ชั้น: (1) K2_CALC ฟังก์ชันคำนวณ (2) UI จริง: คลิก chip/toggle แล้วอ่านตัวเลขที่ render */
const { chromium } = require('playwright');
const path = require('path');

// ตารางล็อก (Handoff Final v1.2 §5) — ห้ามแก้
const EXPECTED_1SIDE = {
  3: [80, 39, 35, 29, 19, 17, 16], 4: [85, 44, 40, 34, 24, 22, 20],
  5: [90, 49, 45, 39, 29, 27, 25], 6: [95, 54, 50, 44, 34, 31, 29],
  7: [100, 59, 55, 49, 39, 36, 34], 8: [130, 64, 60, 54, 44, 41, 39],
  9: [140, 69, 65, 59, 49, 46, 43], 10: [150, 74, 70, 64, 54, 51, 47],
};
const EXPECTED_SURCHARGE = { 3: 5, 4: 5, 5: 10, 6: 10, 7: 15, 8: 15, 9: 20, 10: 20 };
const SIZES = [3, 4, 5, 6, 7, 8, 9, 10];
const TIERS = 7;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const url = 'file://' + path.resolve(__dirname, '../prototype/acrylic-keychain.html');
  await page.goto(url, { waitUntil: 'load' });

  let pass = 0, fail = 0;
  const errors = [];

  // ชั้นที่ 1: ฟังก์ชันคำนวณ K2_CALC — ครบ 112 ค่า
  for (const size of SIZES) {
    for (let t = 0; t < TIERS; t++) {
      for (const side of [1, 2]) {
        const got = await page.evaluate(([s, ti, sd]) => window.K2_CALC(s, ti, sd), [size, t, side]);
        const exp = EXPECTED_1SIDE[size][t] + (side === 2 ? EXPECTED_SURCHARGE[size] : 0);
        if (got === exp) pass++;
        else { fail++; errors.push(`CALC size=${size} tier=${t} side=${side}: got ${got}, expected ${exp}`); }
      }
    }
  }
  console.log(`[1/2] K2_CALC: ${pass}/112 ผ่าน${fail ? ` · ${fail} FAIL` : ''}`);

  // ชั้นที่ 2: UI จริง — คลิกทุกขนาด × ทุกด้าน แล้วอ่านราคา 7 แถวที่ render (112 ค่า)
  let uiPass = 0, uiFail = 0;
  for (const size of SIZES) {
    await page.click(`#k2-pricing-selector [data-size="${size}"]`);
    for (const side of [1, 2]) {
      await page.click(`#k2-pricing-selector [data-side="${side}"]`);
      const rendered = await page.$$eval('#k2-pricing-selector .k2-ps-row strong',
        els => els.map(e => parseInt(e.textContent, 10)));
      if (rendered.length !== TIERS) { uiFail += TIERS; errors.push(`UI size=${size} side=${side}: rows=${rendered.length}`); continue; }
      for (let t = 0; t < TIERS; t++) {
        const exp = EXPECTED_1SIDE[size][t] + (side === 2 ? EXPECTED_SURCHARGE[size] : 0);
        if (rendered[t] === exp) uiPass++;
        else { uiFail++; errors.push(`UI size=${size} tier=${t} side=${side}: got ${rendered[t]}, expected ${exp}`); }
      }
      // ตรวจป้าย +N ตามขนาด (Q3)
      if (side === 2) {
        const sur = await page.$eval('#k2-pricing-selector [data-side="2"] .sur', e => e.textContent);
        if (sur !== `+${EXPECTED_SURCHARGE[size]} บาท/ชิ้น`)
          errors.push(`SUR size=${size}: label "${sur}"`);
      }
    }
  }
  console.log(`[2/2] UI render: ${uiPass}/112 ผ่าน${uiFail ? ` · ${uiFail} FAIL` : ''}`);

  // ตรวจตาราง Desktop เต็ม 8×7 ตรง matrix
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'load' });
  const tbl = await page.$$eval('#k2-table-1side tbody tr:not(.row-500)', rows =>
    rows.map(r => Array.from(r.querySelectorAll('td:not(.size-col)')).map(td => parseInt(td.textContent, 10))));
  let tblOK = tbl.length === 8;
  SIZES.forEach((s, i) => { if (JSON.stringify(tbl[i]) !== JSON.stringify(EXPECTED_1SIDE[s])) { tblOK = false; errors.push(`TABLE row ${s}cm mismatch: ${JSON.stringify(tbl[i])}`); } });
  console.log(`[3] Desktop ตารางเต็ม 8×7: ${tblOK ? 'ตรงตารางล็อกทุกช่อง ✅' : 'FAIL'}`);

  if (errors.length) { console.log('\nERRORS:'); errors.forEach(e => console.log(' - ' + e)); }
  await browser.close();
  process.exit(fail + uiFail + (tblOK ? 0 : 1) > 0 ? 1 : 0);
})();
