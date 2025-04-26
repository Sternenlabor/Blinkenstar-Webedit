<?php
header('Content-Type: application/json');
// Allow calls from your dev server
header("Access-Control-Allow-Origin: http://localhost:8080");
// Allow cookies/auth if you need them
header("Access-Control-Allow-Credentials: true");
// Always respond to OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit;
}
session_start();

$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        "",
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}
session_destroy();

echo json_encode(['message' => 'Logged out successfully']);
