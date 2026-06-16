<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/submit_feedback.php
// Body (JSON): { name, email, rating, feedback }
// Returns JSON: { success, message }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body = readJSONBody();

$name     = field($body, 'name');
$email    = strtolower(field($body, 'email'));
$rating   = fieldInt($body, 'rating');
$feedback = field($body, 'feedback');

// ── Validate ──────────────────────────────────────────────────────────────────

$errors = [];

if ($name === '') {
    $errors['name'] = 'Your name is required.';
} elseif (mb_strlen($name) > 120) {
    $errors['name'] = 'Name must be 120 characters or fewer.';
}

if ($email === '') {
    $errors['email'] = 'Email address is required.';
} elseif (!isValidEmail($email)) {
    $errors['email'] = 'Enter a valid email address.';
}

if ($rating < 1 || $rating > 5) {
    $errors['rating'] = 'Please rate your experience (1–5).';
}

if ($feedback === '') {
    $errors['feedback'] = 'Please write your feedback.';
} elseif (mb_strlen($feedback) < 10) {
    $errors['feedback'] = 'Feedback must be at least 10 characters.';
} elseif (mb_strlen($feedback) > 5000) {
    $errors['feedback'] = 'Feedback must be 5,000 characters or fewer.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

// ── Insert ────────────────────────────────────────────────────────────────────

$db = getDB();

try {
    $stmt = $db->prepare(
        "INSERT INTO submissions (name, email, feedback, rating)
         VALUES (:name, :email, :feedback, :rating)"
    );
    $stmt->execute([
        ':name'     => sanitize($name),
        ':email'    => $email,
        ':feedback' => sanitize($feedback),
        ':rating'   => $rating,
    ]);
} catch (PDOException $e) {
    jsonError(500, 'Could not save your feedback. Please try again.');
}

jsonSuccess('Thank you for your feedback! It means the world to us. 🙏');
