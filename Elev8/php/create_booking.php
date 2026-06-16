<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/razorpay.php';
require_once __DIR__ . '/../php/helpers.php';

// POST /php/create_booking.php
// Body (JSON): { class_type, date, time_slot }

setCORSHeaders();
startSecureSession();
requireMethod('POST');
requireCSRF();
requireLogin();

$body      = readJSONBody();
$classType = field($body, 'class_type');
$date      = field($body, 'date');
$timeSlot  = field($body, 'time_slot');
$userId    = (int)$_SESSION['user_id'];

$errors = [];

if (!in_array($classType, ALLOWED_PLANS, true)) {
    $errors['bk-classType'] = 'Please select a class type.';
}

if ($date === '') {
    $errors['bk-date'] = 'Please select a class date.';
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    $errors['bk-date'] = 'Invalid date format.';
} else {
    $dateObj = new DateTime($date);
    $today   = new DateTime('today');
    $maxDate = (new DateTime())->modify('+30 days');
    if ($dateObj < $today) {
        $errors['bk-date'] = 'Please select a future date.';
    } elseif ($dateObj > $maxDate) {
        $errors['bk-date'] = 'You can only book up to 30 days in advance.';
    }
}

if (!in_array($timeSlot, TIME_SLOTS, true)) {
    $errors['bk-timeSlot'] = 'Please select a time slot.';
}

if (!empty($errors)) {
    jsonValidationError($errors);
}

$db = getDB();

// Prevent duplicate booking for same date + slot
$dup = $db->prepare(
    "SELECT id FROM bookings
     WHERE user_id = ? AND class_date = ? AND time_slot = ? AND status = 'confirmed'
     LIMIT 1"
);
$dup->execute([$userId, $date, $timeSlot]);
if ($dup->fetch()) {
    jsonError(409, 'You already have a booking for this date and time slot.');
}

// Check slot capacity
$cap = $db->prepare(
    "SELECT COUNT(*) FROM bookings
     WHERE class_date = ? AND time_slot = ? AND class_type = ? AND status = 'confirmed'"
);
$cap->execute([$date, $timeSlot, $classType]);
if ((int)$cap->fetchColumn() >= MAX_SLOT_CAPACITY) {
    jsonError(409, 'This slot is full. Please choose a different time or date.');
}

$db->prepare(
    "INSERT INTO bookings (user_id, class_type, class_date, time_slot) VALUES (?, ?, ?, ?)"
)->execute([$userId, $classType, $date, $timeSlot]);

jsonSuccess('Booking confirmed! See you at ELEV8.', [
    'booking' => [
        'id'         => (int)$db->lastInsertId(),
        'class_type' => $classType,
        'class_date' => $date,
        'time_slot'  => $timeSlot,
        'status'     => 'confirmed',
    ],
]);
