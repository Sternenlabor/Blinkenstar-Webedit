<?php
require_once __DIR__ . '/includes/common.php';
Auth::checkLoggedIn();

$method = $_SERVER['REQUEST_METHOD'];
$animationId = $_GET['id'] ?? null;

if (!$animationId) {
    ApiResponse::error('Animation ID is required');
}

try {
    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $allowedFields = ['name', 'text', 'frames_data', 'speed', 'delay', 'repeat', 'direction'];
        $updates = [];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            ApiResponse::error('No valid fields to update');
        }

        $params[] = $animationId;
        $params[] = $_SESSION['user_id'];
        
        $pdo->prepare("UPDATE animations SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?")
            ->execute($params);
        
        $stmt->execute($params);
        $stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ? AND user_id = ?");
        $stmt->execute([$animationId, $userId]);
        $updatedAnimation = $stmt->fetch();
        
        ApiResponse::send($updatedAnimation);

    } elseif ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM animations WHERE id = ? AND user_id = ?")
            ->execute([$animationId, $_SESSION['user_id']]);
        
        ApiResponse::send(['message' => 'Animation deleted successfully']);
        
    } else {
        ApiResponse::error('Method not allowed', 405);
    }
} catch (PDOException $e) {
    ApiResponse::error('Database error: ' . $e->getMessage(), 500);
}
