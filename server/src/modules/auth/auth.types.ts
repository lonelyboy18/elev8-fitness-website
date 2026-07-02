import type { PlanId } from "../../config/constants.js";

export type UserRole = "member";

export interface AuthenticatedUser {
  id: number;
  name: string;
  plan: PlanId;
  role: UserRole;
}

export interface AccessTokenPayload {
  sub: number;
  name: string;
  plan: PlanId;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
  familyId: string;
}
