import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { checkDatabaseConnection } from "../../db/prismaClient.js";

const packageJsonPath = fileURLToPath(new URL("../../../package.json", import.meta.url));
const { version } = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as { version: string };

const startedAt = Date.now();

export class HealthController {
  /** Liveness — process is up. No external dependency, must stay cheap/fast. */
  live = (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: { status: "ok", version, uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) },
    });
  };

  /** Readiness — can this instance actually serve traffic (DB reachable, env loaded)? */
  ready = async (_req: Request, res: Response): Promise<void> => {
    const databaseConnected = await checkDatabaseConnection();
    res.status(databaseConnected ? 200 : 503).json({
      success: databaseConnected,
      data: {
        status: databaseConnected ? "ok" : "unavailable",
        environment: env.NODE_ENV,
        database: databaseConnected ? "connected" : "unreachable",
      },
    });
  };
}
