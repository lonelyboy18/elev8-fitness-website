import type { PlanId } from "../../config/constants.js";

/** Matches client/src/entities/user/model/types.ts `User` (camelCase, unlike bookings/payments). */
export interface UserProfileDto {
  id: number;
  name: string;
  email: string;
  mobile: string;
  plan: PlanId;
  subscriptionStatus: "inactive" | "active" | "expired";
  subscriptionExpires: string | null;
  memberSince: string;
}

/** Matches client's `AuthSummary` — the compact user payload on register/login. */
export interface AuthSummaryDto {
  name: string;
  plan: PlanId;
}
