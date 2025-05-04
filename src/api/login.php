<?php
require_once __DIR__ . '/includes/common.php';

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['email']) || empty($input['password'])) {
    ApiResponse::error('Email and password required');
}

// Authentication logic
$stmt = $pdo->prepare("SELECT id, password_hash, is_admin FROM users WHERE email = ?");
$stmt->execute([trim($input['email'])]);
$user = $stmt->fetch();

if ($user && password_verify($input['password'], $user['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['is_admin'] = $user['is_admin'];

    ApiResponse::send([
        'uid' => $user['id'],
        'email' => $input['email'],
        'admin' => (bool)$user['is_admin']
    ]);
}

ApiResponse::error('Invalid email or password', 401);
