<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'blinkenstar');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Application constants
define('ALLOWED_ORIGIN', 'http://localhost:8080');

function is_allowed_origin($origin) {
    if (!is_string($origin) || $origin === '') {
        return false;
    }

    if ($origin === ALLOWED_ORIGIN) {
        return true;
    }

    $parts = parse_url($origin);
    if ($parts === false) {
        return false;
    }

    $scheme = strtolower($parts['scheme'] ?? '');
    $host = strtolower($parts['host'] ?? '');

    if (!in_array($scheme, ['http', 'https'], true)) {
        return false;
    }

    return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
}
