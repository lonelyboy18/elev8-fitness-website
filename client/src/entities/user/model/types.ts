import type { PlanId } from "@shared/constants/plans";

export type SubscriptionStatus = "inactive" | "active" | "expired";

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpires: string | null;
  memberSince: string;
}

export interface AuthSummary {
  name: string;
  plan: PlanId;
}
