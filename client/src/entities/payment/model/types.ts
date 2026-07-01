import type { PlanId } from "@shared/constants/plans";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
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

export interface RazorpayOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  description: string;
  price_label: string;
}
