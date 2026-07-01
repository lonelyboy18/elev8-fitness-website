import { useState } from "react";

const STARS = [
  { value: 1, emoji: "😢", label: "1 star" },
  { value: 2, emoji: "😞", label: "2 stars" },
  { value: 3, emoji: "😐", label: "3 stars" },
  { value: 4, emoji: "😊", label: "4 stars" },
  { value: 5, emoji: "😄", label: "5 stars" },
] as const;

const MESSAGES: Record<number, string> = {
  1: "😢  Very Bad — we're sorry to hear that!",
  2: "😞  Poor — please tell us how we can improve.",
  3: "😐  Average — what can we do better?",
  4: "😊  Good — great to hear!",
  5: "😄  Excellent — thank you so much!",
};

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

/** Mirrors js/pages/feedback.js `initStarRating()` — emoji star widget with hover preview + click-to-select. */
export function StarRating({ value, onChange, error }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="elev8-field" style={{ border: "none", padding: 0 }}>
      <p className="plan-field-label" style={{ marginBottom: "0.8rem" }}>
        Rate Your Experience
      </p>
      <div
        className="star-rating"
        id="starRating"
        role="radiogroup"
        aria-label="Rating"
        onMouseLeave={() => setHovered(0)}
      >
        {STARS.map((star) => (
          <span
            key={star.value}
            className={`star${star.value <= value ? " active" : ""}`}
            data-value={star.value}
            role="radio"
            aria-label={star.label}
            aria-checked={star.value === value}
            tabIndex={0}
            style={{
              filter: star.value <= active ? "grayscale(0%) opacity(1)" : "grayscale(100%) opacity(0.45)",
            }}
            onMouseEnter={() => setHovered(star.value)}
            onClick={() => onChange(star.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(star.value);
              }
            }}
          >
            {star.emoji}
          </span>
        ))}
      </div>
      <div className="rating-feedback" id="ratingFeedback" aria-live="polite" style={{ display: value ? "block" : "none" }}>
        {value ? MESSAGES[value] : ""}
      </div>
      <input type="hidden" id="ratingValue" name="rating" value={value || ""} readOnly />
      <span className="field-err" id="fb-ratingErr" role="alert">
        {error}
      </span>
    </div>
  );
}
