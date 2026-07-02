import { z } from "zod";

export const submitFeedbackSchema = z.object({
  name: z.string().trim().min(1, "Your name is required.").max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  rating: z.coerce
    .number({ invalid_type_error: "Please rate your experience (1–5)." })
    .int()
    .min(1, "Please rate your experience (1–5).")
    .max(5, "Please rate your experience (1–5)."),
  feedback: z
    .string()
    .trim()
    .min(1, "Please write your feedback.")
    .min(10, "Feedback must be at least 10 characters.")
    .max(5000, "Feedback must be 5,000 characters or fewer."),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
