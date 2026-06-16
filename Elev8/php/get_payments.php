<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// GET /php/get_payments.php
// Returns the authenticated user's payment history (newest first, limit 20).

setCORSHeaders();
startSecureSession();
requireMethod('GET');
requireLogin();

$db   = getDB();
$stmt = $db->prepare(
    "SELECT id, plan, duration_months, amount_paise, currency,
            status, razorpay_payment_id, created_at, paid_at
     FROM payments
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 20"
);
$stmt->execute([(int)$_SESSION['user_id']]);

jsonSuccess('OK', ['data' => $stmt->fetchAll()]);
