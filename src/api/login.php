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
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

// normalize and trim immediately
$email    = isset($input['email'])    ? trim($input['email'])    : '';
$password = isset($input['password']) ? $input['password']        : '';

// now reject if either is empty
if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash, is_admin FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['is_admin'] = $user['is_admin'] ? 1 : 0;

    echo json_encode([
        'id'    => $user['id'],
        'email' => $email,
        'admin' => (bool)$user['is_admin']
    ]);
    exit;
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}
