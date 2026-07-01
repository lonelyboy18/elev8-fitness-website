import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "@entities/user/api/userApi";
import { useInvalidateSession } from "@features/auth/session/useSession";
import { isValidEmail } from "@shared/lib/validators";
import { useToast } from "@shared/hooks/useToast";
import { FloatingField } from "@shared/ui/FloatingField";
import { SubmitButton } from "@shared/ui/SubmitButton";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const invalidateSession = useInvalidateSession();
  const navigate = useNavigate();

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    else if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    return nextErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await userApi.login({ email, password });
      if (result.success) {
        showToast(result.message ?? "Welcome back!", "success", 2500);
        invalidateSession();
        setTimeout(() => navigate(result.data.redirect || ROUTES.home), 1200);
      } else if (result.errors) {
        setErrors(result.errors as FieldErrors);
      } else {
        showToast(result.message || "Sign-in failed. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="signinForm" noValidate autoComplete="on" onSubmit={handleSubmit}>
      <FloatingField
        id="si-email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <FloatingField
        id="si-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <div className="auth-meta">
        <a
          href="#"
          className="forgot-link"
          onClick={(e) => {
            e.preventDefault();
            showToast("Password reset coming soon — contact us on WhatsApp.", "info");
          }}
        >
          Forgot password?
        </a>
      </div>

      <SubmitButton id="signinBtn" className="btn btn-success w-100 mt-1" loading={submitting}>
        Sign In
      </SubmitButton>

      <p className="auth-switch">
        New to ELEV8? <TransitionLink to={ROUTES.signUp}>Create an account</TransitionLink>
      </p>

      <p className="auth-switch" style={{ marginTop: 0 }}>
        <TransitionLink to={ROUTES.deleteAccount} className="text-danger" style={{ fontSize: "0.82rem" }}>
          Delete my account
        </TransitionLink>
      </p>
    </form>
  );
}
