import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { authRateLimiter } from "../../shared/middleware/rateLimit.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import type { AuthController } from "./auth.controller.js";

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  /**
   * @openapi
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Create an account and start a session
   *     security: [{ csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, mobile, password, plan]
   *             properties:
   *               name: { type: string }
   *               email: { type: string, format: email }
   *               mobile: { type: string, example: "9876543210" }
   *               password: { type: string, format: password, minLength: 8 }
   *               plan: { type: string, enum: [bft, cst] }
   *     responses:
   *       201:
   *         description: Account created. Sets access_token and refresh_token cookies.
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
   *       422: { $ref: '#/components/responses/ValidationFailed' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       429: { description: Too many attempts from this client. }
   */
  router.post(
    "/register",
    authRateLimiter,
    requireCsrf,
    validateBody(registerSchema),
    asyncHandler(controller.register)
  );

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Authenticate and start a session
   *     security: [{ csrfHeader: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string, format: password }
   *     responses:
   *       200:
   *         description: Authenticated. Sets access_token and refresh_token cookies.
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
   *       401:
   *         description: Incorrect email or password (generic message — no user enumeration).
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       429: { description: Too many attempts from this client. }
   */
  router.post("/login", authRateLimiter, requireCsrf, validateBody(loginSchema), asyncHandler(controller.login));

  /**
   * @openapi
   * /api/auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Rotate the refresh token and mint a new access token
   *     description: >
   *       Called by the frontend after a 401 to silently renew the session. The refresh_token
   *       cookie (path-scoped to /api/auth) is rotated on every successful call; presenting an
   *       already-used (revoked) refresh token is treated as theft and revokes its entire token
   *       family, forcing re-login on all devices.
   *     security: [{ csrfHeader: [] }]
   *     responses:
   *       200:
   *         description: New access_token and refresh_token cookies set.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   *       429: { description: Too many attempts from this client. }
   */
  router.post("/refresh", authRateLimiter, requireCsrf, asyncHandler(controller.refresh));

  /**
   * @openapi
   * /api/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: End the current session
   *     security: [{ csrfHeader: [] }]
   *     responses:
   *       200:
   *         description: Auth cookies cleared.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   */
  router.post("/logout", requireCsrf, asyncHandler(controller.logout));

  /**
   * @openapi
   * /api/auth/logout-all:
   *   post:
   *     tags: [Auth]
   *     summary: End every session for this account (all devices)
   *     security: [{ cookieAuth: [], csrfHeader: [] }]
   *     responses:
   *       200:
   *         description: All refresh-token families for this user revoked; auth cookies cleared.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   *       403: { $ref: '#/components/responses/CsrfRejected' }
   */
  router.post("/logout-all", requireAuth, requireCsrf, asyncHandler(controller.logoutAll));

  /**
   * @openapi
   * /api/auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Get the authenticated user's profile
   *     security: [{ cookieAuth: [] }]
   *     responses:
   *       200:
   *         description: Current user profile.
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessEnvelope'
   *                 - type: object
   *                   properties:
   *                     data: { type: object, properties: { user: { $ref: '#/components/schemas/User' } } }
   *       401: { $ref: '#/components/responses/Unauthorized' }
   */
  router.get("/me", requireAuth, asyncHandler(controller.me));

  return router;
}
