import { httpClient } from "@shared/api/httpClient";
import type { PlanId } from "@shared/constants/plans";
import type { AuthSummary, User } from "../model/types";

export interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  plan: PlanId;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
  mobile: string;
}

export interface DeleteAccountPayload {
  email: string;
  password: string;
  confirm: boolean;
}

interface AuthResponse {
  user: AuthSummary;
  redirect: string;
}

export const userApi = {
  me: () => httpClient.get<{ user: User }>("/auth/me"),
  register: (payload: RegisterPayload) => httpClient.post<AuthResponse>("/auth/register", payload),
  login: (payload: LoginPayload) => httpClient.post<AuthResponse>("/auth/login", payload),
  logout: () => httpClient.post<{ redirect: string }>("/auth/logout"),
  updateProfile: (payload: UpdateProfilePayload) => httpClient.patch<{ name: string }>("/users/me", payload),
  deleteAccount: (payload: DeleteAccountPayload) => httpClient.delete<{ redirect: string }>("/users/me", payload),
};
