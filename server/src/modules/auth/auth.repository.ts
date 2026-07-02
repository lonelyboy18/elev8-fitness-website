import type { RefreshTokenRecord } from "../../db/types.js";
import { hashTokenId } from "../../db/tokenHash.js";
import { prisma } from "../../db/prismaClient.js";
import { withTransaction, type TransactionClient } from "../../db/transaction.js";
import type { PrismaClient, RefreshToken as RefreshTokenRow } from "../../generated/prisma/client.js";

type Db = PrismaClient | TransactionClient;

export interface IRefreshTokenRepository {
  create(record: RefreshTokenRecord): Promise<void>;
  findByJti(jti: string): Promise<RefreshTokenRecord | null>;
  revoke(jti: string, replacedByJti: string | null): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
  /** Atomically revokes the old token and inserts its replacement — a single commit or none. */
  rotate(oldJti: string, replacement: RefreshTokenRecord): Promise<void>;
}

function toRecord(row: RefreshTokenRow, jti: string): RefreshTokenRecord {
  return {
    jti,
    userId: row.userId,
    familyId: row.familyId,
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    replacedByJti: row.replacedByHash,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Prisma-backed refresh-token store. jti is never persisted — only its HMAC hash (see tokenHash.ts). */
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly client: Db = prisma) {}

  async create(record: RefreshTokenRecord): Promise<void> {
    await this.client.refreshToken.create({
      data: {
        tokenHash: hashTokenId(record.jti),
        userId: record.userId,
        familyId: record.familyId,
        expiresAt: new Date(record.expiresAt),
      },
    });
  }

  async findByJti(jti: string): Promise<RefreshTokenRecord | null> {
    const row = await this.client.refreshToken.findUnique({ where: { tokenHash: hashTokenId(jti) } });
    return row ? toRecord(row, jti) : null;
  }

  async revoke(jti: string, replacedByJti: string | null): Promise<void> {
    await this.client.refreshToken.updateMany({
      where: { tokenHash: hashTokenId(jti) },
      data: {
        revokedAt: new Date(),
        replacedByHash: replacedByJti ? hashTokenId(replacedByJti) : null,
      },
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.client.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.client.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async rotate(oldJti: string, replacement: RefreshTokenRecord): Promise<void> {
    // Only meaningful on the top-level client — nesting a transaction inside a transaction
    // client isn't supported, and rotate() is never called from within another transaction.
    await withTransaction(async (tx) => {
      const scoped = new PrismaRefreshTokenRepository(tx);
      await scoped.create(replacement);
      await scoped.revoke(oldJti, replacement.jti);
    });
  }
}
