<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/razorpay.php';
require_once __DIR__ . '/../php/helpers.php';

// GET /php/slot_availability.php?date=YYYY-MM-DD&class_type=bft|cst
// Returns available seats per time slot for the given date + class type.
// No login required — public availability check.

setCORSHeaders();
startSecureSession();
requireMethod('GET');

$date      = $_GET['date']       ?? '';
$classType = $_GET['class_type'] ?? 'bft';

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !in_array($classType, ALLOWED_PLANS, true)) {
    jsonError(400, 'Invalid date or class type.');
}

$db   = getDB();
$stmt = $db->prepare(
    "SELECT time_slot, COUNT(*) AS cnt
     FROM bookings
     WHERE class_date = ? AND class_type = ? AND status = 'confirmed'
     GROUP BY time_slot"
);
$stmt->execute([$date, $classType]);

$counts = [];
foreach ($stmt->fetchAll() as $row) {
    $counts[$row['time_slot']] = (int)$row['cnt'];
}

$slots = [];
foreach (TIME_SLOTS as $slot) {
    $booked    = $counts[$slot] ?? 0;
    $available = max(0, MAX_SLOT_CAPACITY - $booked);
    $slots[]   = [
        'time'      => $slot,
        'booked'    => $booked,
        'available' => $available,
        'full'      => $available === 0,
    ];
}

jsonSuccess('OK', ['slots' => $slots, 'capacity' => MAX_SLOT_CAPACITY]);
