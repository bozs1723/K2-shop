/**
 * K2SIGN Pricing Logic — Velo public module (public/k2-pricing.js)
 * Port ตรงจาก k2sign-theme/assets/js/pricing-selector.js — ตัวเลข LOCKED (Handoff Final v1.2 §5)
 * ห้ามแก้ตัวเลขโดยไม่ผ่านท่านประธาน · source of truth = ช่อง pricingJson ใน CMS (Services)
 *
 * ใช้ใน page code:  import { K2_CALC, parsePricing, rowsFor, surchargeLabel } from 'public/k2-pricing.js'
 * ทดสอบได้ใน Node ตรง ๆ (module.exports ด้านล่าง) — เทสต์ 112 ค่าใช้ไฟล์นี้โดยตรง
 */

/** แปลง pricing JSON (string จาก CMS) เป็น object พร้อมตรวจโครง */
function parsePricing(json) {
  const d = typeof json === 'string' ? JSON.parse(json) : json;
  if (!d || !Array.isArray(d.sizes_cm) || !d.price_matrix_1side || !d.two_side_surcharge) {
    throw new Error('pricing JSON ผิดโครงสร้าง');
  }
  return d;
}

/**
 * K2_CALC — ราคา/ชิ้น ตาม (ขนาด cm, ช่วงจำนวน index 0–6, จำนวนด้าน 1|2)
 * เหมือน window.K2_CALC ของ prototype ทุกประการ
 */
function K2_CALC(data, sizeCm, tierIndex, sides) {
  const base = data.price_matrix_1side[String(sizeCm)][tierIndex];
  return sides === 2 ? base + data.two_side_surcharge[String(sizeCm)] : base;
}

/** แถวราคา 7 ช่วงของขนาด/ด้านที่เลือก — ใช้ผูก repeater #psRows */
function rowsFor(data, sizeCm, sides) {
  return data.qty_tiers.map((tier, i) => ({
    _id: `${sizeCm}-${sides}-${i}`,
    tier,
    price: K2_CALC(data, sizeCm, i, sides),
  }));
}

/** ป้าย "+N บาท/ชิ้น" ของปุ่มพิมพ์ 2 ด้าน (Q3: ตามขนาด) */
function surchargeLabel(data, sizeCm) {
  return `+${data.two_side_surcharge[String(sizeCm)]} บาท/ชิ้น`;
}

/** ข้อมูลตาราง Desktop เต็ม 8×7 (พิมพ์ 1 ด้าน) */
function desktopTable1Side(data) {
  return data.sizes_cm.map((s) => ({
    size: s,
    prices: data.price_matrix_1side[String(s)],
  }));
}

/** ข้อมูลตารางเพิ่มพิมพ์ 2 ด้าน (แถวเดียวตามขนาด) */
function desktopTable2Side(data) {
  return data.sizes_cm.map((s) => ({ size: s, surcharge: data.two_side_surcharge[String(s)] }));
}

export { parsePricing, K2_CALC, rowsFor, surchargeLabel, desktopTable1Side, desktopTable2Side };
