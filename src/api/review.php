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

if (!isset($_SESSION['user_id']) || $_SESSION['is_admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin privileges required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['animationId']) || !isset($input['reviewed'])) {
    http_response_code(400);
    echo json_encode(['error' => 'animationId and reviewed status are required']);
    exit;
}

$animationId = $input['animationId'];
$reviewed = $input['reviewed']; // Expecting true or false

if ($reviewed) {
    // Mark as reviewed.
    $stmt = $pdo->prepare("UPDATE animations SET reviewed_at = NOW() WHERE id = ?");
    $stmt->execute([$animationId]);
} else {
    // Mark as unreviewed.
    $stmt = $pdo->prepare("UPDATE animations SET reviewed_at = NULL WHERE id = ?");
    $stmt->execute([$animationId]);
}

// Return updated animation.
$stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ?");
$stmt->execute([$animationId]);
$updatedAnim = $stmt->fetch();
echo json_encode($updatedAnim);
exit;
