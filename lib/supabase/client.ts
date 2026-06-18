'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Supabase client สำหรับฝั่ง Browser (Client Components)
 * ใช้ NEXT_PUBLIC_* env (ปลอดภัยที่จะเปิดเผยฝั่ง client)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
