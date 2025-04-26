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
if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$email = $input['email'];
$password = $input['password'];

// Check if the email is already registered.
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already registered']);
    exit;
}

// Hash the password securely.
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

// Insert the new user.
$stmt = $pdo->prepare("INSERT INTO users (email, password_hash, is_admin, created_at) VALUES (?, ?, 0, NOW())");
$stmt->execute([$email, $passwordHash]);
$userId = $pdo->lastInsertId();

// Secure session practices.
session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
$_SESSION['is_admin'] = 0;

echo json_encode([
    'id'    => $userId,
    'email' => $email,
    'admin' => false
]);
