import { z } from "zod";
import { ALLOWED_PLANS } from "../../config/constants.js";
import { isValidMobile } from "../../shared/utils/mobile.js";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Full name is required.").max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required.")
    .refine(isValidMobile, "Enter a valid 10-digit Indian mobile number (e.g. 98765 43210)."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .max(255, "Password is too long."),
  plan: z.enum(ALLOWED_PLANS, { errorMap: () => ({ message: "Please select a program (BFT or CST)." }) }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
