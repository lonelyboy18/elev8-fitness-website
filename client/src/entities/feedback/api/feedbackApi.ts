import { httpClient } from "@shared/api/httpClient";
import type { FeedbackStats, SubmitFeedbackPayload } from "../model/types";

export const feedbackApi = {
  stats: () => httpClient.get<FeedbackStats>("/feedback/stats"),
  submit: (payload: SubmitFeedbackPayload) => httpClient.post<Record<string, never>>("/feedback", payload),
};
