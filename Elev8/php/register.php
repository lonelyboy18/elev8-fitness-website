<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/register.php
// Body (JSON): { name, email, mobile, password, plan }
// Returns JSON: { success, message } or { success: false, errors: { field: msg } }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body = readJSONBody();

$name     = field($body, 'name');
$email    = strtolower(field($body, 'email'));
$mobile   = field($body, 'mobile');
$password = field($body, 'password');
$plan     = field($body, 'plan');

// ── Validate ──────────────────────────────────────────────────────────────────

$errors = [];

if ($name === '') {
    $errors['name'] = 'Full name is required.';
} elseif (mb_strlen($name) > 120) {
    $errors['name'] = 'Name must be 120 characters or fewer.';
}

if ($email === '') {
    $errors['email'] = 'Email address is required.';
} elseif (!isValidEmail($email)) {
    $errors['email'] = 'Enter a valid email address.';
}

if ($mobile === '') {
    $errors['mobile'] = 'Mobile number is required.';
} elseif (!isValidMobile($mobile)) {
    $errors['mobile'] = 'Enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
}

if ($password === '') {
    $errors['password'] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters.';
} elseif (strlen($password) > 255) {
    $errors['password'] = 'Password is too long.';
}

if (!in_array($plan, ALLOWED_PLANS, true)) {
    $errors['plan'] = 'Please select a program (BFT or CST).';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

// ── Insert ────────────────────────────────────────────────────────────────────

$db = getDB();

try {
    $stmt = $db->prepare(
        "INSERT INTO users (name, email, mobile, password, plan)
         VALUES (:name, :email, :mobile, :password, :plan)"
    );
    $stmt->execute([
        ':name'     => sanitize($name),
        ':email'    => $email,
        ':mobile'   => cleanMobile($mobile),
        ':password' => password_hash($password, PASSWORD_DEFAULT),
        ':plan'     => $plan,
    ]);
} catch (PDOException $e) {
    // SQLSTATE 23000 = integrity constraint (duplicate email)
    if ($e->getCode() === '23000') {
        jsonValidationError(['email' => 'An account with this email already exists.']);
    }
    jsonError(500, 'Registration failed. Please try again.');
}

// ── Auto-login after registration ─────────────────────────────────────────────

session_regenerate_id(true);
$_SESSION['user_id']   = (int) $db->lastInsertId();
$_SESSION['user_name'] = sanitize($name);
$_SESSION['user_plan'] = $plan;

jsonSuccess('Welcome to ELEV8! Your account has been created.', [
    'user'     => ['name' => sanitize($name), 'plan' => $plan],
    'redirect' => '../html/dashboard.html',
]);
