<?php
require_once __DIR__ . '/includes/common.php';
Auth::checkAdmin();

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['animationId']) || !isset($input['reviewed'])) {
    ApiResponse::error('animationId and reviewed status are required');
}

$stmt = $pdo->prepare("UPDATE animations SET reviewed_at = ? WHERE id = ?")
    ->execute([$input['reviewed'] ? date('Y-m-d H:i:s') : null, $input['animationId']]);

$stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ?");
$stmt->execute([$animationId]);
$updatedAnim = $stmt->fetch();

ApiResponse::send($updatedAnim);
