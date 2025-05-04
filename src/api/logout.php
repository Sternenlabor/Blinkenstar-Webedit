<?php
require_once __DIR__ . '/includes/common.php';

Auth::logout();
ApiResponse::send(['message' => 'Logged out successfully']);
