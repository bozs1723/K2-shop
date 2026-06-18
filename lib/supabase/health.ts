import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { STORAGE_BUCKETS } from '@/lib/constants';

export interface SupabaseHealth {
  env: {
    url: boolean;
    anonKey: boolean;
    serviceRoleKey: boolean;
  };
  connected: boolean;
  productCount: number | null;
  pricingRuleCount: number | null;
  artworkBucketExists: boolean | null;
  error: string | null;
}

/**
 * ตรวจสุขภาพการเชื่อมต่อ Supabase (ใช้ฝั่ง server เท่านั้น)
 * คืนเฉพาะ "สถานะ" — ไม่คืนค่า secret/env จริงใด ๆ
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // นับว่า "ตั้งค่าแล้ว" ก็ต่อเมื่อมีค่าและไม่ใช่ placeholder
  const isSet = (v: string) => v.length > 0 && !/placeholder|your-|YOUR-/i.test(v);

  const env = {
    url: isSet(url),
    anonKey: isSet(anonKey),
    serviceRoleKey: isSet(serviceRoleKey),
  };

  const result: SupabaseHealth = {
    env,
    connected: false,
    productCount: null,
    pricingRuleCount: null,
    artworkBucketExists: null,
    error: null,
  };

  if (!env.url || !env.serviceRoleKey) {
    result.error = 'ยังไม่ได้ตั้งค่า env (URL หรือ Service Role Key)';
    return result;
  }

  try {
    const supabase = createAdminClient();

    const { count: productCount, error: prodErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (prodErr) throw prodErr;

    result.connected = true;
    result.productCount = productCount ?? 0;

    const { count: ruleCount } = await supabase
      .from('pricing_rules')
      .select('*', { count: 'exact', head: true });
    result.pricingRuleCount = ruleCount ?? 0;

    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (!bucketErr && buckets) {
      result.artworkBucketExists = buckets.some((b) => b.name === STORAGE_BUCKETS.artwork);
    }
  } catch (e) {
    result.connected = false;
    result.error = e instanceof Error ? e.message : 'เชื่อมต่อ Supabase ไม่สำเร็จ';
  }

  return result;
}
