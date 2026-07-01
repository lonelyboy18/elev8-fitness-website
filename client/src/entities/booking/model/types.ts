import type { PlanId } from "@shared/constants/plans";

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: number;
  class_type: PlanId;
  class_date: string;
  time_slot: string;
  status: BookingStatus;
  created_at: string;
}

export interface SlotAvailability {
  time: string;
  booked: number;
  available: number;
  full: boolean;
}
