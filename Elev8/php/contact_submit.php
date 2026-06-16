<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/contact_submit.php
// Body (JSON): { name, email, phone, message }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body    = readJSONBody();
$name    = field($body, 'name');
$email   = strtolower(field($body, 'email'));
$phone   = field($body, 'phone');
$message = field($body, 'message');

$errors = [];

if ($name === '') {
    $errors['ct-name'] = 'Name is required.';
} elseif (mb_strlen($name) > 120) {
    $errors['ct-name'] = 'Name is too long.';
}

if ($email === '') {
    $errors['ct-email'] = 'Email is required.';
} elseif (!isValidEmail($email)) {
    $errors['ct-email'] = 'Enter a valid email address.';
}

if ($phone !== '' && !isValidMobile($phone)) {
    $errors['ct-phone'] = 'Enter a valid 10-digit Indian mobile number.';
}

if ($message === '') {
    $errors['ct-message'] = 'Message is required.';
} elseif (mb_strlen($message) < 10) {
    $errors['ct-message'] = 'Message must be at least 10 characters.';
} elseif (mb_strlen($message) > 3000) {
    $errors['ct-message'] = 'Message must be under 3000 characters.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

$db = getDB();
$db->prepare(
    "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)"
)->execute([sanitize($name), $email, $phone !== '' ? cleanMobile($phone) : null, sanitize($message)]);

jsonSuccess("Thanks, " . sanitize($name) . "! We'll get back to you within 24 hours.");
