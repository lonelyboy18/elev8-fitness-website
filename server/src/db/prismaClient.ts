import { PrismaPg } from "@prisma/adapter-pg";
import { env, isProduction } from "../config/env.js";
import { logger } from "../config/logger.js";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: isProduction ? ["error", "warn"] : ["warn", "error"],
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "db.connection_check_failed");
    return false;
  }
}
