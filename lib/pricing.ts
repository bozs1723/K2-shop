/**
 * K2 Factory OS — Instant Quote pricing engine
 *
 * คำนวณราคาประมาณการและระยะเวลาผลิต จากกฎใน pricing_rules
 * ใช้ร่วมกันได้ทั้งฝั่ง client (หน้า Instant Quote) และ server
 */
import type { Product, PricingRule } from '@/types';

export interface QuoteSelection {
  /** key ของกฎ rule_type='size' */
  size?: string;
  /** key ของกฎ rule_type='material' */
  material?: string;
  /** keys ของกฎ rule_type='option' (เลือกได้หลายข้อ) */
  options?: string[];
  /** จำนวนที่สั่ง */
  quantity: number;
}

export interface QuoteResult {
  unitPrice: number; // ราคาต่อหน่วย (รวมส่วนลดตามจำนวนแล้ว)
  setupFee: number; // ค่าธรรมเนียมเหมาจ่าย (flat)
  total: number; // ราคารวมประมาณการ
  productionDays: number; // ระยะเวลาผลิตโดยประมาณ (วัน)
  quantity: number;
}

/** หากระบุ qty ในช่วงไหน ให้คืนกฎ quantity_tier ที่ตรง */
function findTier(rules: PricingRule[], quantity: number): PricingRule | undefined {
  return rules.find(
    (r) =>
      r.rule_type === 'quantity_tier' &&
      quantity >= (r.min_qty ?? 0) &&
      quantity <= (r.max_qty ?? Number.MAX_SAFE_INTEGER),
  );
}

function ruleByKey(rules: PricingRule[], type: PricingRule['rule_type'], key?: string) {
  if (!key) return undefined;
  return rules.find((r) => r.rule_type === type && r.key === key);
}

/**
 * คำนวณราคา Instant Quote
 * @param product   สินค้า (ใช้ base_price และ production_days เป็นค่าตั้งต้น)
 * @param rules     กฎราคาทั้งหมดของสินค้านั้น
 * @param selection ตัวเลือกของลูกค้า
 */
export function calculateQuote(
  product: Pick<Product, 'base_price' | 'production_days'>,
  rules: PricingRule[],
  selection: QuoteSelection,
): QuoteResult {
  const quantity = Math.max(1, Math.floor(selection.quantity || 1));

  let unitPrice = Number(product.base_price);
  let setupFee = 0;
  let extraDays = 0;

  const applyRule = (rule?: PricingRule) => {
    if (!rule) return;
    const value = Number(rule.value);
    if (rule.modifier === 'per_unit') unitPrice += value;
    else if (rule.modifier === 'flat') setupFee += value;
    else if (rule.modifier === 'multiplier') unitPrice *= value;
    extraDays += rule.extra_days ?? 0;
  };

  // ขนาด + วัสดุ
  applyRule(ruleByKey(rules, 'size', selection.size));
  applyRule(ruleByKey(rules, 'material', selection.material));

  // ตัวเลือกเสริม (หลายข้อ)
  for (const key of selection.options ?? []) {
    applyRule(ruleByKey(rules, 'option', key));
  }

  // ส่วนลดตามจำนวน (multiplier) — ใช้กับราคาต่อหน่วยหลังบวกตัวเลือก
  const tier = findTier(rules, quantity);
  if (tier) {
    unitPrice *= Number(tier.value);
    extraDays += tier.extra_days ?? 0;
  }

  unitPrice = Math.round(unitPrice * 100) / 100;
  const total = Math.round((unitPrice * quantity + setupFee) * 100) / 100;
  const productionDays = product.production_days + extraDays;

  return { unitPrice, setupFee, total, productionDays, quantity };
}
