-- Defense-in-depth against the booking capacity/duplicate race condition. The primary
-- fix is a Postgres advisory lock taken in bookings.service.ts::create (serializes
-- concurrent attempts at the same date/time_slot/class_type). This unique index is a
-- safety net for any write path that bypasses the service layer. `status` is part of
-- the key so a user can still rebook the same slot after cancelling it.
CREATE UNIQUE INDEX "uq_booking_user_slot_status" ON "bookings"("user_id", "class_date", "time_slot", "status");
