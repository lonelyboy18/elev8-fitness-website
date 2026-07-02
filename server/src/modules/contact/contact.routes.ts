import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { submitContactErrorKeyMap, submitContactSchema } from "./contact.validation.js";
import type { ContactController } from "./contact.controller.js";

export function createContactRouter(controller: ContactController): Router {
  const router = Router();

  router.post("/", requireCsrf, validateBody(submitContactSchema, submitContactErrorKeyMap), asyncHandler(controller.submit));

  return router;
}
