import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { SignUpForm } from "@features/auth/sign-up/ui/SignUpForm";

export function SignUpPage() {
  useDocumentTitle("Join ELEV8 — Create Account");

  return (
    <div className="auth-card">
      <div className="glass-card">
        <div className="auth-header">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Begin Your Journey
          </span>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join Goa&rsquo;s premium calisthenics studio.</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
