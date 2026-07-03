import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import type { HealthController } from "./health.controller.js";

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();

  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Liveness probe — is the process up?
   *     description: Cheap, no external dependency (does not touch the database). Excluded from request logging.
   *     responses:
   *       200:
   *         description: Process is running.
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
   *                         status: { type: string, example: ok }
   *                         version: { type: string, example: "1.0.0" }
   *                         uptimeSeconds: { type: integer }
   */
  router.get("/health", controller.live);

  /**
   * @openapi
   * /ready:
   *   get:
   *     tags: [Health]
   *     summary: Readiness probe — can this instance serve traffic?
   *     description: Confirms the database is actually reachable via SELECT 1. Used by Docker Compose/orchestrator health checks.
   *     responses:
   *       200:
   *         description: Ready — database reachable.
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
   *                         status: { type: string, example: ok }
   *                         environment: { type: string, example: production }
   *                         database: { type: string, example: connected }
   *       503:
   *         description: Not ready — database unreachable.
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
   */
  router.get("/ready", asyncHandler(controller.ready));

  return router;
}
