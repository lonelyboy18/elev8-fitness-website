import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { SignInForm } from "@features/auth/sign-in/ui/SignInForm";

export function SignInPage() {
  useDocumentTitle("Sign In — ELEV8");

  return (
    <div className="auth-card">
      <div className="glass-card">
        <div className="auth-header">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Welcome Back
          </span>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Continue your calisthenics journey.</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
