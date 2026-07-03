import { useState, type FormEvent } from "react";
import { feedbackApi } from "@entities/feedback/api/feedbackApi";
import { isValidEmail } from "@shared/lib/validators";
import { useToast } from "@shared/hooks/useToast";
import { FloatingField } from "@shared/ui/FloatingField";
import { SubmitButton } from "@shared/ui/SubmitButton";
import { StarRating } from "./StarRating";

type FieldErrors = Partial<Record<"name" | "email" | "rating" | "feedback", string>>;

interface FeedbackFormProps {
  onSubmitted?: () => void;
}

/** Mirrors js/pages/feedback.js `initFeedbackForm()` submit handler + validation rules from submit_feedback.php. */
export function FeedbackForm({ onSubmitted }: FeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedFeedback = feedback.trim();

    if (!trimmedName) {
      nextErrors.name = "Your name is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!rating || rating < 1 || rating > 5) {
      nextErrors.rating = "Please rate your experience.";
    }
    if (!trimmedFeedback) {
      nextErrors.feedback = "Please write your feedback.";
    } else if (trimmedFeedback.length < 10) {
      nextErrors.feedback = "Feedback must be at least 10 characters.";
    }
    return nextErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await feedbackApi.submit({
        name: name.trim(),
        email: email.trim(),
        rating,
        feedback: feedback.trim(),
      });

      if (result.success) {
        showToast(result.message ?? "Thank you for your feedback! It means the world to us. 🙏", "success", 5000);
        setName("");
        setEmail("");
        setRating(0);
        setFeedback("");
        setErrors({});
        onSubmitted?.();
      } else if (result.errors) {
        setErrors(result.errors as FieldErrors);
      } else {
        showToast(result.message || "Submission failed. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="feedbackForm" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FloatingField
        id="fb-name"
        name="name"
        type="text"
        label="Your Name"
        maxLength={120}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <FloatingField
        id="fb-email"
        name="email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <StarRating value={rating} onChange={setRating} error={errors.rating} />

      <FloatingField
        id="fb-feedback"
        as="textarea"
        label="Your Feedback"
        rows={4}
        maxLength={5000}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        error={errors.feedback}
      />

      <SubmitButton id="feedbackBtn" className="btn btn-success w-100 mt-1" loading={submitting}>
        Submit Feedback
      </SubmitButton>
    </form>
  );
}
