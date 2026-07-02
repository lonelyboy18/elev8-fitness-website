import type { PlanId, TimeSlot } from "../config/constants.js";

/**
 * Domain records mirror the legacy MySQL schema (Elev8/config/database.php) so a Prisma-backed
 * repository can replace the in-memory one in Phase 4 without changing any service code.
 */

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  plan: PlanId;
  subscriptionStatus: "inactive" | "active" | "expired";
  subscriptionExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface BookingRecord {
  id: number;
  userId: number;
  classType: PlanId;
  classDate: string;
  timeSlot: TimeSlot;
  status: BookingStatus;
  createdAt: string;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface PaymentRecord {
  id: number;
  userId: number;
  plan: PlanId;
  durationMonths: number;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface SubmissionRecord {
  id: number;
  name: string;
  email: string;
  feedback: string;
  rating: number;
  createdAt: string;
}

export interface ContactRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
}

export interface RefreshTokenRecord {
  jti: string;
  userId: number;
  familyId: string;
  revokedAt: string | null;
  replacedByJti: string | null;
  expiresAt: string;
  createdAt: string;
}
