# K2SIGN Staging Report — /services/acrylic-keychain/

> ผลการติดตั้งตาม `STAGING-INSTALL-GUIDE.md` (S1–S5) จากแพ็กเกจ `K2SIGN-Staging-Package-v1.zip`
> วันที่: 2026-07-14 · ติดตั้งโดย Claude Code บน **staging จำลองใน sandbox** (ยังไม่ใช่ Z.com จริง — รอสิทธิ์ hosting ตามตาราง "สิ่งที่ทำแล้ว/ยังไม่ได้ทำ" ในคู่มือ)

## 1. สิ่งที่พบใน ZIP (ตรวจก่อนเริ่ม)

```
wp-staging/
├── STAGING-INSTALL-GUIDE.md          คู่มือติดตั้ง S1–S5
├── k2sign-theme/                     ธีม WordPress (LOCKED tokens/type scale/C1–C11)
│   ├── style.css · functions.php · header.php · footer.php · index.php
│   ├── single-service.php            template หน้า service (ลำดับ C1→C11 ล็อกใน template)
│   ├── inc/cpt.php                   CPT: service (/services/) + portfolio (/portfolio/)
│   ├── inc/acf-fields.php            ACF field group (hero/trust/pricing_json/acc/features/gallery/volume/steps/faq/cta)
│   └── assets/  tokens.css · page-acrylic-keychain.css · pricing-selector.js · pricing-data.json (LOCKED)
├── prototype/acrylic-keychain.html   reference ผ่าน QA แล้ว
└── tests/  test-pricing-112.js (112 ค่า ×2 ชั้น + ตาราง desktop) · screenshots.js
```

## 2. สิ่งที่ติดตั้ง/ตั้งค่าแล้ว (บน staging จำลอง)

| ขั้น | รายการ | สถานะ |
|---|---|---|
| S1.2 | WordPress สะอาด (WP ล่าสุด, PHP 8.4, SQLite drop-in — sandbox ไม่มี MySQL) | ✅ |
| S1.3 | **Basic Auth ระดับ server** — user `k2staging` / pass `K2preview2026` (ไม่มี auth → 401) | ✅ |
| S1.4 | Discourage search engines + `WP_ENVIRONMENT_TYPE = staging` → ธีมยิง `noindex, nofollow` อัตโนมัติ (ยืนยันใน HTML แล้ว) | ✅ |
| S1.5 | robots.txt = `Disallow: /` (ไฟล์จริงใน docroot — WP 5.7+ เลิกใส่ให้เองแม้ปิด search engine) | ✅ |
| S2.1 | ธีม `k2sign-theme` v0.1.0-staging — Activate แล้ว | ✅ |
| S2.2 | **Rank Math SEO** ✅ · **ACF → ใช้ Secure Custom Fields (ดูหมายเหตุ)** | ⚠️ ดูข้อ 5 |
| S2.3 | Permalinks = Post name + flush rewrite | ✅ |
| S3.1 | CPT `service` โพสต์ "พวงกุญแจอะคริลิก" slug `acrylic-keychain` → URL `/services/acrylic-keychain/` | ✅ |
| S3.2 | กรอก ACF ครบ — เนื้อหาคัดจาก `prototype/acrylic-keychain.html` (reference ผ่าน QA) ไม่แต่งเอง; ข้อความ `[รอฝ่ายผลิตยืนยัน]` คงไว้ตามเดิม | ✅ |
| S3.3 | Pricing JSON คัดลอกทั้งก้อนจาก `pricing-data.json` (LOCKED — ไม่พิมพ์เอง) | ✅ |
| S3.4 | Trust 5 / Accessories 5 / Features 4 / Steps 4 / FAQ 6 + เมนู primary/footer ตาม prototype | ✅ |
| S3.5 | Hero = ว่าง → placeholder ของธีมแสดงเอง · Portfolio = ภาพ placeholder สีเทา 6 ภาพ (ระบุชัดว่า PLACEHOLDER รอภาพจริงจาก Drive — **ไม่ใช่ภาพ generated**) | ✅ |

**ไม่ได้แตะ Production ใด ๆ** — ทั้งหมดอยู่ใน sandbox แยก · **ไม่มีการ Go-live** ตามคำสั่ง

## 3. ผลตรวจรับ S4–S5

### เทสต์ราคา (`tests/test-pricing-112-staging.js` — สำเนาของเทสต์เดิม แก้เฉพาะ URL+Basic Auth ตาม S4.2)

```
[1/2] K2_CALC: 112/112 ผ่าน
[2/2] UI render: 112/112 ผ่าน
[3] Desktop ตารางเต็ม 8×7: ตรงตารางล็อกทุกช่อง ✅
```

### Responsive QA (`tests/screenshots-staging.js` — เพิ่ม 320px ตามคำสั่งงาน)

| Viewport | Hero/Header ไม่ชนกัน | Sticky CTA ไม่บังเนื้อหา |
|---|---|---|
| 1440 | ✅ | — (sticky ซ่อนบน desktop) |
| 768 | ✅ | ✅ footer ไม่ถูกทับ |
| 390 | ✅ | ✅ footer ไม่ถูกทับ |
| 320 | ✅ (ไม่มี horizontal overflow) | ✅ footer ไม่ถูกทับ |

Screenshots ทั้งหมดอยู่ที่ `wp-staging/screenshots/` (full page 4 ขนาด + sticky CTA 3 ขนาด)

## 4. วิธีรัน staging จำลองนี้ซ้ำ (เครื่องใดก็ได้ที่มี PHP ≥8.1)

1. ติดตั้ง WP + SQLite drop-in + ธีม + ปลั๊กอิน ตามขั้นตอนในรายงานนี้ (หรือใช้ wp-cli ตาม S1–S3)
2. `php -S 127.0.0.1:8043 -t wordpress router.php` — `router.php` ทำ Basic Auth + permalink routing
3. เข้า `http://127.0.0.1:8043/services/acrylic-keychain/` (user `k2staging` / pass `K2preview2026`)
4. เทสต์: `cd tests && npm i playwright && node test-pricing-112-staging.js && node screenshots-staging.js`

## 5. ⚠️ หมายเหตุ ACF Pro

**ACF Pro เป็นปลั๊กอินมี license — ไม่มีไฟล์/คีย์ในแพ็กเกจ** จึงติดตั้งบน sandbox ไม่ได้
บน staging จำลองนี้ใช้ **Secure Custom Fields** (fork ของ ACF บน wordpress.org ที่เปิด repeater/gallery ให้ฟรี, ใช้ API `get_field`/`acf_add_local_field_group` ตัวเดียวกัน) — ธีมทำงานครบทุก section และผ่านเทสต์ทั้งหมด
**บน staging.k2sign.com จริง แนะนำติดตั้ง ACF Pro ตามคู่มือ** ด้วย license ของบริษัท แล้วข้อมูล field ทั้งหมดใช้โครงเดียวกันได้ทันที (หรือคงใช้ SCF ก็เข้ากันได้)

## 6. สิ่งที่เจ้าของเว็บ/ผู้มีสิทธิ์ hosting ต้องทำ (ก่อนย้ายขึ้น Z.com จริง)

1. **Backup ทั้งไซต์ production (ไฟล์ + DB) ก่อนแตะอะไรทั้งสิ้น** — ขั้นที่ 1 ของคู่มือ ห้ามข้าม
2. สร้าง subdomain `staging.k2sign.com` + ติดตั้ง WordPress สะอาด (PHP ≥7.4) + MySQL
3. เปิด Basic Auth ด้วย `deploy/htaccess-basic-auth.example` + สร้าง `.htpasswd`
4. เพิ่มบรรทัดจาก `deploy/wp-config-staging-snippet.php` ใน wp-config.php
5. วาง `deploy/robots-staging.txt` เป็น `robots.txt` ใน docroot
6. ติดตั้ง ACF Pro (license บริษัท) + Rank Math แล้วทำ S2–S3 ตามคู่มือ (ใช้รายงานนี้เป็น checklist ได้)
7. รันเทสต์ S4 ชี้ URL staging จริง → ต้องได้ 112/112 ทั้งสองชั้น
8. ส่ง screenshot ให้อลัน Design QA (S6) → ท่านประธานอนุมัติ (S7) — **Go-live (S8) ยังห้ามตามคำสั่ง**
