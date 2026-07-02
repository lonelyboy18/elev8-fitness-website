import type { PlanId, TimeSlot } from "../../config/constants.js";
import type { BookingStatus } from "../../db/types.js";

/** Matches client/src/entities/booking/model/types.ts `Booking` — snake_case, mirrors legacy PHP output. */
export interface BookingDto {
  id: number;
  class_type: PlanId;
  class_date: string;
  time_slot: TimeSlot;
  status: BookingStatus;
  created_at: string;
}

export interface SlotAvailabilityDto {
  time: TimeSlot;
  booked: number;
  available: number;
  full: boolean;
}
