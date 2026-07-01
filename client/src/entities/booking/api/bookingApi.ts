import { httpClient } from "@shared/api/httpClient";
import type { PlanId } from "@shared/constants/plans";
import type { Booking, SlotAvailability } from "../model/types";

export interface CreateBookingPayload {
  class_type: PlanId;
  date: string;
  time_slot: string;
}

export const bookingApi = {
  list: () => httpClient.get<{ data: Booking[] }>("/bookings"),
  create: (payload: CreateBookingPayload) => httpClient.post<{ booking: Booking }>("/bookings", payload),
  cancel: (id: number) => httpClient.patch<{ message: string }>(`/bookings/${id}/cancel`),
  availability: (date: string, classType: PlanId) =>
    httpClient.get<{ slots: SlotAvailability[]; capacity: number }>(
      `/bookings/availability?date=${date}&class_type=${classType}`
    ),
};
