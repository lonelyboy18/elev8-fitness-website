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

  router.get("/", asyncHandler(controller.list));
  router.post("/order", requireCsrf, validateBody(createOrderSchema), asyncHandler(controller.createOrder));
  router.post("/verify", requireCsrf, validateBody(verifyPaymentSchema), asyncHandler(controller.verify));

  return router;
}
