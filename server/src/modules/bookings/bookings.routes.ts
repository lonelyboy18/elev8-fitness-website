import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody, validateParams, validateQuery } from "../../shared/middleware/validate.js";
import { availabilityQuerySchema, bookingIdParamSchema, createBookingErrorKeyMap, createBookingSchema } from "./bookings.validation.js";
import type { BookingsController } from "./bookings.controller.js";

export function createBookingsRouter(controller: BookingsController): Router {
  const router = Router();

  /**
   * @openapi
   * /api/bookings/availability:
   *   get:
   *     tags: [Bookings]
   *     summary: Get remaining capacity for every time slot on a given date (public)
   *     parameters:
   *       - in: query
   *         name: date
   *         required: true
   *         schema: { type: string, format: date }
   *       - in: query
   *         name: class_type
   *         required: true
   *         schema: { type: string, enum: [bft, cst] }
   *     responses:
   *       200:
   *         description: Per-slot booked/available counts and the shared capacity ceiling.
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
   *                         capacity: { type: integer, example: 15 }
   *                         slots:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               time: { type: string, example: "05:30" }
   *                               booked: { type: integer }
   *                               available: { type: integer }
   *                               full: { type: boolean }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   */
  router.get("/availability", validateQuery(availabilityQuerySchema), asyncHandler(controller.availability));

  /**
   * @openapi
   * /api/bookings:
   *   get:
   *     tags: [Bookings]
   *     summary: List the authenticated user's bookings (most recent 60)
   *     security: [{ cookieAuth: [] }]
   *     responses:
   *       200:
   *         description: Booking list.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { data: { type: array, items: { $ref: '#/components/schemas/Booking' } } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   */
  router.get("/", requireAuth, asyncHandler(controller.list));

  /**
   * @openapi
   * /api/bookings:
   *   post:
   *     tags: [Bookings]
   *     summary: Reserve a class slot
   *     description: >
   *       Enforces three business rules inside one locked transaction (a Postgres advisory lock
   *       keyed on date+time_slot+class_type serializes concurrent attempts at the same slot,
   *       preventing over-booking): no more than 30 days in advance, no duplicate active booking
   *       for the same user/date/slot, and the slot's shared capacity is not exceeded.
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [class_type, date, time_slot]
   *             properties:
   *               class_type: { type: string, enum: [bft, cst] }
   *               date: { type: string, format: date }
   *               time_slot: { type: string, example: "05:30" }
   *     responses:
   *       200:
   *         description: Booking confirmed.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { booking: { $ref: '#/components/schemas/Booking' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       409:
   *         description: Duplicate booking for this user/date/slot, or the slot is at capacity.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   */
  router.post(
    "/",
    requireAuth,
    requireCsrf,
    validateBody(createBookingSchema, createBookingErrorKeyMap),
    asyncHandler(controller.create)
  );

  /**
   * @openapi
   * /api/bookings/{id}/cancel:
   *   patch:
   *     tags: [Bookings]
   *     summary: Cancel one of the authenticated user's bookings
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Booking cancelled.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       404: { description: Booking not found (or belongs to another user). }
   *       409: { description: Booking is already cancelled. }
   */
  router.patch(
    "/:id/cancel",
    requireAuth,
    requireCsrf,
    validateParams(bookingIdParamSchema),
    asyncHandler(controller.cancel)
  );

  return router;
}
