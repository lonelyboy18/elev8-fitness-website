export interface FeedbackStats {
  average: number;
  count: number;
}

export interface SubmitFeedbackPayload {
  name: string;
  email: string;
  rating: number;
  feedback: string;
}
