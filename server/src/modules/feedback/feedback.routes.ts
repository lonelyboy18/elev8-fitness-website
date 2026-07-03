import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { submitFeedbackSchema } from "./feedback.validation.js";
import type { FeedbackController } from "./feedback.controller.js";

export function createFeedbackRouter(controller: FeedbackController): Router {
  const router = Router();

  /**
   * @openapi
   * /api/feedback/stats:
   *   get:
   *     tags: [Feedback]
   *     summary: Get aggregate rating stats across all feedback (public)
   *     responses:
   *       200:
   *         description: Average rating and total count.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { average: { type: number, example: 4.7 }, count: { type: integer } } }
   */
  router.get("/stats", asyncHandler(controller.stats));

  /**
   * @openapi
   * /api/feedback:
   *   post:
   *     tags: [Feedback]
   *     summary: Submit feedback (public — no authentication required)
   *     security: [{ csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, rating, feedback]
   *             properties:
   *               name: { type: string }
   *               email: { type: string, format: email }
   *               rating: { type: integer, minimum: 1, maximum: 5 }
   *               feedback: { type: string, minLength: 10, maxLength: 5000 }
   *     responses:
   *       200:
   *         description: Feedback recorded.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   */
  router.post("/", requireCsrf, validateBody(submitFeedbackSchema), asyncHandler(controller.submit));

  return router;
}
