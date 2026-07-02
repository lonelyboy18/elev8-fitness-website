import type { PlanId } from "../../config/constants.js";
import type { PaymentRecord } from "../../db/types.js";
import { prisma } from "../../db/prismaClient.js";
import type { TransactionClient } from "../../db/transaction.js";
import type { Payment as PaymentRow, PrismaClient } from "../../generated/prisma/client.js";

type Db = PrismaClient | TransactionClient;

export interface CreatePendingPaymentInput {
  userId: number;
  plan: PlanId;
  durationMonths: number;
  amountPaise: number;
  razorpayOrderId: string;
}

export interface IPaymentsRepository {
  listForUser(userId: number): Promise<PaymentRecord[]>;
  findPendingByOrderId(orderId: string, userId: number): Promise<PaymentRecord | null>;
  createPending(input: CreatePendingPaymentInput): Promise<PaymentRecord>;
  markPaid(id: number, razorpayPaymentId: string): Promise<void>;
}

function toRecord(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    userId: row.userId,
    plan: row.plan,
    durationMonths: row.durationMonths,
    amountPaise: row.amountPaise,
    currency: row.currency,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  };
}

/** Prisma-backed payments store — swaps in for InMemoryPaymentsRepository with an identical interface. */
export class PrismaPaymentsRepository implements IPaymentsRepository {
  constructor(private readonly client: Db = prisma) {}

  async listForUser(userId: number): Promise<PaymentRecord[]> {
    const rows = await this.client.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return rows.map(toRecord);
  }

  async findPendingByOrderId(orderId: string, userId: number): Promise<PaymentRecord | null> {
    const row = await this.client.payment.findFirst({
      where: { razorpayOrderId: orderId, userId, status: "pending" },
    });
    return row ? toRecord(row) : null;
  }

  async createPending(input: CreatePendingPaymentInput): Promise<PaymentRecord> {
    const row = await this.client.payment.create({
      data: {
        userId: input.userId,
        plan: input.plan,
        durationMonths: input.durationMonths,
        amountPaise: input.amountPaise,
        razorpayOrderId: input.razorpayOrderId,
      },
    });
    return toRecord(row);
  }

  async markPaid(id: number, razorpayPaymentId: string): Promise<void> {
    await this.client.payment.update({
      where: { id },
      data: { razorpayPaymentId, status: "paid", paidAt: new Date() },
    });
  }
}

/** Scopes the repository to a transaction client — used when a service must write across repositories atomically. */
export function paymentsRepositoryFor(tx: TransactionClient): IPaymentsRepository {
  return new PrismaPaymentsRepository(tx);
}
