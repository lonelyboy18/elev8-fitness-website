import type { PlanId } from "../../config/constants.js";
import type { UserRecord } from "../../db/types.js";
import { prisma } from "../../db/prismaClient.js";
import type { TransactionClient } from "../../db/transaction.js";
import type { PrismaClient, User as UserRow } from "../../generated/prisma/client.js";

type Db = PrismaClient | TransactionClient;

export interface CreateUserInput {
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  plan: PlanId;
}

export interface IUsersRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: number): Promise<UserRecord | null>;
  create(input: CreateUserInput): Promise<UserRecord>;
  updateProfile(id: number, name: string, mobile: string): Promise<void>;
  updatePasswordHash(id: number, passwordHash: string): Promise<void>;
  activateSubscription(id: number, plan: PlanId, expiresAt: string): Promise<void>;
  delete(id: number): Promise<void>;
}

function toDateOnly(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function toRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    passwordHash: row.passwordHash,
    plan: row.plan,
    program: row.program,
    subscriptionStatus: row.subscriptionStatus,
    subscriptionExpires: toDateOnly(row.subscriptionExpires),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Prisma-backed users store — swaps in for InMemoryUsersRepository with an identical interface. */
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly client: Db = prisma) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.client.user.findUnique({ where: { email } });
    return row ? toRecord(row) : null;
  }

  async findById(id: number): Promise<UserRecord | null> {
    const row = await this.client.user.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const row = await this.client.user.create({
      data: {
        name: input.name,
        email: input.email,
        mobile: input.mobile,
        passwordHash: input.passwordHash,
        plan: input.plan,
      },
    });
    return toRecord(row);
  }

  async updateProfile(id: number, name: string, mobile: string): Promise<void> {
    await this.client.user.update({
      where: { id },
      data: { name, ...(mobile ? { mobile } : {}) },
    });
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    await this.client.user.update({ where: { id }, data: { passwordHash } });
  }

  async activateSubscription(id: number, plan: PlanId, expiresAt: string): Promise<void> {
    await this.client.user.update({
      where: { id },
      data: { plan, subscriptionStatus: "active", subscriptionExpires: new Date(expiresAt) },
    });
  }

  async delete(id: number): Promise<void> {
    // Cascades to refresh_tokens, bookings, and payments via onDelete: Cascade in schema.prisma.
    await this.client.user.delete({ where: { id } });
  }
}

/** Scopes the repository to a transaction client — used when a service must write across repositories atomically. */
export function usersRepositoryFor(tx: TransactionClient): IUsersRepository {
  return new PrismaUsersRepository(tx);
}
