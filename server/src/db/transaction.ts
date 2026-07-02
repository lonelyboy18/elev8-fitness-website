import { prisma } from "./prismaClient.js";
import { Prisma } from "../generated/prisma/client.js";
import type { TransactionClient } from "../generated/prisma/internal/prismaNamespace.js";

export type { TransactionClient };

interface TransactionOptions {
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * Reusable wrapper around prisma.$transaction for multi-write operations that must
 * commit or roll back together (e.g. booking capacity check + insert, payment
 * verification + subscription activation, refresh-token rotation).
 */
export function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  return prisma.$transaction(fn, options);
}
