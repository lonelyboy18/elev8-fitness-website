<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/cancel_booking.php
// Body (JSON): { booking_id }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();
requireLogin();

$body      = readJSONBody();
$bookingId = isset($body['booking_id']) ? (int)$body['booking_id'] : 0;
$userId    = (int)$_SESSION['user_id'];

if ($bookingId <= 0) {
    jsonError(400, 'Invalid booking ID.');
}

$db   = getDB();
$stmt = $db->prepare(
    "SELECT id, class_date, time_slot, status
     FROM bookings WHERE id = ? AND user_id = ? LIMIT 1"
);
$stmt->execute([$bookingId, $userId]);
$booking = $stmt->fetch();

if (!$booking) {
    jsonError(404, 'Booking not found.');
}

if ($booking['status'] === 'cancelled') {
    jsonError(409, 'This booking is already cancelled.');
}

$db->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?")
   ->execute([$bookingId, $userId]);

jsonSuccess('Booking cancelled successfully.');
