import crypto from "node:crypto";
import { PLAN_PRICING, type PlanId } from "../../config/constants.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../shared/errors/AppError.js";
import { withTransaction } from "../../db/transaction.js";
import type { PaymentRecord } from "../../db/types.js";
import { usersRepositoryFor } from "../users/users.repository.js";
import { paymentsRepositoryFor, type IPaymentsRepository } from "./payments.repository.js";
import type { PaymentDto, RazorpayOrderDto } from "./payments.types.js";

function toDto(payment: PaymentRecord): PaymentDto {
  return {
    id: payment.id,
    plan: payment.plan,
    duration_months: payment.durationMonths,
    amount_paise: payment.amountPaise,
    currency: payment.currency,
    status: payment.status,
    razorpay_payment_id: payment.razorpayPaymentId,
    created_at: payment.createdAt,
    paid_at: payment.paidAt,
  };
}

interface RazorpayOrderResponse {
  id: string;
}

export class PaymentsService {
  constructor(private readonly paymentsRepo: IPaymentsRepository) {}

  async list(userId: number): Promise<PaymentDto[]> {
    const payments = await this.paymentsRepo.listForUser(userId);
    return payments.map(toDto);
  }

  async createOrder(userId: number, plan: PlanId, duration: number): Promise<RazorpayOrderDto> {
    const pricing = PLAN_PRICING[plan][duration];
    if (!pricing) {
      throw AppError.badRequest("Invalid duration selected.");
    }

    const receipt = `elev8_${userId}_${Date.now()}`;
    const order = await this.createRazorpayOrder(pricing.paise, receipt);

    await this.paymentsRepo.createPending({
      userId,
      plan,
      durationMonths: duration,
      amountPaise: pricing.paise,
      razorpayOrderId: order.id,
    });

    logger.info({ userId, plan, duration }, "payments.order_created");

    return {
      order_id: order.id,
      amount: pricing.paise,
      currency: "INR",
      key_id: env.RAZORPAY_KEY_ID,
      description: `${plan.toUpperCase()} — ${duration} month${duration > 1 ? "s" : ""}`,
      price_label: pricing.label,
    };
  }

  async verify(
    userId: number,
    paymentId: string,
    orderId: string,
    signature: string
  ): Promise<{ plan: PlanId; expires: string }> {
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const signaturesMatch =
      expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!signaturesMatch) {
      logger.warn({ userId, orderId }, "payments.signature_invalid");
      throw AppError.badRequest("Payment signature invalid. Contact support if amount was deducted.");
    }

    const payment = await this.paymentsRepo.findPendingByOrderId(orderId, userId);
    if (!payment) {
      throw AppError.notFound("Payment record not found or already processed.");
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + payment.durationMonths);
    const expiresIso = expiresAt.toISOString().slice(0, 10);

    // Payment confirmation and subscription activation must commit together — a partial
    // write here would either charge a member without activating them, or vice versa.
    await withTransaction(async (tx) => {
      await paymentsRepositoryFor(tx).markPaid(payment.id, paymentId);
      await usersRepositoryFor(tx).activateSubscription(userId, payment.plan, expiresIso);
    });

    logger.info({ userId, plan: payment.plan }, "payments.verified");
    return { plan: payment.plan, expires: expiresIso };
  }

  private async createRazorpayOrder(amountPaise: number, receipt: string): Promise<RazorpayOrderResponse> {
    const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");

    let response: Response;
    try {
      response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      logger.error({ err }, "payments.razorpay_unreachable");
      throw AppError.badRequest("Could not reach payment gateway. Please try again.");
    }

    if (!response.ok) {
      throw new AppError(502, "Could not reach payment gateway. Please try again.");
    }

    const order = (await response.json()) as Partial<RazorpayOrderResponse>;
    if (!order.id) {
      throw new AppError(502, "Invalid response from payment gateway.");
    }
    return { id: order.id };
  }
}
