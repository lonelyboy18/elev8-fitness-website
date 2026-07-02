import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import type { BookingsService } from "./bookings.service.js";
import type { AvailabilityQuery, CreateBookingInput } from "./bookings.validation.js";

export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const data = await this.bookingsService.list(req.user!.id);
    sendSuccess(res, { data });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as CreateBookingInput;
    const booking = await this.bookingsService.create(req.user!.id, input);
    sendSuccess(res, { booking }, "Booking confirmed! See you at ELEV8.");
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    const bookingId = Number(req.params.id);
    await this.bookingsService.cancel(req.user!.id, bookingId);
    sendSuccess(res, { message: "Booking cancelled successfully." }, "Booking cancelled successfully.");
  };

  availability = async (req: Request, res: Response): Promise<void> => {
    const { date, class_type } = req.query as unknown as AvailabilityQuery;
    const result = await this.bookingsService.availability(date, class_type);
    sendSuccess(res, result);
  };
}
