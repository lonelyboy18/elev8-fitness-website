<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// GET — returns average rating + count from the submissions table.
// Used by the feedback page to show live stats instead of a hardcoded array.

setCORSHeaders();
startSecureSession();
requireMethod('GET');

$db   = getDB();
$stmt = $db->query("SELECT AVG(rating) AS avg_r, COUNT(*) AS cnt FROM submissions");
$row  = $stmt->fetch();

$avg   = $row['cnt'] > 0 ? round((float) $row['avg_r'], 1) : 0.0;
$count = (int) $row['cnt'];

jsonSuccess('OK', ['average' => $avg, 'count' => $count]);
