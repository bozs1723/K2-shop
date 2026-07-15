#!/bin/bash
# ============================================================================
# K2SIGN Staging v1.1 — one-shot setup สำหรับ Z.com WP-Pro-S (หรือ hosting ใด ๆ)
# รันบนเซิร์ฟเวอร์ผ่าน SSH ใน document root ของ "staging WordPress ที่ติดตั้งสะอาดแล้ว"
# (ใช้ MySQL/MariaDB ของ hosting ตามปกติ — สคริปต์นี้ไม่แตะ database engine)
#
# ก่อนรัน:
#   1. Backup ไซต์เดิมทั้งไฟล์+DB แล้ว (ขั้นที่ 1 ของ STAGING-INSTALL-GUIDE.md)
#   2. WordPress สะอาดติดตั้งบน Temporary URL / staging subdomain แล้ว (ห้ามชี้ DNS k2sign.com)
#   3. อัปโหลดโฟลเดอร์ wp-staging/ ทั้งชุดไว้ข้าง document root เช่น ~/wp-staging
#   4. มี wp-cli (Z.com WP-Pro-S มีให้ — หรือ: curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar)
#
# วิธีรัน:  bash wp-staging/deploy/zcom-setup.sh /path/to/docroot
# หลังรัน:  เปิด Basic Auth ด้วย deploy/htaccess-basic-auth.example (ทำมือ — ต้องรู้ path .htpasswd)
# ============================================================================
set -euo pipefail

DOCROOT="${1:?ระบุ path document root ของ staging WordPress}"
PKG="$(cd "$(dirname "$0")/.." && pwd)"   # โฟลเดอร์ wp-staging/
WP="wp --path=$DOCROOT"
command -v wp >/dev/null || WP="php $HOME/wp-cli.phar --path=$DOCROOT"

echo "== ตรวจว่าเป็น staging ไม่ใช่ production =="
URL=$($WP option get siteurl)
case "$URL" in
  *k2sign.com*) if [[ "$URL" != *staging* ]]; then
    echo "❌ siteurl=$URL ดูเหมือน production — หยุดทันที (ห้ามติดตั้งทับ production)"; exit 1; fi ;;
esac
echo "siteurl = $URL ✅"

echo "== S1.4: WP_ENVIRONMENT_TYPE=staging + discourage search engines =="
$WP config set WP_ENVIRONMENT_TYPE staging --type=constant
$WP option update blog_public 0

echo "== S1.5: robots.txt Disallow: / =="
cp "$PKG/deploy/robots-staging.txt" "$DOCROOT/robots.txt"

echo "== S2.1: ติดตั้งธีม k2sign-theme =="
rm -rf "$DOCROOT/wp-content/themes/k2sign-theme"
cp -r "$PKG/k2sign-theme" "$DOCROOT/wp-content/themes/"
$WP theme activate k2sign-theme

echo "== S2.2: ปลั๊กอินมาตรฐาน — SCF (ห้าม ACF Pro ซ้อน) + Rank Math =="
if $WP plugin is-active advanced-custom-fields-pro 2>/dev/null || $WP plugin is-active advanced-custom-fields 2>/dev/null; then
  echo "❌ พบ ACF/ACF Pro active อยู่ — มาตรฐานโปรเจกต์ (มติ 15 ก.ค. 2026) ห้ามติดตั้งซ้อนกับ SCF"
  echo "   ปิด/ลบ ACF ก่อน แล้วรันใหม่"; exit 1
fi
$WP plugin install secure-custom-fields --activate
$WP plugin install seo-by-rank-math --activate

echo "== S2.3: Permalinks = Post name =="
$WP option update permalink_structure '/%postname%/'
$WP rewrite flush --hard 2>/dev/null || $WP rewrite flush

echo "== S3.1: โพสต์ service: acrylic-keychain =="
POST_ID=$($WP post list --post_type=service --name=acrylic-keychain --field=ID | head -1)
if [ -z "$POST_ID" ]; then
  POST_ID=$($WP post create --post_type=service --post_title='พวงกุญแจอะคริลิก' \
    --post_name=acrylic-keychain --post_status=publish --porcelain)
fi
echo "POST_ID=$POST_ID"

echo "== S3.2–S3.4: กรอกเนื้อหา (จาก prototype ผ่าน QA — pricing JSON จากไฟล์ locked) =="
$WP eval-file "$PKG/deploy/fill-content.php" "$POST_ID"

echo "== S3.5: Portfolio placeholder 6 ภาพ (รอภาพจริงจากคลัง Drive) =="
GAL=$($WP eval "echo count((array) get_field('portfolio_gallery', $POST_ID));")
if [ "$GAL" != "6" ]; then
  IDS=$($WP media import "$PKG"/deploy/placeholders/pf-placeholder-{1,2,3,4,5,6}.png --porcelain | tr '\n' ',' | sed 's/,$//')
  $WP eval "update_field('f_pf', array_map('intval', explode(',', '$IDS')), $POST_ID);"
  for id in ${IDS//,/ }; do
    $WP eval "update_post_meta($id, '_wp_attachment_image_alt', 'ภาพผลงาน placeholder — รอภาพจริงจากคลัง Drive');"
  done
fi

echo "== เมนู primary + footer ตาม prototype =="
if ! $WP menu list --fields=name | grep -q '^Main$'; then
  $WP menu create 'Main'
  for item in 'หน้าแรก /' 'บริการ /services/' 'ผลงาน /portfolio/' 'ราคา /pricing/' 'บทความ /blog/' 'ติดต่อเรา /contact/'; do
    set -- $item; $WP menu item add-custom Main "$1" "$2" > /dev/null
  done
  $WP menu location assign Main primary
fi
if ! $WP menu list --fields=name | grep -q '^Footer$'; then
  $WP menu create 'Footer'
  for item in 'หน้าแรก /' 'บริการ /services/' 'ผลงาน /portfolio/' 'ราคา /pricing/' 'ติดต่อเรา /contact/'; do
    set -- $item; $WP menu item add-custom Footer "$1" "$2" > /dev/null
  done
  $WP menu location assign Footer footer
fi

echo "== ตรวจรับ: SCF compatibility (repeater/gallery/registration/get_field) =="
$WP eval-file "$PKG/tests/scf-compat-check.php" "$POST_ID"

echo ""
echo "✅ ติดตั้งเสร็จ — ขั้นต่อไป (ทำมือ):"
echo "  1. เปิด Basic Auth: ดู deploy/htaccess-basic-auth.example + สร้าง .htpasswd"
echo "  2. รันเทสต์จากเครื่องที่มี Playwright (ส่ง URL + Basic Auth ผ่าน env):"
echo "     STAGING_URL='https://<temporary-url>/services/acrylic-keychain/' \\"
echo "     BASIC_AUTH_USER=... BASIC_AUTH_PASS=... node tests/test-pricing-112-staging.js"
echo "  3. Screenshot 1440/768/390/320: env เดียวกัน + node tests/screenshots-staging.js"
echo "  4. ตรวจ debug log: wp-content/debug.log ต้องว่าง"
echo "  ⛔ ห้าม Go-live / ห้ามชี้ DNS k2sign.com"
