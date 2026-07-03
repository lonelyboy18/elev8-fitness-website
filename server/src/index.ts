import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { checkDatabaseConnection, disconnectPrisma } from "./db/prismaClient.js";

const FORCED_SHUTDOWN_TIMEOUT_MS = 10_000;

async function main() {
  const connected = await checkDatabaseConnection();
  if (!connected) {
    logger.fatal("Could not connect to PostgreSQL. Check DATABASE_URL and that the database is reachable.");
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`ELEV8 API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  async function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down.`);

    // If a lingering connection ever keeps server.close()'s callback from firing, force
    // the exit anyway — an orchestrator's SIGTERM has a fixed grace period before SIGKILL,
    // and a hung process here would mean an unclean container kill instead of this planned,
    // logged shutdown.
    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timed out; forcing exit.");
      process.exit(1);
    }, FORCED_SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(async () => {
      await disconnectPrisma();
      clearTimeout(forceExit);
      process.exit(0);
    });
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // A rejection/exception here means something escaped asyncHandler's error forwarding
  // (or fired outside the request lifecycle entirely) — log it with full context rather
  // than letting Node's default handler print a bare stack trace with no structure, then
  // exit so an orchestrator restarts the process into a known-good state.
  process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason }, "Unhandled promise rejection");
    process.exit(1);
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal error during startup");
  process.exit(1);
});
