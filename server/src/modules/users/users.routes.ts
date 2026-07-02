import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireAuth } from "../../shared/middleware/authenticate.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { deleteAccountSchema, updateProfileSchema } from "./users.validation.js";
import type { UsersController } from "./users.controller.js";

export function createUsersRouter(controller: UsersController): Router {
  const router = Router();

  router.patch(
    "/me",
    requireAuth,
    requireCsrf,
    validateBody(updateProfileSchema),
    asyncHandler(controller.updateProfile)
  );

  router.delete("/me", requireCsrf, validateBody(deleteAccountSchema), asyncHandler(controller.deleteAccount));

  return router;
}
