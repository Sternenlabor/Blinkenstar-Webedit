<?php
// 1) CORS for your specific front-end origin
$allowed = ['http://localhost:8080']; // add additional origins if needed
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
}
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit(0);
}

header('Content-Type: application/json');

// 2) Configure the session cookie for cross-site use
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',      // available in entire domain
    'domain'   => '',       // default to current domain
    'secure'   => false,    // set to true if using HTTPS
    'httponly' => true,     // inaccessible to JavaScript
    'samesite' => 'None'    // allow cross-site cookie
]);
session_start();

require_once 'db.php';

// 3) Check if the user is logged in
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

// 4) Fetch the logged-in user's data
$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT id, email, is_admin FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// 5) Return the user info as JSON
echo json_encode([
    'uid'   => $user['id'],
    'email' => $user['email'],
    'admin' => (bool)$user['is_admin']
]);
