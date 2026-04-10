<?php
$localConfigPath = __DIR__ . '/config.local.php';

if (file_exists($localConfigPath)) {
    require_once $localConfigPath;
}

function config_value($name, $default) {
    $value = getenv($name);

    if ($value !== false) {
        return $value;
    }

    if (array_key_exists($name, $_SERVER)) {
        return $_SERVER[$name];
    }

    if (array_key_exists($name, $_ENV)) {
        return $_ENV[$name];
    }

    return $default;
}

// Database configuration
if (!defined('DB_HOST')) define('DB_HOST', config_value('BLINKENSTAR_DB_HOST', 'localhost'));
if (!defined('DB_NAME')) define('DB_NAME', config_value('BLINKENSTAR_DB_NAME', 'blinkenstar'));
if (!defined('DB_USER')) define('DB_USER', config_value('BLINKENSTAR_DB_USER', 'root'));
if (!defined('DB_PASS')) define('DB_PASS', config_value('BLINKENSTAR_DB_PASS', ''));
if (!defined('DB_CHARSET')) define('DB_CHARSET', config_value('BLINKENSTAR_DB_CHARSET', 'utf8mb4'));

// Application constants
if (!defined('ALLOWED_ORIGIN')) define('ALLOWED_ORIGIN', config_value('BLINKENSTAR_ALLOWED_ORIGIN', 'http://localhost:8080'));

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
