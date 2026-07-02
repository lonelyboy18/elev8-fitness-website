import { z } from "zod";
import { ALLOWED_PLANS, MAX_BOOKING_DAYS_AHEAD, TIME_SLOTS } from "../../config/constants.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function maxDateIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_BOOKING_DAYS_AHEAD);
  return d.toISOString().slice(0, 10);
}

const bookingDate = z
  .string({ required_error: "Please select a class date." })
  .min(1, "Please select a class date.")
  .refine((v) => DATE_RE.test(v), "Invalid date format.")
  .refine((v) => !DATE_RE.test(v) || v >= todayIso(), "Please select a future date.")
  .refine((v) => !DATE_RE.test(v) || v <= maxDateIso(), `You can only book up to ${MAX_BOOKING_DAYS_AHEAD} days in advance.`);

export const createBookingSchema = z.object({
  class_type: z.enum(ALLOWED_PLANS, { errorMap: () => ({ message: "Please select a class type." }) }),
  date: bookingDate,
  time_slot: z.enum(TIME_SLOTS, { errorMap: () => ({ message: "Please select a time slot." }) }),
});

export const createBookingErrorKeyMap = { class_type: "type", date: "date", time_slot: "slot" };

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid booking ID."),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(DATE_RE, "Invalid date or class type."),
  class_type: z.enum(ALLOWED_PLANS, { errorMap: () => ({ message: "Invalid date or class type." }) }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
