import { z } from 'zod';

/**
 * Zod schemas — ใช้ validate payload ฝั่ง server (API routes)
 */

// เบอร์โทรไทย: ตัวเลข 9-10 หลัก (อนุญาตเว้นวรรค/ขีดแล้วตัดออกก่อนตรวจ)
const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^0\d{8,9}$/, 'เบอร์โทรไม่ถูกต้อง'));

// 1 รายการในใบเสนอราคา (Instant Quote — 1 สินค้า)
export const quoteItemInput = z.object({
  product_id: z.string().uuid('product_id ไม่ถูกต้อง'),
  size: z.string().optional(),
  material: z.string().optional(),
  options: z.array(z.string()).optional().default([]),
  quantity: z.coerce.number().int().positive('จำนวนต้องมากกว่า 0'),
  file_url: z.string().optional(),
  note: z.string().max(1000).optional(),
});

// payload ของ POST /api/quotes
export const createQuoteInput = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(200),
    phone: phoneSchema,
    line_id: z.string().trim().max(100).optional(),
    email: z.string().trim().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    company: z.string().trim().max(200).optional(),
  }),
  items: z.array(quoteItemInput).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
  note: z.string().max(2000).optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteInput>;

// query ของ GET /api/track — ต้องมี quote_number + phone เท่านั้น
export const trackInput = z.object({
  ref: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกเลขใบเสนอราคา')
    .transform((v) => v.toUpperCase()),
  phone: phoneSchema,
});
