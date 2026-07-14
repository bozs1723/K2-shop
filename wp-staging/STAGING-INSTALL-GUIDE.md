# K2SIGN Staging Install Guide — /services/acrylic-keychain/
> คู่มือติดตั้งบน Z.com (หรือ hosting ใด ๆ) ตาม Staging Deployment Plan S1–S5 · Handoff Final v1.2
> ผู้ติดตั้ง: dev WordPress หรือ Claude Code บนเครื่องที่เข้าถึง hosting ได้

## ⚠️ ก่อนเริ่ม (ขั้นที่ 1 ของท่านประธาน — ห้ามลบข้อมูล)
1. Backup ทั้งไซต์เดิม (ไฟล์ + ฐานข้อมูล) ก่อนแตะอะไรทั้งสิ้น
2. ตรวจ WordPress เดิม: เวอร์ชัน WP/PHP · ปลั๊กอินที่ใช้อยู่ · theme ปัจจุบัน · permalink structure · หน้า/โพสต์เดิม
3. **ห้ามติดตั้งทับไซต์ production** — ทำบน staging subdomain เท่านั้น

## S1 — ตั้ง Staging
1. สร้าง subdomain `staging.k2sign.com` (Z.com control panel)
2. ติดตั้ง WordPress สะอาด (PHP ≥7.4)
3. เปิด **Basic Auth** ที่ระดับ server (Z.com: .htaccess + .htpasswd)
4. Settings → Reading → เปิด "Discourage search engines" + ธีมนี้ยิง `noindex` อัตโนมัติเมื่อ `WP_ENVIRONMENT_TYPE` ≠ production
   - เพิ่มใน wp-config.php: `define('WP_ENVIRONMENT_TYPE', 'staging');`
5. robots.txt: `Disallow: /`

## S2 — ติดตั้งธีม + ปลั๊กอิน
1. อัปโหลดโฟลเดอร์ `k2sign-theme/` ไป `wp-content/themes/` แล้ว Activate
2. ติดตั้งปลั๊กอิน: **ACF Pro** (จำเป็น — ใช้ repeater/gallery) · **Rank Math SEO** · caching/webp ตามนโยบาย
3. Settings → Permalinks → Post name แล้ว Save (ให้ rewrite ของ CPT ทำงาน)

## S3 — สร้างข้อมูล
1. สร้างโพสต์ CPT **บริการ (service)** ชื่อ "พวงกุญแจอะคริลิก" slug = `acrylic-keychain` → URL จะเป็น `/services/acrylic-keychain/`
2. กรอก ACF ตาม **Content Entry Guide (Handoff §7)** — ข้อความล็อกมี default ให้แล้วเกือบทั้งหมด
3. ช่อง **Pricing JSON**: คัดลอกทั้งก้อนจาก `k2sign-theme/assets/js/pricing-data.json` (ตัวเลข LOCKED — ห้ามพิมพ์เอง)
   - ถ้าเว้นว่าง ธีมจะ fallback ไปอ่านไฟล์ locked ในธีมให้อัตโนมัติ
4. Trust 5 ใบ / Accessories 5 การ์ด / Features 4 / Steps 4 / FAQ 6 — ตามเอกสาร §3 + prototype
5. ภาพ: ใช้ภาพจริงจากคลัง Drive ที่ผ่านการคัดเท่านั้น (webp ≤200KB, Hero ≤300KB, alt ไทย) · Hero รออลันยืนยัน — ระหว่างนี้ปล่อยว่าง = placeholder แสดงเอง

## S4–S5 — ตรวจรับ
1. เทียบผลกับ `prototype/acrylic-keychain.html` (reference ที่ผ่าน QA แล้ว)
2. รันเทสต์ราคา: `cd tests && npm i playwright && node test-pricing-112.js` (แก้ URL ในไฟล์ให้ชี้ staging ได้)
   - ผลที่ต้องได้: **K2_CALC 112/112 · UI 112/112 · ตาราง Desktop ตรงทุกช่อง**
3. Screenshot 1440/768/390 ส่งอลัน Design QA (S6) → ท่านประธานอนุมัติ (S7) → จึง Go-live (S8)

## สิ่งที่ทำแล้ว / ยังไม่ได้ทำ
| รายการ | สถานะ |
|---|---|
| Custom theme (tokens + type scale + C1–C11 + tablet hybrid) | ✅ ในแพ็กเกจนี้ |
| CPT service/portfolio + ACF fields + pricing JSON locked | ✅ |
| Pricing Selector + เทสต์ 112 ค่า ผ่าน 100% | ✅ (บน prototype) |
| LINE @k2sign · 065-989-5887 · อีเมล ผูกทุก CTA | ✅ |
| Hero = placeholder (ห้าม generated) | ✅ |
| ติดตั้งบน Z.com จริง + Basic Auth | ⛔ รอสิทธิ์เข้า hosting |
| ฟอร์ม /quote/ + GA4/webhook events | 🔜 เฟสถัดไป (ปุ่มมี data-event รอผูกแล้ว) |
| Go-live | ⛔ ห้าม (ตามคำสั่ง) |
