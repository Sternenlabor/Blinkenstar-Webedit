<?php
class Auth
{
    public static function checkLoggedIn()
    {
        if (!isset($_SESSION['user_id'])) {
            ApiResponse::error('Unauthorized', 401);
        }
    }

    public static function checkAdmin()
    {
        self::checkLoggedIn();
        if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
            ApiResponse::error('Admin privileges required', 403);
        }
    }

    public static function logout()
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        session_destroy();
    }
}
