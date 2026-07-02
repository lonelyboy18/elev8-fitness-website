import { z } from "zod";
import { isValidMobile } from "../../shared/utils/mobile.js";

export const submitContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  phone: z.string().trim().refine((v) => v === "" || isValidMobile(v), "Enter a valid 10-digit Indian mobile number."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .min(10, "Message must be at least 10 characters.")
    .max(3000, "Message must be under 3000 characters."),
});

/** Legacy PHP kept `ct-*` prefixed field-error keys; ContactForm.tsx still maps against them. */
export const submitContactErrorKeyMap = {
  name: "ct-name",
  email: "ct-email",
  phone: "ct-phone",
  message: "ct-message",
};

export type SubmitContactInput = z.infer<typeof submitContactSchema>;
