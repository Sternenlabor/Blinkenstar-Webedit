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

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Public gallery listing (no auth required).
    $stmt = $pdo->query("SELECT * FROM public_gallery ORDER BY published_at DESC");
    $galleryItems = $stmt->fetchAll();
    echo json_encode($galleryItems);
    exit;
} elseif ($method == 'POST') {
    // Publish an animation to the public gallery; admin only.
    if (!isset($_SESSION['user_id']) || $_SESSION['is_admin'] != 1) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin privileges required']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['animationId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Animation ID is required']);
        exit;
    }
    $animationId = $input['animationId'];
    $stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ?");
    $stmt->execute([$animationId]);
    $animation = $stmt->fetch();
    if (!$animation) {
        http_response_code(404);
        echo json_encode(['error' => 'Animation not found']);
        exit;
    }
    // Generate a new public gallery ID.
    $publicId = uniqid("pub_");
    $sql = "INSERT INTO public_gallery 
            (id, original_id, author_id, name, type, text, frames_data, speed, delay, repeat, direction, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([
            $publicId,
            $animation['id'],
            $animation['user_id'],
            $animation['name'],
            $animation['type'],
            $animation['text'],
            $animation['frames_data'],
            $animation['speed'],
            $animation['delay'],
            $animation['repeat'],
            $animation['direction']
        ]);
        echo json_encode([
            'id'            => $publicId,
            'original_id'   => $animation['id'],
            'author_id'     => $animation['user_id'],
            'name'          => $animation['name'],
            'type'          => $animation['type'],
            'text'          => $animation['text'],
            'frames_data'   => $animation['frames_data'],
            'speed'         => $animation['speed'],
            'delay'         => $animation['delay'],
            'repeat'        => $animation['repeat'],
            'direction'     => $animation['direction'],
            'published_at'  => date('Y-m-d H:i:s')
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to publish animation: ' . $e->getMessage()]);
    }
    exit;
} elseif ($method == 'DELETE') {
    // Unpublish an animation; admin only.
    if (!isset($_SESSION['user_id']) || $_SESSION['is_admin'] != 1) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin privileges required']);
        exit;
    }
    $publicId = isset($_GET['id']) ? $_GET['id'] : null;
    if (!$publicId) {
        http_response_code(400);
        echo json_encode(['error' => 'Public gallery ID is required']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM public_gallery WHERE id = ?");
    try {
        $stmt->execute([$publicId]);
        echo json_encode(['message' => 'Animation unpublished successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to unpublish: ' . $e->getMessage()]);
    }
    exit;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}
