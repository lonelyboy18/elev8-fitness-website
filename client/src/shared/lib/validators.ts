export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidMobile(mobile: string): boolean {
  let cleaned = mobile.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.slice(0, 2) === "91") {
    cleaned = cleaned.slice(2);
  }
  return /^[6-9]\d{9}$/.test(cleaned);
}

export interface PasswordStrength {
  score: number;
  label: string;
  cls: string;
}

const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const STRENGTH_CLASSES = ["", "very-weak", "weak", "fair", "strong", "very-strong"];

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return {
    score,
    label: STRENGTH_LABELS[score] || "",
    cls: STRENGTH_CLASSES[score] || "",
  };
}
