import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { requireCsrf } from "../../shared/middleware/csrf.js";
import { validateBody } from "../../shared/middleware/validate.js";
import { submitFeedbackSchema } from "./feedback.validation.js";
import type { FeedbackController } from "./feedback.controller.js";

export function createFeedbackRouter(controller: FeedbackController): Router {
  const router = Router();

  router.get("/stats", asyncHandler(controller.stats));
  router.post("/", requireCsrf, validateBody(submitFeedbackSchema), asyncHandler(controller.submit));

  return router;
}
