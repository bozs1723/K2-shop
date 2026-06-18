import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Product, PricingRule } from '@/types';

/**
 * Query helpers (Server-side) สำหรับข้อมูลสาธารณะที่ใช้บนเว็บลูกค้า
 * products / pricing_rules เปิดอ่านแบบ public (anon) ตาม RLS
 *
 * ทุกฟังก์ชันออกแบบให้ "ทนต่อความผิดพลาด" — หากยังไม่ได้เชื่อม Supabase
 * จะคืนค่าว่างแทนที่จะ throw เพื่อให้หน้าเว็บยังเรนเดอร์ได้
 */

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export type ProductWithPricing = Product & { pricing_rules: PricingRule[] };

export async function getProductsWithPricingRules(): Promise<ProductWithPricing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, pricing_rules(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) return [];
    return (data as ProductWithPricing[]) ?? [];
  } catch {
    return [];
  }
}
