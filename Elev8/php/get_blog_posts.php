<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// GET /php/get_blog_posts.php
//   ?slug=post-slug          → single post + approved comments
//   ?search=term             → search title/excerpt
//   ?category=Training+Tips  → filter by category
//   ?page=1                  → pagination (12 per page)
// No auth required — public endpoint.

setCORSHeaders();
startSecureSession();
requireMethod('GET');

$db = getDB();

// ── Single post ───────────────────────────────────────────
if (!empty($_GET['slug'])) {
    $slug = trim($_GET['slug']);

    $stmt = $db->prepare(
        "SELECT id, title, slug, category, excerpt, content, author, published_at
         FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1"
    );
    $stmt->execute([$slug]);
    $post = $stmt->fetch();

    if (!$post) {
        jsonError(404, 'Post not found.');
    }

    $commentStmt = $db->prepare(
        "SELECT name, comment, created_at FROM blog_comments
         WHERE post_id = ? AND status = 'approved'
         ORDER BY created_at ASC LIMIT 50"
    );
    $commentStmt->execute([(int)$post['id']]);

    jsonSuccess('OK', [
        'post'     => $post,
        'comments' => $commentStmt->fetchAll(),
    ]);
}

// ── Post list ─────────────────────────────────────────────
$page     = max(1, (int)($_GET['page']     ?? 1));
$search   = trim($_GET['search']   ?? '');
$category = trim($_GET['category'] ?? '');
$limit    = 9;
$offset   = ($page - 1) * $limit;

$where  = ["status = 'published'"];
$params = [];

if ($search !== '') {
    $where[]  = '(title LIKE ? OR excerpt LIKE ?)';
    $params[] = '%' . $search . '%';
    $params[] = '%' . $search . '%';
}

if ($category !== '') {
    $where[]  = 'category = ?';
    $params[] = $category;
}

$whereSQL = 'WHERE ' . implode(' AND ', $where);

$countStmt = $db->prepare("SELECT COUNT(*) FROM blog_posts $whereSQL");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

$listStmt = $db->prepare(
    "SELECT id, title, slug, category, excerpt, author, published_at
     FROM blog_posts $whereSQL
     ORDER BY published_at DESC
     LIMIT $limit OFFSET $offset"
);
$listStmt->execute($params);
$posts = $listStmt->fetchAll();

// Category list for filter UI
$catStmt = $db->query(
    "SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category"
);
$categories = $catStmt->fetchAll(\PDO::FETCH_COLUMN);

jsonSuccess('OK', [
    'posts'      => $posts,
    'total'      => $total,
    'page'       => $page,
    'pages'      => (int)ceil($total / $limit),
    'categories' => $categories,
]);
