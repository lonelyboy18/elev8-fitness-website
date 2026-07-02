import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { ACCESS_COOKIE, verifyAccessToken } from "../../modules/auth/token.service.js";
import type { AuthenticatedUser, UserRole } from "../../modules/auth/auth.types.js";

/** Verifies the access-token cookie and attaches req.user. Frontend retries once via /auth/refresh on 401. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    next(AppError.unauthorized());
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user: AuthenticatedUser = { id: payload.sub, name: payload.name, plan: payload.plan, role: payload.role };
    req.user = user;
    next();
  } catch {
    next(AppError.unauthorized("Session expired. Please sign in again."));
  }
}

/** Role-ready authorization guard — single "member" role today, extensible without touching routes. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden("You do not have permission to perform this action."));
      return;
    }
    next();
  };
}
