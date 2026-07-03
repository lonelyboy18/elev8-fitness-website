import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import type { Response } from "express";
import { env } from "../../config/env.js";
import type { AccessTokenPayload, AuthenticatedUser, RefreshTokenPayload } from "./auth.types.js";

const ACCESS_TOKEN_TTL_SEC = env.ACCESS_TOKEN_TTL_MIN * 60;
const REFRESH_TOKEN_TTL_SEC = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_PATH = "/api/auth";

export function signAccessToken(user: AuthenticatedUser): string {
  const payload: AccessTokenPayload = { sub: user.id, name: user.name, plan: user.plan, role: user.role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SEC });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
}

export function signRefreshToken(userId: number, jti: string, familyId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, jti, familyId };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SEC });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload;
}

export function newJti(): string {
  return uuid();
}

export function refreshTokenExpiryIso(): string {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000).toISOString();
}

function baseCookieOptions() {
  // COOKIE_SECURE is the single source of truth for the Secure flag — it must be true
  // whenever the app is actually reached over HTTPS (directly or behind a TLS-terminating
  // proxy/load balancer). It is intentionally NOT auto-forced by NODE_ENV: a "production
  // mode" deployment can still legitimately run over plain HTTP for internal rehearsal
  // (e.g. this project's own docker-compose.yml with no TLS in front) — see env.ts's
  // startup warning for the case where this looks misconfigured.
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "strict" as const,
  };
}

export function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseCookieOptions(),
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SEC * 1000,
  });
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_SEC * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
}
