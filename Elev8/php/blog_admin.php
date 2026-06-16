<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/razorpay.php';
require_once __DIR__ . '/../php/helpers.php';

// Blog admin endpoint — requires X-Admin-Key header matching BLOG_ADMIN_KEY.
//
// GET  /php/blog_admin.php                → list all posts (any status)
// POST /php/blog_admin.php {action:'create', ...}  → create post
// POST /php/blog_admin.php {action:'delete', id}   → delete post

setCORSHeaders();

$adminKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
if (!hash_equals(BLOG_ADMIN_KEY, $adminKey)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Invalid admin key.']);
    exit;
}

require_once __DIR__ . '/../php/helpers.php';

$db = getDB();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $stmt = $db->query(
        "SELECT id, title, slug, category, author, status, published_at
         FROM blog_posts ORDER BY published_at DESC LIMIT 100"
    );
    jsonSuccess('OK', ['posts' => $stmt->fetchAll()]);
}

requireMethod('POST');

$body   = readJSONBody();
$action = field($body, 'action');

// ── Create ────────────────────────────────────────────────────────────────────
if ($action === 'create') {
    $title    = field($body, 'title');
    $category = field($body, 'category');
    $excerpt  = field($body, 'excerpt');
    $content  = trim($body['content'] ?? '');
    $author   = field($body, 'author') ?: 'ELEV8 Team';
    $status   = in_array($body['status'] ?? '', ['published', 'draft'], true)
                ? $body['status']
                : 'published';

    if (!$title || !$excerpt || !$content) {
        jsonError(400, 'Title, excerpt and content are required.');
    }

    // Auto-generate slug from title
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $title), '-'));
    $slug = preg_replace('/-+/', '-', $slug);

    // Ensure uniqueness
    $base = $slug;
    $n    = 2;
    while (true) {
        $chk = $db->prepare("SELECT id FROM blog_posts WHERE slug = ? LIMIT 1");
        $chk->execute([$slug]);
        if (!$chk->fetch()) break;
        $slug = $base . '-' . $n++;
    }

    $db->prepare(
        "INSERT INTO blog_posts (title, slug, category, excerpt, content, author, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )->execute([$title, $slug, $category ?: 'General', $excerpt, $content, $author, $status]);

    jsonSuccess('Post created.', ['slug' => $slug, 'id' => (int)$db->lastInsertId()]);
}

// ── Delete ────────────────────────────────────────────────────────────────────
if ($action === 'delete') {
    $id = isset($body['id']) ? (int)$body['id'] : 0;
    if ($id <= 0) jsonError(400, 'Invalid post ID.');
    $db->prepare("DELETE FROM blog_posts WHERE id = ?")->execute([$id]);
    jsonSuccess('Post deleted.');
}

// ── Toggle status ─────────────────────────────────────────────────────────────
if ($action === 'toggle_status') {
    $id = isset($body['id']) ? (int)$body['id'] : 0;
    if ($id <= 0) jsonError(400, 'Invalid post ID.');
    $db->prepare(
        "UPDATE blog_posts
         SET status = IF(status='published','draft','published')
         WHERE id = ?"
    )->execute([$id]);
    jsonSuccess('Status toggled.');
}

jsonError(400, 'Unknown action.');
