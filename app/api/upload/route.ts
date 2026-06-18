import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  STORAGE_BUCKETS,
  UPLOAD_MAX_BYTES,
  UPLOAD_ALLOWED_EXT,
} from '@/lib/constants';

export const runtime = 'nodejs';

/**
 * POST /api/upload  (multipart/form-data, field: "file")
 * อัปโหลดไฟล์งานของลูกค้าไป Supabase Storage (bucket: artwork)
 * - จำกัดขนาด ≤ 20MB
 * - รองรับ jpg, png, pdf, ai, psd, svg
 * ตรวจสอบฝั่ง server เสมอ และใช้ service-role (ไม่ expose ไป client)
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: 'ไฟล์ใหญ่เกิน 20MB' }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'ไฟล์ว่างเปล่า' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (!UPLOAD_ALLOWED_EXT.includes(ext as (typeof UPLOAD_ALLOWED_EXT)[number])) {
    return NextResponse.json(
      { error: 'รองรับเฉพาะไฟล์ jpg, png, pdf, ai, psd, svg' },
      { status: 415 },
    );
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'ระบบยังไม่ได้เชื่อมต่อ Storage (ยังไม่ได้ตั้งค่า Supabase)' },
      { status: 503 },
    );
  }

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `quotes/${stamp}-${rand}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.artwork)
    .upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: `อัปโหลดไม่สำเร็จ: ${error.message}` },
      { status: 500 },
    );
  }

  const { data: pub } = supabase.storage.from(STORAGE_BUCKETS.artwork).getPublicUrl(path);

  return NextResponse.json({
    path,
    url: pub.publicUrl,
    name: file.name,
    size: file.size,
  });
}
