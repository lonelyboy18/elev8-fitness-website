import { prisma } from "../src/db/prismaClient.js";

/**
 * Truncates every table between tests. `users` cascades to bookings, payments, and
 * refresh_tokens via the FK ON DELETE CASCADE defined in schema.prisma.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "users", "feedback_submissions", "contacts" RESTART IDENTITY CASCADE'
  );
}
