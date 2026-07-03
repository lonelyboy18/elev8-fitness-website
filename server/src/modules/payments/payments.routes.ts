import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { createOrderSchema, verifyPaymentSchema } from "./payments.validation.js";
import type { PaymentsController } from "./payments.controller.js";

export function createPaymentsRouter(controller: PaymentsController): Router {
  const router = Router();

  router.use(requireAuth);

  /**
   * @openapi
   * /api/payments:
   *   get:
   *     tags: [Payments]
   *     summary: List the authenticated user's payment history (most recent 20)
   *     security: [{ cookieAuth: [] }]
   *     responses:
   *       200:
   *         description: Payment list.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { data: { type: array, items: { $ref: '#/components/schemas/Payment' } } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   */
  router.get("/", asyncHandler(controller.list));

  /**
   * @openapi
   * /api/payments/order:
   *   post:
   *     tags: [Payments]
   *     summary: Create a pending Razorpay order for a plan/duration
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [plan, duration]
   *             properties:
   *               plan: { type: string, enum: [bft, cst] }
   *               duration: { type: integer, description: "Months — must match a configured pricing tier (1, 3, 6, or 12)", example: 1 }
   *     responses:
   *       200:
   *         description: Razorpay order created; a pending Payment row recorded.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         order_id: { type: string }
   *                         amount: { type: integer, description: paise }
   *                         currency: { type: string, example: INR }
   *                         key_id: { type: string, description: Razorpay public key ID for the client checkout widget }
   *                         description: { type: string }
   *                         price_label: { type: string }
   *       400:
   *         description: Invalid plan/duration combination, or the Razorpay API is unreachable.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   */
  router.post("/order", requireCsrf, validateBody(createOrderSchema), asyncHandler(controller.createOrder));

  /**
   * @openapi
   * /api/payments/verify:
   *   post:
   *     tags: [Payments]
   *     summary: Verify a completed Razorpay payment and activate the subscription
   *     description: >
   *       Validates razorpay_signature as an HMAC-SHA256 of `order_id|payment_id` using the
   *       server's Razorpay secret (constant-time compare). On success, marking the payment paid
   *       and activating the user's subscription happen in a single database transaction.
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [razorpay_payment_id, razorpay_order_id, razorpay_signature]
   *             properties:
   *               razorpay_payment_id: { type: string }
   *               razorpay_order_id: { type: string }
   *               razorpay_signature: { type: string }
   *     responses:
   *       200:
   *         description: Payment verified; subscription activated.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { plan: { type: string }, expires: { type: string, format: date } } }
   *       400:
   *         description: Signature invalid.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       404: { description: No matching pending payment for this order/user. }
   */
  router.post("/verify", requireCsrf, validateBody(verifyPaymentSchema), asyncHandler(controller.verify));

  return router;
}
