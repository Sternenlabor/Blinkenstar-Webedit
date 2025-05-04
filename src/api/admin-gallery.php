<?php
require_once __DIR__ . '/includes/common.php';
Auth::checkAdmin();

$gallery = $pdo->query("
    SELECT A.*, U.email AS author_email 
    FROM animations A 
    JOIN users U ON A.user_id = U.id 
    ORDER BY A.creation_date DESC
")->fetchAll();

ApiResponse::send($gallery);
