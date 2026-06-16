<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// GET /php/session_status.php
// Returns current session user or 401.  No CSRF needed (read-only GET).

setCORSHeaders();
startSecureSession();
requireMethod('GET');

if (!isLoggedIn()) {
    jsonError(401, 'Not authenticated.');
}

$db   = getDB();
$stmt = $db->prepare(
    "SELECT id, name, email, mobile, plan,
            subscription_status, subscription_expires, created_at
     FROM users WHERE id = ? LIMIT 1"
);
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    $_SESSION = [];
    session_destroy();
    jsonError(401, 'Session invalid. Please sign in again.');
}

jsonSuccess('Authenticated.', ['user' => [
    'id'                   => (int)$user['id'],
    'name'                 => sanitize($user['name']),
    'email'                => $user['email'],
    'mobile'               => $user['mobile'],
    'plan'                 => $user['plan'],
    'subscription_status'  => $user['subscription_status'],
    'subscription_expires' => $user['subscription_expires'],
    'member_since'         => date('M Y', strtotime($user['created_at'])),
]]);
