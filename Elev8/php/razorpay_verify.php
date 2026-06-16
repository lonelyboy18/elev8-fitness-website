<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/razorpay.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/razorpay_verify.php
// Body (JSON): { razorpay_payment_id, razorpay_order_id, razorpay_signature }
// Verifies HMAC, marks payment paid, and activates subscription.

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();
requireLogin();

$body      = readJSONBody();
$paymentId = field($body, 'razorpay_payment_id');
$orderId   = field($body, 'razorpay_order_id');
$signature = field($body, 'razorpay_signature');

if (!$paymentId || !$orderId || !$signature) {
    jsonError(400, 'Missing payment verification data.');
}

// Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
$expected = hash_hmac('sha256', $orderId . '|' . $paymentId, RAZORPAY_KEY_SECRET);
if (!hash_equals($expected, $signature)) {
    jsonError(400, 'Payment signature invalid. Contact support if amount was deducted.');
}

$userId = (int)$_SESSION['user_id'];
$db     = getDB();

$stmt = $db->prepare(
    "SELECT id, plan, duration_months FROM payments
     WHERE razorpay_order_id = ? AND user_id = ? AND status = 'pending'
     LIMIT 1"
);
$stmt->execute([$orderId, $userId]);
$payment = $stmt->fetch();

if (!$payment) {
    jsonError(404, 'Payment record not found or already processed.');
}

$expiresAt = (new DateTime())->modify('+' . (int)$payment['duration_months'] . ' months')
                              ->format('Y-m-d');

// Mark payment as paid
$db->prepare(
    "UPDATE payments
     SET razorpay_payment_id = ?, status = 'paid', paid_at = NOW()
     WHERE id = ?"
)->execute([$paymentId, (int)$payment['id']]);

// Activate subscription on user
$db->prepare(
    "UPDATE users
     SET plan = ?, subscription_status = 'active', subscription_expires = ?
     WHERE id = ?"
)->execute([$payment['plan'], $expiresAt, $userId]);

$_SESSION['user_plan'] = $payment['plan'];

jsonSuccess('Payment verified! Your subscription is now active.', [
    'plan'    => $payment['plan'],
    'expires' => $expiresAt,
]);
