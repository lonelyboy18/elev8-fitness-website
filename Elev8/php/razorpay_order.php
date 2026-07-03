<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/razorpay.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/razorpay_order.php
// Body (JSON): { plan, duration }
// Creates a Razorpay order via API and records a pending payment row.
//
// DISABLED — payments are temporarily turned off; registration now hands the member off to a
// coach on WhatsApp instead of a checkout flow (see js/pages/auth.js's showChooseCoachModal()).
// The real implementation is preserved below, commented out, so re-enabling is a small,
// low-risk change rather than a rewrite.
//
// TODO(payments): re-enable Razorpay order creation once the payment flow returns — restore the
// code below (already reads pricing from PLAN_PRICING and calls the Razorpay orders API).

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();
requireLogin();

jsonError(503, 'Payments are temporarily unavailable. Please contact your coach to complete registration.');

// --- Original implementation (restore when re-enabling payments) ---
// $body     = readJSONBody();
// $plan     = field($body, 'plan');
// $duration = isset($body['duration']) ? (int)$body['duration'] : 0;
// $userId   = (int)$_SESSION['user_id'];
//
// if (!in_array($plan, ALLOWED_PLANS, true)) {
//     jsonError(400, 'Invalid plan selected.');
// }
//
// if (!isset(PLAN_PRICING[$plan][$duration])) {
//     jsonError(400, 'Invalid duration selected.');
// }
//
// $pricing = PLAN_PRICING[$plan][$duration];
// $amount  = $pricing['paise'];
// $receipt = 'elev8_' . $userId . '_' . time();
//
// // Create order on Razorpay
// $curl = curl_init();
// curl_setopt_array($curl, [
//     CURLOPT_URL            => 'https://api.razorpay.com/v1/orders',
//     CURLOPT_RETURNTRANSFER => true,
//     CURLOPT_POST           => true,
//     CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
//     CURLOPT_USERPWD        => RAZORPAY_KEY_ID . ':' . RAZORPAY_KEY_SECRET,
//     CURLOPT_POSTFIELDS     => json_encode([
//         'amount'   => $amount,
//         'currency' => 'INR',
//         'receipt'  => $receipt,
//     ]),
//     CURLOPT_TIMEOUT        => 20,
// ]);
//
// $response = curl_exec($curl);
// $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
// curl_close($curl);
//
// if ($httpCode !== 200 || !$response) {
//     jsonError(502, 'Could not reach payment gateway. Please try again.');
// }
//
// $order = json_decode($response, true);
// if (empty($order['id'])) {
//     jsonError(502, 'Invalid response from payment gateway.');
// }
//
// // Record pending payment
// $db = getDB();
// $db->prepare(
//     "INSERT INTO payments (user_id, plan, duration_months, amount_paise, razorpay_order_id)
//      VALUES (?, ?, ?, ?, ?)"
// )->execute([$userId, $plan, $duration, $amount, $order['id']]);
//
// jsonSuccess('Order created.', [
//     'order_id'    => $order['id'],
//     'amount'      => $amount,
//     'currency'    => 'INR',
//     'key_id'      => RAZORPAY_KEY_ID,
//     'description' => strtoupper($plan) . ' — ' . $duration . ' month' . ($duration > 1 ? 's' : ''),
//     'price_label' => $pricing['label'],
// ]);
