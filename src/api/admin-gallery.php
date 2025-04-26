<?php
// 1) CORS for your exact front-end origin
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === 'http://localhost:8080') {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
}
// Handle preflight just in case
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}
header('Content-Type: application/json');

// 2) Make the session cookie cross-site–safe
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,    // switch to true if you move to HTTPS
    'httponly' => true,
    'samesite' => 'None'
]);

// 3) Resume the session
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['is_admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin privileges required']);
    exit;
}

$sql = "SELECT A.*, U.email AS author_email 
        FROM animations A 
        JOIN users U ON A.user_id = U.id 
        ORDER BY A.creation_date DESC";
$stmt = $pdo->query($sql);
$adminGallery = $stmt->fetchAll();
echo json_encode($adminGallery);
exit;
