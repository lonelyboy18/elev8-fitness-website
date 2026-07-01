import { useState, type FormEvent } from "react";
import { contactApi } from "@entities/contact/api/contactApi";
import { isValidMobile } from "@shared/lib/validators";
import { useToast } from "@shared/hooks/useToast";
import { FloatingField } from "@shared/ui/FloatingField";
import { SubmitButton } from "@shared/ui/SubmitButton";

const MESSAGE_MAX = 500;

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

/** Maps server field-error keys (ct-name, ct-email, ...) to our local error state keys. */
function mapServerErrors(errors: Record<string, string>): FieldErrors {
  const next: FieldErrors = {};
  if (errors["ct-name"]) next.name = errors["ct-name"];
  if (errors["ct-email"]) next.email = errors["ct-email"];
  if (errors["ct-phone"]) next.phone = errors["ct-phone"];
  if (errors["ct-message"]) next.message = errors["ct-message"];
  return next;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (phone.trim() && !isValidMobile(phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!message.trim()) nextErrors.message = "Message is required.";
    return nextErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await contactApi.submit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      if (result.success) {
        showToast("Message sent! We'll get back to you soon.", "success", 5000);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setErrors({});
      } else if (result.errors) {
        setErrors(mapServerErrors(result.errors));
      } else {
        showToast(result.message || "Could not send message. Please try again.", "error");
      }
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const messageLen = message.length;
  const counterClassName = `char-counter${
    messageLen >= MESSAGE_MAX ? " at-limit" : messageLen >= MESSAGE_MAX * 0.8 ? " near-limit" : ""
  }`;

  return (
    <form id="contactForm" noValidate autoComplete="on" onSubmit={handleSubmit}>
      <FloatingField
        id="ct-name"
        name="name"
        type="text"
        label="Your Name"
        maxLength={120}
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <FloatingField
        id="ct-email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <FloatingField
        id="ct-phone"
        name="phone"
        type="tel"
        label="Phone / WhatsApp (optional)"
        maxLength={15}
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
      <div className={`elev8-field${errors.message ? " has-error" : ""}`}>
        <textarea
          id="ct-message"
          name="message"
          placeholder=" "
          rows={5}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <label htmlFor="ct-message">Your Message</label>
        <span className="field-err" id="ct-messageErr" role="alert">
          {errors.message}
        </span>
        <span className={counterClassName} id="ct-messageCount" aria-live="polite">
          {messageLen}/{MESSAGE_MAX}
        </span>
      </div>
      <SubmitButton id="ctSubmitBtn" className="btn btn-success w-100" loading={submitting}>
        Send Message
      </SubmitButton>
    </form>
  );
}
