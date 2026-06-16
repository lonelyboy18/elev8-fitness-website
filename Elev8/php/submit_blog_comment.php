<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/submit_blog_comment.php
// Body (JSON): { post_id, name, email, comment }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();

$body    = readJSONBody();
$postId  = isset($body['post_id']) ? (int)$body['post_id'] : 0;
$name    = field($body, 'name');
$email   = field($body, 'email');
$comment = field($body, 'comment');

$errors = [];

if ($postId <= 0) {
    jsonError(400, 'Invalid post.');
}

if ($name === '') {
    $errors['bc-name'] = 'Name is required.';
} elseif (mb_strlen($name) > 120) {
    $errors['bc-name'] = 'Name is too long.';
}

if ($email === '') {
    $errors['bc-email'] = 'Email is required.';
} elseif (!isValidEmail($email)) {
    $errors['bc-email'] = 'Enter a valid email address.';
}

if ($comment === '') {
    $errors['bc-comment'] = 'Comment cannot be empty.';
} elseif (mb_strlen($comment) < 5) {
    $errors['bc-comment'] = 'Comment is too short.';
} elseif (mb_strlen($comment) > 2000) {
    $errors['bc-comment'] = 'Comment must be under 2000 characters.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

$db   = getDB();
$stmt = $db->prepare("SELECT id FROM blog_posts WHERE id = ? AND status = 'published' LIMIT 1");
$stmt->execute([$postId]);
if (!$stmt->fetch()) {
    jsonError(404, 'Post not found.');
}

$db->prepare(
    "INSERT INTO blog_comments (post_id, name, email, comment) VALUES (?, ?, ?, ?)"
)->execute([$postId, sanitize($name), $email, sanitize($comment)]);

jsonSuccess('Comment posted! Thanks for joining the conversation.');
