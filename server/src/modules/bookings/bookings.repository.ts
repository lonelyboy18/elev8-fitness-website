import type { PlanId, TimeSlot } from "../../config/constants.js";
import type { BookingRecord } from "../../db/types.js";
import { prisma } from "../../db/prismaClient.js";
import type { TransactionClient } from "../../db/transaction.js";
import type { Booking as BookingRow, PrismaClient } from "../../generated/prisma/client.js";

type Db = PrismaClient | TransactionClient;

export interface CreateBookingInput {
  userId: number;
  classType: PlanId;
  classDate: string;
  timeSlot: TimeSlot;
}

export interface IBookingsRepository {
  listForUser(userId: number): Promise<BookingRecord[]>;
  findByIdForUser(id: number, userId: number): Promise<BookingRecord | null>;
  findActiveDuplicate(userId: number, classDate: string, timeSlot: TimeSlot): Promise<BookingRecord | null>;
  countConfirmed(classDate: string, timeSlot: TimeSlot, classType: PlanId): Promise<number>;
  create(input: CreateBookingInput): Promise<BookingRecord>;
  cancel(id: number): Promise<void>;
  /** Serializes concurrent booking attempts for one exact (date, time_slot, class_type) slot
   * via a Postgres session-scoped advisory lock, held for the caller's transaction lifetime. */
  lockSlot(classDate: string, timeSlot: TimeSlot, classType: PlanId): Promise<void>;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toRecord(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    userId: row.userId,
    classType: row.classType,
    classDate: toDateOnly(row.classDate),
    timeSlot: row.timeSlot as TimeSlot,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Prisma-backed bookings store — swaps in for InMemoryBookingsRepository with an identical interface. */
export class PrismaBookingsRepository implements IBookingsRepository {
  constructor(private readonly client: Db = prisma) {}

  async listForUser(userId: number): Promise<BookingRecord[]> {
    const rows = await this.client.booking.findMany({
      where: { userId },
      orderBy: [{ classDate: "desc" }, { timeSlot: "asc" }],
      take: 60,
    });
    return rows.map(toRecord);
  }

  async findByIdForUser(id: number, userId: number): Promise<BookingRecord | null> {
    const row = await this.client.booking.findFirst({ where: { id, userId } });
    return row ? toRecord(row) : null;
  }

  async findActiveDuplicate(userId: number, classDate: string, timeSlot: TimeSlot): Promise<BookingRecord | null> {
    const row = await this.client.booking.findFirst({
      where: { userId, classDate: new Date(classDate), timeSlot, status: "confirmed" },
    });
    return row ? toRecord(row) : null;
  }

  async countConfirmed(classDate: string, timeSlot: TimeSlot, classType: PlanId): Promise<number> {
    return this.client.booking.count({
      where: { classDate: new Date(classDate), timeSlot, classType, status: "confirmed" },
    });
  }

  async create(input: CreateBookingInput): Promise<BookingRecord> {
    const row = await this.client.booking.create({
      data: {
        userId: input.userId,
        classType: input.classType,
        classDate: new Date(input.classDate),
        timeSlot: input.timeSlot,
      },
    });
    return toRecord(row);
  }

  async cancel(id: number): Promise<void> {
    await this.client.booking.update({ where: { id }, data: { status: "cancelled" } });
  }

  async lockSlot(classDate: string, timeSlot: TimeSlot, classType: PlanId): Promise<void> {
    const key = `${classDate}|${timeSlot}|${classType}`;
    await this.client.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  }
}

/** Scopes the repository to a transaction client — used so create() can lock + check + insert atomically. */
export function bookingsRepositoryFor(tx: TransactionClient): IBookingsRepository {
  return new PrismaBookingsRepository(tx);
}
