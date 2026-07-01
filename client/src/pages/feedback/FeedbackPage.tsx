import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { FeedbackForm } from "@features/feedback/ui/FeedbackForm";
import { LiveRatingStats } from "@features/feedback/ui/LiveRatingStats";
import { useRatingStats } from "@features/feedback/model/useRatingStats";

export function FeedbackPage() {
  useDocumentTitle("Feedback — ELEV8");

  const { avgText, countText, reload } = useRatingStats();

  return (
    <div className="auth-container" style={{ minHeight: "100vh", paddingTop: 110, paddingBottom: 60 }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="glass-card">
          <div className="auth-header">
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Your Voice Matters
            </span>
            <h1 className="auth-title">Give Us Feedback</h1>
            <p className="auth-sub">Help us keep improving for the ELEV8 community.</p>
          </div>

          <LiveRatingStats avgText={avgText} countText={countText} />

          <FeedbackForm onSubmitted={reload} />
        </div>
      </div>
    </div>
  );
}
