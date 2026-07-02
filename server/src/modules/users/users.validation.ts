import { z } from "zod";
import { isValidMobile } from "../../shared/utils/mobile.js";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
  mobile: z
    .string()
    .trim()
    .refine((v) => v === "" || isValidMobile(v), "Enter a valid 10-digit Indian mobile number."),
});

export const deleteAccountSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  confirm: z.boolean().refine((v) => v === true, "Please tick the confirmation checkbox."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
