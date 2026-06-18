/**
 * K2 Factory OS — ค่าคงที่และ label ภาษาไทย
 */
import type {
  ProductCategory,
  QuoteStatus,
  ProductionStatus,
  PaymentStatus,
  ShipmentStatus,
  UserRole,
} from '@/types/database';

export const APP_NAME = 'K2 Factory OS';
export const APP_DESCRIPTION = 'ระบบบริหารโรงงานผลิตงานพิมพ์และป้ายครบวงจร';

// Supabase Storage buckets
export const STORAGE_BUCKETS = {
  artwork: 'artwork', // ไฟล์งานที่ลูกค้าอัปโหลด (quote_items.file_url)
  slips: 'payment-slips', // หลักฐานการโอน (payments.slip_url)
  avatars: 'avatars',
} as const;

// ข้อจำกัดการอัปโหลดไฟล์งาน (หน้า Instant Quote)
export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024; // 20MB
export const UPLOAD_ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'psd', 'svg'] as const;
export const UPLOAD_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'application/pdf',
  'application/postscript', // .ai / .eps
  'application/illustrator', // .ai (บางเบราว์เซอร์)
  'image/vnd.adobe.photoshop', // .psd
  'application/octet-stream', // .ai/.psd บางครั้งส่งมาแบบนี้ — ตรวจซ้ำด้วยนามสกุล
] as const;
export const UPLOAD_ACCEPT_ATTR = '.jpg,.jpeg,.png,.pdf,.ai,.psd,.svg';

// % มัดจำเริ่มต้น
export const DEFAULT_DEPOSIT_PERCENT = 50;

// ---- หมวดสินค้า ----------------------------------------------------------
export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  qr_sign: 'ป้าย QR',
  acrylic_keychain: 'พวงกุญแจอะคริลิก',
  dtg_shirt: 'เสื้อ DTG',
  sticker: 'สติ๊กเกอร์',
};

// ---- สถานะใบเสนอราคา ------------------------------------------------------
export const QUOTE_STATUS: Record<QuoteStatus, { label: string; color: string }> = {
  draft: { label: 'แบบร่าง', color: 'zinc' },
  sent: { label: 'ส่งแล้ว', color: 'blue' },
  approved: { label: 'อนุมัติ', color: 'green' },
  rejected: { label: 'ปฏิเสธ', color: 'red' },
};

// ---- สถานะคิวการผลิต ------------------------------------------------------
export const PRODUCTION_STATUS: Record<ProductionStatus, { label: string; color: string }> = {
  queued: { label: 'รอผลิต', color: 'zinc' },
  in_production: { label: 'กำลังผลิต', color: 'orange' },
  qc: { label: 'QC', color: 'purple' },
  packing: { label: 'แพ็กสินค้า', color: 'blue' },
  shipped: { label: 'จัดส่งแล้ว', color: 'green' },
};

// ลำดับขั้นของคิวการผลิต (ใช้ทำ Kanban / progress)
export const PRODUCTION_FLOW: ProductionStatus[] = [
  'queued',
  'in_production',
  'qc',
  'packing',
  'shipped',
];

// ---- สถานะการชำระเงิน -----------------------------------------------------
export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'รอชำระ', color: 'zinc' },
  paid: { label: 'ชำระแล้ว', color: 'green' },
  refunded: { label: 'คืนเงิน', color: 'red' },
};

// ---- สถานะการจัดส่ง -------------------------------------------------------
export const SHIPMENT_STATUS: Record<ShipmentStatus, { label: string; color: string }> = {
  preparing: { label: 'เตรียมจัดส่ง', color: 'zinc' },
  shipped: { label: 'ส่งแล้ว', color: 'blue' },
  in_transit: { label: 'กำลังขนส่ง', color: 'orange' },
  delivered: { label: 'ส่งถึงแล้ว', color: 'green' },
  returned: { label: 'ตีกลับ', color: 'red' },
};

// ---- บทบาทผู้ใช้ ----------------------------------------------------------
export const USER_ROLES: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ',
  sales: 'ฝ่ายขาย',
  production: 'ฝ่ายผลิต',
  shipping: 'ฝ่ายจัดส่ง',
  viewer: 'ผู้ดูข้อมูล',
};

// บริษัทขนส่งที่รองรับ
export const CARRIERS = ['Kerry Express', 'Flash Express', 'J&T Express', 'ไปรษณีย์ไทย', 'Lalamove'];
