<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/update_profile.php
// Body (JSON): { name, mobile }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();
requireLogin();

$body   = readJSONBody();
$name   = field($body, 'name');
$mobile = field($body, 'mobile');
$userId = (int)$_SESSION['user_id'];

$errors = [];

if ($name === '') {
    $errors['pf-name'] = 'Name is required.';
} elseif (mb_strlen($name) > 120) {
    $errors['pf-name'] = 'Name must be 120 characters or fewer.';
}

if ($mobile !== '' && !isValidMobile($mobile)) {
    $errors['pf-mobile'] = 'Enter a valid 10-digit Indian mobile number.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

$db = getDB();
$db->prepare("UPDATE users SET name = ?, mobile = ? WHERE id = ?")
   ->execute([sanitize($name), $mobile !== '' ? cleanMobile($mobile) : $mobile, $userId]);

$_SESSION['user_name'] = sanitize($name);

jsonSuccess('Profile updated successfully.', ['name' => sanitize($name)]);
