/* ทดสอบ K2_CALC ของ Velo public module (public/k2-pricing.js) ครบ 112 ค่า
 * Expected matrix ฝังแยกอิสระจาก pricing JSON (ชุดเดียวกับ tests/test-pricing-112.js เดิม — LOCKED ห้ามแก้)
 * รัน: node wix/tests/test-velo-pricing-112.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parsePricing, K2_CALC, rowsFor, surchargeLabel, desktopTable1Side } from '../velo/public/k2-pricing.js';

const __dir = dirname(fileURLToPath(import.meta.url));

// ตารางล็อก (Handoff Final v1.2 §5) — ห้ามแก้
const EXPECTED_1SIDE = {
  3: [80, 39, 35, 29, 19, 17, 16], 4: [85, 44, 40, 34, 24, 22, 20],
  5: [90, 49, 45, 39, 29, 27, 25], 6: [95, 54, 50, 44, 34, 31, 29],
  7: [100, 59, 55, 49, 39, 36, 34], 8: [130, 64, 60, 54, 44, 41, 39],
  9: [140, 69, 65, 59, 49, 46, 43], 10: [150, 74, 70, 64, 54, 51, 47],
};
const EXPECTED_SURCHARGE = { 3: 5, 4: 5, 5: 10, 6: 10, 7: 15, 8: 15, 9: 20, 10: 20 };
const SIZES = [3, 4, 5, 6, 7, 8, 9, 10];

// ใช้ pricing JSON จากไฟล์ locked ของธีม (source เดียวกับที่ใส่ใน CMS pricingJson)
const json = readFileSync(join(__dir, '../../wp-staging/k2sign-theme/assets/js/pricing-data.json'), 'utf8');
const data = parsePricing(json);

let pass = 0, fail = 0;
const errors = [];

// [1] K2_CALC ครบ 8 ขนาด × 7 ช่วง × 2 ด้าน = 112 ค่า
for (const size of SIZES) for (let t = 0; t < 7; t++) for (const side of [1, 2]) {
  const got = K2_CALC(data, size, t, side);
  const exp = EXPECTED_1SIDE[size][t] + (side === 2 ? EXPECTED_SURCHARGE[size] : 0);
  if (got === exp) pass++;
  else { fail++; errors.push(`CALC size=${size} tier=${t} side=${side}: got ${got}, expected ${exp}`); }
}
console.log(`[1/3] Velo K2_CALC: ${pass}/112 ผ่าน${fail ? ` · ${fail} FAIL` : ''}`);

// [2] rowsFor (ที่ผูก repeater #psRows) — ทุกขนาด × ด้าน ครบ 112 ค่า
let rPass = 0, rFail = 0;
for (const size of SIZES) for (const side of [1, 2]) {
  const rows = rowsFor(data, size, side);
  if (rows.length !== 7) { rFail += 7; errors.push(`rows size=${size} side=${side}: ${rows.length} แถว`); continue; }
  rows.forEach((r, t) => {
    const exp = EXPECTED_1SIDE[size][t] + (side === 2 ? EXPECTED_SURCHARGE[size] : 0);
    if (r.price === exp && r.tier === data.qty_tiers[t]) rPass++;
    else { rFail++; errors.push(`row size=${size} tier=${t} side=${side}: ${r.price}/${r.tier}`); }
  });
  if (side === 2) {
    const sur = surchargeLabel(data, size);
    if (sur !== `+${EXPECTED_SURCHARGE[size]} บาท/ชิ้น`) errors.push(`SUR size=${size}: "${sur}"`);
  }
}
console.log(`[2/3] rowsFor (UI data): ${rPass}/112 ผ่าน${rFail ? ` · ${rFail} FAIL` : ''}`);

// [3] ตาราง Desktop 8×7 ตรง matrix ล็อกทุกช่อง
const tbl = desktopTable1Side(data);
let tblOK = tbl.length === 8;
SIZES.forEach((s, i) => {
  if (JSON.stringify(tbl[i].prices) !== JSON.stringify(EXPECTED_1SIDE[s])) { tblOK = false; errors.push(`TABLE ${s}cm mismatch`); }
});
console.log(`[3/3] Desktop ตารางเต็ม 8×7: ${tblOK ? 'ตรงตารางล็อกทุกช่อง ✅' : 'FAIL'}`);

if (errors.length) { console.log('\nERRORS:'); errors.forEach((e) => console.log(' - ' + e)); }
process.exit(fail + rFail + (tblOK ? 0 : 1) > 0 ? 1 : 0);
