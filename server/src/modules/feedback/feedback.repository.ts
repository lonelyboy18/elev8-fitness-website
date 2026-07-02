import { prisma } from "../../db/prismaClient.js";
import type { SubmissionRecord } from "../../db/types.js";

export interface CreateSubmissionInput {
  name: string;
  email: string;
  feedback: string;
  rating: number;
}

export interface IFeedbackRepository {
  create(input: CreateSubmissionInput): Promise<SubmissionRecord>;
  stats(): Promise<{ average: number; count: number }>;
}

/** Prisma-backed feedback store — swaps in for InMemoryFeedbackRepository with an identical interface. */
export class PrismaFeedbackRepository implements IFeedbackRepository {
  async create(input: CreateSubmissionInput): Promise<SubmissionRecord> {
    const row = await prisma.feedbackSubmission.create({
      data: { name: input.name, email: input.email, feedback: input.feedback, rating: input.rating },
    });
    return { ...row, createdAt: row.createdAt.toISOString() };
  }

  async stats(): Promise<{ average: number; count: number }> {
    const result = await prisma.feedbackSubmission.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
    });

    const count = result._count._all;
    const average = count > 0 && result._avg.rating !== null ? Math.round(result._avg.rating * 10) / 10 : 0;
    return { average, count };
  }
}
