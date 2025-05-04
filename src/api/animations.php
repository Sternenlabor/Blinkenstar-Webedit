<?php
require_once __DIR__ . '/includes/common.php';
Auth::checkLoggedIn();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['animations']) || !is_array($input['animations'])) {
                ApiResponse::error('"animations" array is required');
            }

            $pdo->beginTransaction();

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
                    throw new Exception('Animation "id" is required');
                }

                $framesDataJson = json_encode($anim['columns'] ?? []);
                $stmt->execute([
                    ':id'            => $anim['id'],
                    ':user_id'       => $_SESSION['user_id'],
                    ':name'          => $anim['name']              ?? '',
                    ':text'          => $anim['text']              ?? '',
                    ':frames_data'   => $framesDataJson,
                    ':speed'         => $anim['speed']             ?? 0,
                    ':delay'         => $anim['delay']             ?? 0,
                    ':repeat'        => $anim['repeat']            ?? 0,
                    ':direction'     => $anim['direction']         ?? 0,
                    ':type'          => $anim['type']              ?? '',
                    ':creation_date' => date('Y-m-d H:i:s', $anim['creationDate'] ?? time())
                ]);
            }

            $pdo->commit();
            ApiResponse::send(['success' => true]);
            break;

        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM animations WHERE user_id = ? ORDER BY modified_at DESC");
            $stmt->execute([$_SESSION['user_id']]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert frames_data JSON back into `columns` array
            $animations = array_map(function ($row) {
                $row['columns'] = json_decode($row['frames_data'], true);
                unset($row['frames_data']);
                return $row;
            }, $rows);

            ApiResponse::send($animations);
            break;

        case 'DELETE':
            $id = json_decode(file_get_contents('php://input'), true)['id'] ?? null;

            if (!$id) {
                ApiResponse::error('Missing animation ID');
            }

            $pdo->prepare("DELETE FROM animations WHERE id = ? AND user_id = ?")
                ->execute([$id, $_SESSION['user_id']]);
            ApiResponse::send(['success' => true]);
            break;

        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    ApiResponse::error($e->getMessage(), 400);
}
