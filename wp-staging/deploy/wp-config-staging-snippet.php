<?php
/**
 * S1.4 — เพิ่มบรรทัดนี้ใน wp-config.php ของ staging.k2sign.com
 * วาง "เหนือ" บรรทัด  /* That's all, stop editing! ...
 * (ธีม k2sign จะยิง <meta name="robots" content="noindex, nofollow"> อัตโนมัติ
 *  เมื่อ WP_ENVIRONMENT_TYPE ไม่ใช่ production)
 */
define('WP_ENVIRONMENT_TYPE', 'staging');
