/**
 * K2 Factory OS — ฟังก์ชันช่วยเหลือทั่วไป
 */

/** รวม className แบบกรองค่า falsy (ทดแทน clsx เบื้องต้น) */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** จัดรูปแบบเงินบาท */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** จัดรูปแบบวันที่ภาษาไทย */
export function formatThaiDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/** จำนวนวันคงเหลือถึงกำหนด (ติดลบ = เลยกำหนด) */
export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const due = new Date(date);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}
