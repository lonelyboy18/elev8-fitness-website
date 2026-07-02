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

  router.post(
    "/register",
    authRateLimiter,
    requireCsrf,
    validateBody(registerSchema),
    asyncHandler(controller.register)
  );

  router.post("/login", authRateLimiter, requireCsrf, validateBody(loginSchema), asyncHandler(controller.login));

  router.post("/refresh", requireCsrf, asyncHandler(controller.refresh));

  router.post("/logout", requireCsrf, asyncHandler(controller.logout));

  router.post("/logout-all", requireAuth, requireCsrf, asyncHandler(controller.logoutAll));

  router.get("/me", requireAuth, asyncHandler(controller.me));

  return router;
}
