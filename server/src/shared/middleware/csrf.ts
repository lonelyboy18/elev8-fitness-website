import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../../config/env.js";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/** Double-submit CSRF cookie. Ensures every client has a readable token to echo back in headers. */
export function ensureCsrfCookie(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: env.COOKIE_SECURE,
      sameSite: "strict",
      path: "/",
    });
    req.cookies[CSRF_COOKIE] = token;
  }
  next();
}

/** Validates the X-CSRF-Token header against the cookie. Apply to every state-mutating route. */
export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new AppError(403, "Security token mismatch. Please refresh the page and try again."));
    return;
  }
  next();
}
