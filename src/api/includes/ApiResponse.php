<?php
class ApiResponse
{
    public static function send($data, $status = 200)
    {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    public static function error($message, $status = 400)
    {
        self::send(['error' => $message], $status);
    }
}
