<?php
require_once __DIR__ . '/includes/common.php';
Auth::checkLoggedIn();

$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT id, email, is_admin FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    ApiResponse::error('User not found', 404);
}

ApiResponse::send([
    'uid' => $user['id'],
    'email' => $user['email'],
    'admin' => (bool)$user['is_admin']
]);
