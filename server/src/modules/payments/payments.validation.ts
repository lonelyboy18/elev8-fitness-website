import { z } from "zod";
import { ALLOWED_PLANS } from "../../config/constants.js";

export const createOrderSchema = z.object({
  plan: z.enum(ALLOWED_PLANS, { errorMap: () => ({ message: "Invalid plan selected." }) }),
  duration: z.coerce.number().int(),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, "Missing payment verification data."),
  razorpay_order_id: z.string().min(1, "Missing payment verification data."),
  razorpay_signature: z.string().min(1, "Missing payment verification data."),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
