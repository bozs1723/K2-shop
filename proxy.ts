import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Proxy (Next.js 16 — เดิมคือ middleware)
 * รีเฟรช Supabase session ทุก request และป้องกันเส้นทาง /dashboard
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // ทุกเส้นทาง ยกเว้นไฟล์ static และ image optimization
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
