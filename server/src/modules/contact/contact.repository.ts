import { prisma } from "../../db/prismaClient.js";
import type { ContactRecord } from "../../db/types.js";

export interface CreateContactInput {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export interface IContactRepository {
  create(input: CreateContactInput): Promise<ContactRecord>;
}

/** Prisma-backed contact-submissions store — swaps in for InMemoryContactRepository with an identical interface. */
export class PrismaContactRepository implements IContactRepository {
  async create(input: CreateContactInput): Promise<ContactRecord> {
    const row = await prisma.contact.create({
      data: { name: input.name, email: input.email, phone: input.phone, message: input.message },
    });
    return { ...row, createdAt: row.createdAt.toISOString() };
  }
}
