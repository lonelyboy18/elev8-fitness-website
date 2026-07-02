import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { checkDatabaseConnection, disconnectPrisma } from "./db/prismaClient.js";

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
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal error during startup");
  process.exit(1);
});
