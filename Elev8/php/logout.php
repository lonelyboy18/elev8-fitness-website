<?php
declare(strict_types=1);

require_once __DIR__ . '/../php/helpers.php';

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

// Destroy the session completely
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}
session_destroy();

jsonSuccess('Signed out successfully.', ['redirect' => '../html/index.html']);
