<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// GET /php/get_bookings.php
// Returns the authenticated user's bookings (newest first, limit 60).

setCORSHeaders();
startSecureSession();
requireMethod('GET');
requireLogin();

$db   = getDB();
$stmt = $db->prepare(
    "SELECT id, class_type, class_date, time_slot, status, created_at
     FROM bookings
     WHERE user_id = ?
     ORDER BY class_date DESC, time_slot ASC
     LIMIT 60"
);
$stmt->execute([(int)$_SESSION['user_id']]);

jsonSuccess('OK', ['data' => $stmt->fetchAll()]);
