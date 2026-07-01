import { httpClient } from "@shared/api/httpClient";
import type { PlanId } from "@shared/constants/plans";
import type { Payment, RazorpayOrder } from "../model/types";

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentApi = {
  list: () => httpClient.get<{ data: Payment[] }>("/payments"),
  createOrder: (plan: PlanId, duration: number) =>
    httpClient.post<RazorpayOrder>("/payments/order", { plan, duration }),
  verify: (payload: VerifyPaymentPayload) =>
    httpClient.post<{ plan: PlanId; expires: string }>("/payments/verify", payload),
};
