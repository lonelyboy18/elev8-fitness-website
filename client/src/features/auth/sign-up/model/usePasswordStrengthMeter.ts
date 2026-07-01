import { useMemo } from "react";
import { checkPasswordStrength } from "@shared/lib/validators";

/** Drives the sign-up password strength bar/label — mirrors js/core/core.js `initPasswordStrength()`. */
export function usePasswordStrengthMeter(password: string) {
  return useMemo(() => {
    if (!password) return { barClassName: "strength-bar", label: "" };
    const { label, cls } = checkPasswordStrength(password);
    return { barClassName: `strength-bar${cls ? ` ${cls}` : ""}`, label };
  }, [password]);
}
