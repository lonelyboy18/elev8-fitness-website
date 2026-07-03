import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userApi } from "@entities/user/api/userApi";
import { useInvalidateSession } from "@features/auth/session/useSession";
import { usePasswordStrengthMeter } from "../model/usePasswordStrengthMeter";
import { isValidEmail, isValidMobile } from "@shared/lib/validators";
import { useToast } from "@shared/hooks/useToast";
import { FloatingField } from "@shared/ui/FloatingField";
import { SubmitButton } from "@shared/ui/SubmitButton";
import { TransitionLink } from "@shared/ui/TransitionLink";
import { ROUTES } from "@shared/constants/routes";
import type { PlanId } from "@shared/constants/plans";
import type { RegistrationDetails } from "@shared/lib/whatsapp";
import { ChooseCoachModal } from "./ChooseCoachModal";

type FieldErrors = Partial<Record<"name" | "email" | "mobile" | "password" | "plan", string>>;

export function SignUpForm() {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<PlanId | "">(initialPlan === "bft" || initialPlan === "cst" ? initialPlan : "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState<RegistrationDetails | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>(ROUTES.home);
  const { showToast } = useToast();
  const invalidateSession = useInvalidateSession();
  const navigate = useNavigate();
  const strength = usePasswordStrengthMeter(password);

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Full name is required.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!mobile) nextErrors.mobile = "Mobile number is required.";
    else if (!isValidMobile(mobile)) nextErrors.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!plan) nextErrors.plan = "Please choose a program.";
    return nextErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await userApi.register({ name, email, mobile, password, plan: plan as PlanId });
      if (result.success) {
        showToast(result.message ?? "Welcome to ELEV8!", "success", 3000);
        invalidateSession();
        setRedirectTo(result.data.redirect || ROUTES.home);
        setRegistered({ name, email, mobile, program: (plan as PlanId).toUpperCase() });
      } else if (result.errors) {
        setErrors(result.errors as FieldErrors);
      } else {
        showToast(result.message || "Registration failed. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <form id="signupForm" noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FloatingField
        id="su-name"
        name="name"
        type="text"
        label="Full Name"
        autoComplete="name"
        maxLength={120}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <FloatingField
        id="su-email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <FloatingField
        id="su-mobile"
        name="mobile"
        type="tel"
        label="Mobile Number (10 digits)"
        autoComplete="tel"
        maxLength={10}
        inputMode="numeric"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        error={errors.mobile}
      />

      <div className={`elev8-field${errors.password ? " has-error" : ""}`}>
        <input
          type="password"
          id="su-password"
          name="password"
          placeholder=" "
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="su-password">Password (min. 8 characters)</label>
        <div className="strength-track" aria-hidden="true">
          <div className={strength.barClassName} id="strengthBar"></div>
        </div>
        <span className="strength-label" id="strengthLabel" aria-live="polite">
          {strength.label}
        </span>
        <span className="field-err" id="su-passwordErr" role="alert">
          {errors.password}
        </span>
      </div>

      <div className="elev8-field plan-field">
        <p className="plan-field-label">Choose Your Program</p>
        <div className="plan-grid">
          <label className="plan-card">
            <input type="radio" name="plan" value="bft" checked={plan === "bft"} onChange={() => setPlan("bft")} />
            <span className="plan-content">
              <strong className="plan-abbr">BFT</strong>
              <span className="plan-name">Bodyweight Functional Training</span>
              <span className="plan-price">from ₹2,100&thinsp;/&thinsp;mo</span>
            </span>
          </label>
          <label className="plan-card">
            <input type="radio" name="plan" value="cst" checked={plan === "cst"} onChange={() => setPlan("cst")} />
            <span className="plan-content">
              <strong className="plan-abbr">CST</strong>
              <span className="plan-name">Calisthenics Skill Training</span>
              <span className="plan-price">from ₹2,300&thinsp;/&thinsp;mo</span>
            </span>
          </label>
        </div>
        <span className="field-err" id="su-planErr" role="alert">
          {errors.plan}
        </span>
      </div>

      <SubmitButton id="signupBtn" className="btn btn-success w-100 mt-1" loading={submitting}>
        Create Account
      </SubmitButton>

      <p className="auth-switch">
        Already a member? <TransitionLink to={ROUTES.signIn}>Sign in</TransitionLink>
      </p>
    </form>

    <ChooseCoachModal details={registered} onClosed={() => navigate(redirectTo)} />
    </>
  );
}
