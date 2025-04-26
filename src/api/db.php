<?php

// Database configuration — update these values with your settings.
$host    = 'localhost';
$db      = 'blinkenstar';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

// Set up DSN and PDO options.
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on errors.
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays.
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Use native prepared statements.
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
