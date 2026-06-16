<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/delete_account.php
// Body (JSON): { email, password, confirm }
// Returns JSON: { success, message, redirect? }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body = readJSONBody();

$email    = strtolower(field($body, 'email'));
$password = field($body, 'password');
$confirm  = (bool)($body['confirm'] ?? false);

// ── Validate inputs ───────────────────────────────────────────────────────────

$errors = [];

if ($email === '') {
    $errors['email'] = 'Email address is required.';
} elseif (!isValidEmail($email)) {
    $errors['email'] = 'Enter a valid email address.';
}

if ($password === '') {
    $errors['password'] = 'Password is required.';
}

if (!$confirm) {
    $errors['confirm'] = 'Please tick the confirmation checkbox.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

// ── Verify credentials ────────────────────────────────────────────────────────

$db   = getDB();
$stmt = $db->prepare("SELECT id, password FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

$hashToCheck = $user ? $user['password'] : password_hash('dummy', PASSWORD_DEFAULT);
$valid       = $user && password_verify($password, $hashToCheck);

if (!$valid) {
    jsonError(401, 'Incorrect email or password.');
}

// ── Delete account ────────────────────────────────────────────────────────────

$db->prepare("DELETE FROM users WHERE id = :id")
   ->execute([':id' => $user['id']]);

// End any active session for this user
if (isLoggedIn() && $_SESSION['user_id'] === (int)$user['id']) {
    $_SESSION = [];
    session_destroy();
}

jsonSuccess('Your account has been permanently deleted. We\'re sorry to see you go.', [
    'redirect' => '../html/index.html',
]);
