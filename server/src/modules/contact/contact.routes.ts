import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { submitContactErrorKeyMap, submitContactSchema } from "./contact.validation.js";
import type { ContactController } from "./contact.controller.js";

export function createContactRouter(controller: ContactController): Router {
  const router = Router();

  /**
   * @openapi
   * /api/contact:
   *   post:
   *     tags: [Contact]
   *     summary: Submit the contact form (public — no authentication required)
   *     description: >
   *       Field-level validation errors use legacy `ct-*` prefixed keys (e.g. `ct-name`,
   *       `ct-email`) to match the frontend's ContactForm.tsx, which still expects the original
   *       PHP-era error key names.
   *     security: [{ csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, message]
   *             properties:
   *               name: { type: string }
   *               email: { type: string, format: email }
   *               phone: { type: string, description: "Optional — 10-digit Indian mobile if provided" }
   *               message: { type: string, minLength: 10, maxLength: 3000 }
   *     responses:
   *       200:
   *         description: Message recorded.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       422:
   *         description: Field-level validation failure, keyed by legacy ct-* names.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ValidationErrorEnvelope' } } }
   */
  router.post("/", requireCsrf, validateBody(submitContactSchema, submitContactErrorKeyMap), asyncHandler(controller.submit));

  return router;
}
