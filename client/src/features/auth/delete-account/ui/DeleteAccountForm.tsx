import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "@entities/user/api/userApi";
import { isValidEmail } from "@shared/lib/validators";
import { useToast } from "@shared/hooks/useToast";
import { FloatingField } from "@shared/ui/FloatingField";
import { SubmitButton } from "@shared/ui/SubmitButton";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";

type FieldErrors = Partial<Record<"email" | "password" | "confirm", string>>;

export function DeleteAccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    else if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirm) nextErrors.confirm = "Please confirm you understand this action.";
    return nextErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await userApi.deleteAccount({ email, password, confirm });
      if (result.success) {
        showToast(result.message ?? "Account deleted.", "info", 4000);
        setTimeout(() => navigate(result.data.redirect || ROUTES.home), 2000);
      } else if (result.errors) {
        setErrors(result.errors as FieldErrors);
      } else {
        showToast(result.message || "Could not delete account. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="deleteAccountForm" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FloatingField
        id="da-email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <FloatingField
        id="da-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <div className="elev8-check">
        <input
          type="checkbox"
          id="da-confirm"
          name="confirm"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        <label htmlFor="da-confirm">
          I understand this will permanently delete my account and all my data.
        </label>
      </div>
      <span
        className="field-err"
        id="da-confirmErr"
        role="alert"
        style={{ marginTop: "-0.6rem", display: "block", marginBottom: "1rem" }}
      >
        {errors.confirm}
      </span>

      <SubmitButton id="deleteBtn" className="btn btn-danger w-100 mt-1" loading={submitting}>
        Permanently Delete Account
      </SubmitButton>

      <p className="auth-switch mt-3">
        Changed your mind? <TransitionLink to={ROUTES.signIn}>Go back to Sign In</TransitionLink>
      </p>
    </form>
  );
}
