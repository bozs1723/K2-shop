# Deploy K2SIGN Staging v1.1 บน Z.com WP-Pro-S

> ทำตาม `STAGING-INSTALL-GUIDE.md` (v1.1 — SCF เป็นปลั๊กอินมาตรฐาน, ห้าม ACF Pro ซ้อน)
> ⛔ ห้ามชี้ DNS ของ k2sign.com · ห้าม Go-live · ห้ามแตะ production

## สิ่งที่ต้องมีจาก Z.com control panel (เจ้าของ hosting)

1. **Backup production ทั้งไฟล์ + DB ก่อน** (ขั้นที่ 1 ของคู่มือ — ห้ามข้าม)
2. สร้าง staging ด้วยวิธีใดวิธีหนึ่ง:
   - **Staging Tool ของ WP-Pro-S** (ถ้าแพลนมี): กดสร้าง staging copy → ได้ Temporary URL อัตโนมัติ
   - หรือติดตั้ง **WordPress ใหม่สะอาด** บน Temporary URL / subdomain staging (PHP ≥7.4, **MySQL/MariaDB ของ hosting**)
3. ข้อมูลที่ผู้ deploy ต้องได้รับ: Temporary URL, SSH หรือ SFTP credentials, path ของ document root

## ขั้น deploy (ผ่าน SSH)

```bash
# 1) อัปโหลดโฟลเดอร์ wp-staging/ (แพ็กเกจ v1.1 + deploy/ + tests/) ไปไว้ข้าง docroot
scp -r wp-staging user@host:~/

# 2) รัน one-shot setup (ทำ S1.4–S3 + SCF compat check ให้ทั้งหมด)
ssh user@host 'bash ~/wp-staging/deploy/zcom-setup.sh /path/to/staging-docroot'

# 3) เปิด Basic Auth (S1.3) — ระดับ server
#    - สร้าง .htpasswd นอก docroot:  htpasswd -c ~/.htpasswd k2staging
#    - เพิ่มบล็อกจาก deploy/htaccess-basic-auth.example ไว้บนสุดของ .htaccess ใน docroot
#    - แก้ AuthUserFile ให้ชี้ path จริง
```

สคริปต์ `zcom-setup.sh` มี guard: หยุดทันทีถ้า siteurl เป็น k2sign.com ที่ไม่ใช่ staging
และหยุดถ้าพบ ACF/ACF Pro active (มาตรฐานโปรเจกต์ = SCF เท่านั้น)

## ตรวจรับ (S4–S5)

```bash
# จากเครื่องที่มี node + Playwright + Chromium
cd wp-staging/tests && npm i playwright

STAGING_URL='https://<temporary-url>/services/acrylic-keychain/' \
BASIC_AUTH_USER='k2staging' BASIC_AUTH_PASS='<รหัสจริง>' \
node test-pricing-112-staging.js        # ต้องได้ K2_CALC 112/112 · UI 112/112 · ตาราง desktop ตรง

STAGING_URL='https://<temporary-url>/services/acrylic-keychain/' \
BASIC_AUTH_USER='k2staging' BASIC_AUTH_PASS='<รหัสจริง>' \
node screenshots-staging.js             # screenshot 1440/768/390/320 + ตรวจ sticky CTA/Hero/Header
```

ตรวจ log บนเซิร์ฟเวอร์: `wp-content/debug.log` ต้องว่าง (เปิด WP_DEBUG_LOG ชั่วคราวได้ด้วย
`wp config set WP_DEBUG true --raw && wp config set WP_DEBUG_LOG true --raw && wp config set WP_DEBUG_DISPLAY false --raw`)

## Checklist ก่อนส่งมอบ

- [ ] Temporary URL เข้าได้ + Basic Auth ถาม user/pass (ไม่มี auth → 401)
- [ ] `<meta name="robots" content="noindex, nofollow">` อยู่ใน `<head>` ทุกหน้า
- [ ] `/robots.txt` = `User-agent: *` + `Disallow: /`
- [ ] `wp eval 'echo wp_get_environment_type();'` = `staging`
- [ ] SCF compat check ผ่านครบ (สคริปต์รันให้อัตโนมัติ)
- [ ] pricing test 112/112 ทั้งสองชั้น + ตาราง desktop
- [ ] debug.log ว่าง
- [ ] ส่ง URL + Basic Auth + screenshots ให้อลัน (S6) → ท่านประธาน (S7)
- [ ] ⛔ ไม่ Go-live (S8 ต้องรออนุมัติ)
