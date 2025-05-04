<?php
require_once __DIR__ . '/includes/common.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM public_gallery ORDER BY published_at DESC");
            ApiResponse::send($stmt->fetchAll());
            break;

        case 'POST':
            Auth::checkAdmin();
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['animationId'])) {
                ApiResponse::error('Animation ID is required');
            }

            $stmt = $pdo->prepare("SELECT * FROM animations WHERE id = ?");
            $stmt->execute([$animationId]);
            $animation = $stmt->fetch();

            if (!$animation) {
                ApiResponse::error('Animation not found', 404);
            }

            $publicId = uniqid("pub_");
            $sql = "INSERT INTO public_gallery 
            (id, original_id, author_id, name, type, text, frames_data, speed, delay, repeat, direction, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
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

            ApiResponse::send([
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
            ], 201);
            break;

        case 'DELETE':
            Auth::checkAdmin();
            $publicId = $_GET['id'] ?? null;

            if (!$publicId) {
                ApiResponse::error('Public gallery ID is required');
            }

            $pdo->prepare("DELETE FROM public_gallery WHERE id = ?")
                ->execute([$publicId]);

            ApiResponse::send(['message' => 'Animation unpublished successfully']);
            break;

        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (PDOException $e) {
    ApiResponse::error('Database error: ' . $e->getMessage(), 500);
}
