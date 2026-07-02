import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import type { FeedbackService } from "./feedback.service.js";
import type { SubmitFeedbackInput } from "./feedback.validation.js";

export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.feedbackService.submit(req.body as SubmitFeedbackInput);
    sendSuccess(res, {}, "Thank you for your feedback! It means the world to us. 🙏");
  };

  stats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.feedbackService.stats();
    sendSuccess(res, stats);
  };
}
