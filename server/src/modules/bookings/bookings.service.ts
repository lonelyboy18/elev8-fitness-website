import { Prisma } from "../../generated/prisma/client.js";
import { MAX_SLOT_CAPACITY, TIME_SLOTS, type PlanId } from "../../config/constants.js";
import { AppError } from "../../shared/errors/AppError.js";
import { withTransaction } from "../../db/transaction.js";
import type { BookingRecord } from "../../db/types.js";
import { bookingsRepositoryFor, type IBookingsRepository } from "./bookings.repository.js";
import type { BookingDto, SlotAvailabilityDto } from "./bookings.types.js";
import type { CreateBookingInput } from "./bookings.validation.js";

const DUPLICATE_BOOKING_MESSAGE = "You already have a booking for this date and time slot.";

function toDto(booking: BookingRecord): BookingDto {
  return {
    id: booking.id,
    class_type: booking.classType,
    class_date: booking.classDate,
    time_slot: booking.timeSlot,
    status: booking.status,
    created_at: booking.createdAt,
  };
}

export class BookingsService {
  constructor(private readonly bookingsRepo: IBookingsRepository) {}

  async list(userId: number): Promise<BookingDto[]> {
    const bookings = await this.bookingsRepo.listForUser(userId);
    return bookings.map(toDto);
  }

  async create(userId: number, input: CreateBookingInput): Promise<BookingDto> {
    try {
      return await withTransaction(async (tx) => {
        const repo = bookingsRepositoryFor(tx);

        // Serializes every concurrent booking attempt for this exact (date, time_slot,
        // class_type) triple — without this, two requests can both pass the capacity
        // check below before either inserts, over-booking the slot.
        await repo.lockSlot(input.date, input.time_slot, input.class_type);

        const duplicate = await repo.findActiveDuplicate(userId, input.date, input.time_slot);
        if (duplicate) {
          throw AppError.conflict(DUPLICATE_BOOKING_MESSAGE);
        }

        const count = await repo.countConfirmed(input.date, input.time_slot, input.class_type);
        if (count >= MAX_SLOT_CAPACITY) {
          throw AppError.conflict("This slot is full. Please choose a different time or date.");
        }

        const booking = await repo.create({
          userId,
          classType: input.class_type,
          classDate: input.date,
          timeSlot: input.time_slot,
        });
        return toDto(booking);
      });
    } catch (err) {
      // Defense-in-depth: uq_booking_user_slot_status firing means the lock above was
      // somehow bypassed (e.g. a direct DB write) — surface the same conflict message.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw AppError.conflict(DUPLICATE_BOOKING_MESSAGE);
      }
      throw err;
    }
  }

  async cancel(userId: number, bookingId: number): Promise<void> {
    const booking = await this.bookingsRepo.findByIdForUser(bookingId, userId);
    if (!booking) throw AppError.notFound("Booking not found.");
    if (booking.status === "cancelled") throw AppError.conflict("This booking is already cancelled.");
    await this.bookingsRepo.cancel(bookingId);
  }

  async availability(date: string, classType: PlanId): Promise<{ slots: SlotAvailabilityDto[]; capacity: number }> {
    const slots: SlotAvailabilityDto[] = [];
    for (const slot of TIME_SLOTS) {
      const booked = await this.bookingsRepo.countConfirmed(date, slot, classType);
      const available = Math.max(0, MAX_SLOT_CAPACITY - booked);
      slots.push({ time: slot, booked, available, full: available === 0 });
    }
    return { slots, capacity: MAX_SLOT_CAPACITY };
  }
}
