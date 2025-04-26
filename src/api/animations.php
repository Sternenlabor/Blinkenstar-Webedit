<?php
// 1) CORS for your exact front-end origin
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === 'http://localhost:8080') {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
}
// Handle preflight just in case
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}
header('Content-Type: application/json');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 2) Session-based auth
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

require_once 'db.php';

// 5) POST → bulk upsert
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['animations']) || !is_array($input['animations'])) {
        http_response_code(400);
        echo json_encode(['error' => '"animations" array is required']);
        exit;
    }

    // Prepare an upsert statement
    $stmt = $pdo->prepare("
        INSERT INTO animations
            (id, user_id, `name`, `text`, frames_data, speed, delay, `repeat`, direction, `type`, creation_date, modified_at)
        VALUES
            (:id, :user_id, :name, :text, :frames_data, :speed, :delay, :repeat, :direction, :type, :creation_date, NOW())
        ON DUPLICATE KEY UPDATE
            `name`        = VALUES(`name`),
            `text`        = VALUES(`text`),
            frames_data   = VALUES(frames_data),
            speed         = VALUES(speed),
            delay         = VALUES(delay),
            `repeat`      = VALUES(`repeat`),
            direction     = VALUES(direction),
            `type`        = VALUES(`type`),
            modified_at   = NOW()
        ");

    foreach ($input['animations'] as $anim) {
        if (!isset($anim['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Animation "id" is required']);
            exit;
        }

        // Convert client’s `columns` array into JSON for storage
        $framesDataJson = json_encode($anim['columns'] ?? []);

        $stmt->execute([
            ':id'            => $anim['id'],
            ':user_id'       => $userId,
            ':name'          => $anim['name']              ?? '',
            ':text'          => $anim['text']              ?? '',
            ':frames_data'   => $framesDataJson,
            ':speed'         => $anim['speed']             ?? 0,
            ':delay'         => $anim['delay']             ?? 0,
            ':repeat'        => $anim['repeat']            ?? 0,
            ':direction'     => $anim['direction']         ?? 0,
            ':type'          => $anim['type']              ?? '',
            ':creation_date' => date(
                'Y-m-d H:i:s',
                isset($anim['creationDate'])
                    ? $anim['creationDate']
                    : time()
            ),
        ]);
    }

    echo json_encode(['success' => true]);
    exit;
}

// 6) GET → fetch all
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM animations WHERE user_id = ? ORDER BY creation_date");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert frames_data JSON back into `columns` array
    $animations = array_map(function ($row) {
        $row['columns'] = json_decode($row['frames_data'], true);
        unset($row['frames_data']);
        return $row;
    }, $rows);

    echo json_encode($animations);
    exit;
}

// 7) DELETE → remove one
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $body = json_decode($raw, true);
    $id   = $body['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing "id" for deletion']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM animations WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(['success' => true]);
    exit;
}

// 8) Other methods → not allowed
http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
exit;
