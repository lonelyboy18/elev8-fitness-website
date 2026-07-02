import { cleanText } from "../../shared/utils/text.js";
import type { IFeedbackRepository } from "./feedback.repository.js";
import type { FeedbackStatsDto } from "./feedback.types.js";
import type { SubmitFeedbackInput } from "./feedback.validation.js";

export class FeedbackService {
  constructor(private readonly feedbackRepo: IFeedbackRepository) {}

  async submit(input: SubmitFeedbackInput): Promise<void> {
    await this.feedbackRepo.create({
      name: cleanText(input.name),
      email: input.email,
      feedback: cleanText(input.feedback),
      rating: input.rating,
    });
  }

  async stats(): Promise<FeedbackStatsDto> {
    return this.feedbackRepo.stats();
  }
}
