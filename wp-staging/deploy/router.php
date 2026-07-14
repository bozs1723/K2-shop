<?php
/**
 * router.php — Basic Auth (S1.3) + pretty permalink routing สำหรับ PHP built-in server
 * เทียบเท่า .htaccess + .htpasswd บน Z.com (ดู deploy/htaccess-basic-auth.example)
 */
const K2_AUTH_USER = 'k2staging';
const K2_AUTH_PASS = 'K2preview2026';

if (!isset($_SERVER['PHP_AUTH_USER'])
    || !hash_equals(K2_AUTH_USER, $_SERVER['PHP_AUTH_USER'])
    || !hash_equals(K2_AUTH_PASS, $_SERVER['PHP_AUTH_PW'] ?? '')) {
    header('WWW-Authenticate: Basic realm="K2SIGN Staging"');
    header('HTTP/1.1 401 Unauthorized');
    exit('K2SIGN Staging — ต้องใส่รหัสผ่าน (Basic Auth)');
}

$root = __DIR__ . '/wordpress';
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// ไฟล์ static มีจริง → ให้ built-in server เสิร์ฟเอง
if ($path !== '/' && file_exists($root . $path) && !is_dir($root . $path)) {
    return false;
}
// โฟลเดอร์ที่มี index.php (เช่น /wp-admin/) → เรียก index.php ของโฟลเดอร์นั้น
if (is_dir($root . $path) && file_exists($root . rtrim($path, '/') . '/index.php')) {
    $script = rtrim($path, '/') . '/index.php';
} else {
    $script = '/index.php'; // pretty permalink → WP front controller
}
$_SERVER['SCRIPT_FILENAME'] = $root . $script;
$_SERVER['SCRIPT_NAME'] = $script;
$_SERVER['PHP_SELF'] = $script;
chdir(dirname($root . $script));
require $root . $script;
