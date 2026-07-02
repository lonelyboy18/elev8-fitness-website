import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import type { PaymentsService } from "./payments.service.js";
import type { CreateOrderInput, VerifyPaymentInput } from "./payments.validation.js";

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const data = await this.paymentsService.list(req.user!.id);
    sendSuccess(res, { data });
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const { plan, duration } = req.body as CreateOrderInput;
    const order = await this.paymentsService.createOrder(req.user!.id, plan, duration);
    sendSuccess(res, order, "Order created.");
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body as VerifyPaymentInput;
    const result = await this.paymentsService.verify(
      req.user!.id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );
    sendSuccess(res, result, "Payment verified! Your subscription is now active.");
  };
}
