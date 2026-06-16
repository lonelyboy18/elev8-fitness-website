<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/login.php
// Body (JSON): { email, password }
// Returns JSON: { success, message, user?, redirect? }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body = readJSONBody();

$email    = strtolower(field($body, 'email'));
$password = field($body, 'password');

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

if (!empty($errors)) {
    jsonValidationError($errors);
}

// ── Look up user ──────────────────────────────────────────────────────────────

$db   = getDB();
$stmt = $db->prepare(
    "SELECT id, name, password, plan FROM users WHERE email = :email LIMIT 1"
);
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

// Use a constant-time comparison regardless of whether the user exists
// to prevent timing-based user enumeration.
$hashToCheck = $user ? $user['password'] : password_hash('dummy', PASSWORD_DEFAULT);
$valid = $user && password_verify($password, $hashToCheck);

if (!$valid) {
    // Generic message — do not hint whether email or password was wrong
    jsonError(401, 'Incorrect email or password. Please try again.');
}

// ── Rehash if algorithm/cost changed ─────────────────────────────────────────

if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
    $db->prepare("UPDATE users SET password = :p WHERE id = :id")
       ->execute([':p' => password_hash($password, PASSWORD_DEFAULT), ':id' => $user['id']]);
}

// ── Create session ────────────────────────────────────────────────────────────

session_regenerate_id(true);
$_SESSION['user_id']   = (int) $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_plan'] = $user['plan'];

jsonSuccess('Welcome back, ' . sanitize($user['name']) . '!', [
    'user'     => ['name' => sanitize($user['name']), 'plan' => $user['plan']],
    'redirect' => '../html/dashboard.html',
]);
