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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php';

$userId = $_SESSION['user_id'];
$animationId = isset($_GET['id']) ? $_GET['id'] : null;
if (!$animationId) {
    http_response_code(400);
    echo json_encode(['error' => 'Animation ID is required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'PUT') {
    // Update the animation.
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    $fields = [];
    $params = [];
    if (isset($input['name'])) {
        $fields[] = "name = ?";
        $params[] = $input['name'];
    }
    if (isset($input['text'])) {
        $fields[] = "text = ?";
        $params[] = $input['text'];
    }
    if (isset($input['frames_data'])) {
        $fields[] = "frames_data = ?";
        $params[] = $input['frames_data'];
    }
    if (isset($input['speed'])) {
        $fields[] = "speed = ?";
        $params[] = $input['speed'];
    }
    if (isset($input['delay'])) {
        $fields[] = "delay = ?";
        $params[] = $input['delay'];
    }
    if (isset($input['repeat'])) {
        $fields[] = "repeat = ?";
        $params[] = $input['repeat'];
    }
    if (isset($input['direction'])) {
        $fields[] = "direction = ?";
        $params[] = $input['direction'];
    }
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit;
    }
    // Always update the modified_at timestamp.
    $fields[] = "modified_at = NOW()";

    $sql = "UPDATE animations SET " . implode(", ", $fields) . " WHERE id = ? AND user_id = ?";
    $params[] = $animationId;
    $params[] = $userId;

    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute($params);
        $stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ? AND user_id = ?");
        $stmt->execute([$animationId, $userId]);
        $updatedAnimation = $stmt->fetch();
        echo json_encode($updatedAnimation);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update animation: ' . $e->getMessage()]);
    }
    exit;
} elseif ($method == 'DELETE') {
    // Delete the animation.
    $stmt = $pdo->prepare("DELETE FROM animations WHERE id = ? AND user_id = ?");
    try {
        $stmt->execute([$animationId, $userId]);
        echo json_encode(['message' => 'Animation deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete animation: ' . $e->getMessage()]);
    }
    exit;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}
