import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody, validateParams, validateQuery } from "../../shared/middleware/validate.js";
import { availabilityQuerySchema, bookingIdParamSchema, createBookingErrorKeyMap, createBookingSchema } from "./bookings.validation.js";
import type { BookingsController } from "./bookings.controller.js";

export function createBookingsRouter(controller: BookingsController): Router {
  const router = Router();

  // Public — no login required, mirrors slot_availability.php.
  router.get("/availability", validateQuery(availabilityQuerySchema), asyncHandler(controller.availability));

  router.get("/", requireAuth, asyncHandler(controller.list));

  router.post(
    "/",
    requireAuth,
    requireCsrf,
    validateBody(createBookingSchema, createBookingErrorKeyMap),
    asyncHandler(controller.create)
  );

  router.patch(
    "/:id/cancel",
    requireAuth,
    requireCsrf,
    validateParams(bookingIdParamSchema),
    asyncHandler(controller.cancel)
  );

  return router;
}
