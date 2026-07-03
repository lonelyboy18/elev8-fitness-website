import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { deleteAccountSchema, updateProfileSchema } from "./users.validation.js";
import type { UsersController } from "./users.controller.js";

export function createUsersRouter(controller: UsersController): Router {
  const router = Router();

  /**
   * @openapi
   * /api/users/me:
   *   patch:
   *     tags: [Users]
   *     summary: Update the authenticated user's name/mobile
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, mobile]
   *             properties:
   *               name: { type: string }
   *               mobile: { type: string, description: "10-digit Indian mobile, or empty string to clear" }
   *     responses:
   *       200:
   *         description: Profile updated.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   */
  router.patch(
    "/me",
    requireAuth,
    requireCsrf,
    validateBody(updateProfileSchema),
    asyncHandler(controller.updateProfile)
  );

  /**
   * @openapi
   * /api/users/me:
   *   delete:
   *     tags: [Users]
   *     summary: Permanently delete the account (re-authenticates by password, not by session)
   *     description: >
   *       Deletes the user row; bookings, payments, and refresh tokens cascade-delete with it.
   *       Requires the account's email + password + an explicit confirm flag in the body, rather
   *       than relying solely on the access-token cookie, as a deliberate extra confirmation step
   *       for a destructive, irreversible action.
   *     security: [{ csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, confirm]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string, format: password }
   *               confirm: { type: boolean, enum: [true] }
   *     responses:
   *       200:
   *         description: Account and all related data deleted; auth cookies cleared.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   */
  router.delete("/me", requireCsrf, validateBody(deleteAccountSchema), asyncHandler(controller.deleteAccount));

  return router;
}
