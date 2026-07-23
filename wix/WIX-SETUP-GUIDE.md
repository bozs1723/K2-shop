# K2SIGN บน Wix Studio — คู่มือติดตั้ง + สิ่งที่เจ้าของเว็บต้องทำใน Wix Dashboard

> การย้ายจาก WordPress → Wix Studio ตาม Design Specification / Developer Handoff เดิม (Source of Truth)
> ห้ามเปลี่ยนดีไซน์ สี ฟอนต์ ราคา ลำดับ C1–C11 · **ห้าม Publish จนกว่าจะผ่าน QA**

## สิ่งที่ทำเสร็จแล้ว (ผ่าน API — ไม่ต้องทำซ้ำ)

| รายการ | สถานะ |
|---|---|
| Test Site ใหม่ **k2sign-staging** (Wix Studio, ยังไม่ publish, noindex) — metaSiteId `3d4d67bd-70dc-4cb5-a720-6b1bde6010f1` | ✅ |
| ติดตั้งแอป Wix CMS | ✅ |
| CMS Collection **Services** (24 fields ตาม mapping ACF → Wix ด้านล่าง) | ✅ |
| Item **acrylic-keychain** — เนื้อหาจาก prototype ผ่าน QA + `pricingJson` ตัวเลข LOCKED ทั้งก้อน | ✅ |
| Velo pricing module `velo/public/k2-pricing.js` — **ผ่านเทสต์ 112/112 + ตาราง 8×7** (`wix/tests/test-velo-pricing-112.mjs`) | ✅ |
| HTML bundle อ้างอิงดีไซน์ (prototype + CSS/JS inline) `wix/k2sign-acrylic-keychain-bundle.html` — ผ่าน 112/112 | ✅ |

## Mapping สถาปัตยกรรม (WordPress → Wix)

| WordPress | Wix |
|---|---|
| CPT `service` | CMS Collection `Services` |
| ACF/SCF fields | CMS Fields (ชื่อ field ดูในตารางล่าง) |
| `single-service.php` (C1–C11 ล็อกใน template) | Dynamic Item Page `/services/{slug}` (C1–C11 ล็อกใน Studio layout) |
| `pricing-selector.js` + `window.K2_CALC` | `public/k2-pricing.js` + page code `pages/services-item.page.js` |
| Theme components (header/footer/sticky CTA) | Studio reusable components (Header, Footer, StickyCTA) |
| `pricing-data.json` (fallback) | ช่อง `pricingJson` ใน CMS (source of truth เดียว) |

Mapping fields: `hero_h1→heroH1 · hero_sub→heroSub · usp_bullets→uspBullets(ARRAY) · starting_price→startingPrice · price_condition→priceCondition · hero_image→heroImage(IMAGE) · trust_items→trustItems(ARRAY) · pricing_json→pricingJson(TEXT) · accessories→accessories(ARRAY) · feature_cards→featureCards(ARRAY) · portfolio_gallery→portfolioGallery(MEDIA_GALLERY) · volume_*→volume*(TEXT) · steps→steps(ARRAY) · faq→faq(ARRAY) · accordion_*→accordion*(RICH_TEXT) · cta_*→cta*(TEXT)`

## ขั้นตอนที่ต้องทำใน Wix Studio editor (คนทำ: designer/dev — ~1–2 ชม.)

1. **เปิดไซต์ k2sign-staging ใน Wix Studio** (Dashboard → Sites → k2sign-staging)
2. **สร้าง Dynamic Item Page** ของ collection Services: CMS → Services → ⋮ → Add dynamic page → Item page แล้วตั้ง URL pattern เป็น `/services/{slug}` (Page settings → URL)
3. **วาง layout C1–C11 ตามลำดับล็อก** — อ้างอิงพิกเซลจาก `wix/k2sign-acrylic-keychain-bundle.html` (เปิดในเบราว์เซอร์) หรือ screenshots ใน `wix/screenshots/`
   - อีกทางที่เร็วกว่า: ใน Studio ใช้เมนู **Import from Claude / Import design from URL** (ถ้ามีในบัญชี) ชี้ไปที่
     `https://raw.githubusercontent.com/bozs1723/K2-shop/claude/elegant-allen-5qdsca/wix/k2sign-acrylic-keychain-bundle.html`
     แล้วปรับ element ID ตามข้อ 5
   - ฟอนต์: **Kanit 400/700 + Prompt 500** (Text theme) · สี/ระยะตาม `wp-staging/k2sign-theme/assets/css/tokens.css`
   - Desktop ≥1024px: แสดง **ตารางราคาเต็ม 8×7 + ตารางเพิ่ม 2 ด้าน** · Tablet/Mobile: แสดง **Pricing Selector** (ใช้ breakpoints ของ Studio ซ่อน/แสดง)
   - Mobile: Sticky bottom CTA (LINE / โทร / ส่งแบบ) — ต้องไม่บังเนื้อหา (body padding-bottom)
4. **เชื่อม dataset**: เพิ่ม Dataset ชื่อ `servicesDataset` (Read-only, collection Services) บนหน้า dynamic
5. **ตั้ง element IDs ให้ตรงกับ page code** (รายการเต็มดูใน `wix/velo/pages/services-item.page.js`):
   หลัก ๆ — `#heroH1 #heroSub #priceHero #priceCondition #uspRepeater(#uspText) #heroImage #heroPlaceholder
   #trustSection(#trustRepeater: #trustIcon #trustTitle) #psSizeRepeater(#psSizeBtn #psSizeBadge) #psSide1Btn #psSide2Btn(#psSide2Sur)
   #psTitle #psRows(#psRowTier #psRowPrice) #over500Link #priceNoteDesktop #priceNoteMobile
   #tbl1Rows(#tbl1size #tbl1c0..#tbl1c6) #tbl2Rows(#tbl2size #tbl2sur)
   #accSection(#accRepeater: #accName #accLabel) #featureSection(#featureRepeater: #featureTitle #featureDesc)
   #portfolioSection(#portfolioGallery) #volumeSmall #volumeCorporate #volumeBulkCta
   #stepsSection(#stepsRepeater: #stepNum #stepTitle #stepDesc) #faqSection(#faqRepeater: #faqQ #faqA)
   #accProdTimeBox(#accProdTime) #accTermsBox(#accTerms) #accFilePrepBox(#accFilePrep) #accPackingBox(#accPacking)
   #ctaLineBtn #ctaPhoneBtn #ctaPoints #stickyLineBtn #stickyTelBtn`
6. **เปิด Dev Mode (Velo)** แล้ววางโค้ด:
   - `Public → k2-pricing.js` ← เนื้อหาจาก `wix/velo/public/k2-pricing.js`
   - Page code ของหน้า dynamic ← เนื้อหาจาก `wix/velo/pages/services-item.page.js`
7. **Preview** แล้วรันเทสต์กับ Preview URL (แก้ selector ใน `wp-staging/tests/test-pricing-112-staging.js` ให้ชี้ element ของ Wix หากโครง DOM ต่าง) — ต้องผ่าน **112/112**

## สิ่งที่เจ้าของเว็บต้องตั้งใน Wix Dashboard (ข้อกำหนดข้อ 10)

1. **ห้ามต่อ domain k2sign.com / ห้ามชี้ DNS** — ใช้ URL ฟรี `*.wixsite.com` หรือ Preview เท่านั้นจนกว่าผ่าน QA (ข้อ 2, 7, 11)
2. **SEO**: Dashboard → SEO → ปิดการ index ทั้งไซต์ (ไซต์ยังไม่ publish จึงยัง noindex อยู่แล้ว — คงไว้จนกว่าอนุมัติ)
3. **ภาพจริง** (ข้อ 6): อัปโหลดภาพจากคลัง Drive ที่ผ่านการคัด (webp ≤200KB, Hero ≤300KB, alt ภาษาไทย) เข้า Media Manager แล้วผูกใน CMS: ช่อง `heroImage` + `portfolioGallery` ของ item acrylic-keychain — **ยังไม่ผูกภาพจนกว่าอลันยืนยัน** (ตอนนี้ hero แสดง placeholder ของ layout, portfolio ซ่อนอัตโนมัติเพราะ gallery ว่าง)
4. **LINE @k2sign** (ข้อ 5): ค่าอยู่ใน CMS `ctaLine` แล้ว — ปุ่มทุกจุดผูกผ่าน page code
5. **สมาชิกทีม**: Dashboard → Roles & Permissions → เชิญ designer/dev เป็น Website Designer (แก้ Studio ได้แต่ไม่ publish ถ้าตั้ง role จำกัด)
6. **การ Publish** (ข้อ 7/11): ห้าม publish จนกว่า S6 (อลัน Design QA) + S7 (ท่านประธานอนุมัติ) — การ publish ไซต์นี้ไม่กระทบ Siamsign/Siamdecor (คนละไซต์) แต่ก็ต้องรออนุมัติเช่นกัน

## QA ก่อนส่งมอบ (ข้อ 4, 9)

- [ ] เทสต์ 112/112 บน Preview URL จริงของ Wix (สองชั้น: K2_CALC ใน Velo + UI render)
- [ ] Screenshot 1440 / 768 / 390 จากหน้า Wix จริง เทียบกับ `wix/screenshots/wix-bundle-*.png` (อ้างอิงที่ผ่าน QA แล้ว)
- [ ] Desktop = ตารางเต็ม · Tablet/Mobile = Selector (ข้อ 2–3)
- [ ] ราคา/สี/ฟอนต์/ลำดับ section ตรง Handoff ทุกจุด (ข้อ 1, 12)
