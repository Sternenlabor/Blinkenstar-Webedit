<?php
require_once __DIR__ . '/includes/common.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['email']) || empty($input['password'])) {
    ApiResponse::error('Email and password are required');
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    ApiResponse::error('Email already registered');
}

$stmt = $pdo->prepare("INSERT INTO users (email, password_hash, is_admin, created_at) VALUES (?, ?, 0, NOW())");
$stmt->execute([$email, $passwordHash]);
$userId = $pdo->lastInsertId();

session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
$_SESSION['is_admin'] = 0;

ApiResponse::send([
    'id' => $userId,
    'email' => $input['email'],
    'admin' => false
], 201);
