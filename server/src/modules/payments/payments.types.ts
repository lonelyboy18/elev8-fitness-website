import type { PlanId } from "../../config/constants.js";
import type { PaymentStatus } from "../../db/types.js";

/** Matches client/src/entities/payment/model/types.ts `Payment` — snake_case, mirrors legacy PHP output. */
export interface PaymentDto {
  id: number;
  plan: PlanId;
  duration_months: number;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}

/** Matches client's `RazorpayOrder`. */
export interface RazorpayOrderDto {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  description: string;
  price_label: string;
}
