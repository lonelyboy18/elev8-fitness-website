import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../shared/errors/AppError.js";
import { hashPassword, verifyPassword, verifyPasswordAgainstDummy } from "../../shared/utils/password.js";
import { cleanMobile } from "../../shared/utils/mobile.js";
import { cleanText } from "../../shared/utils/text.js";
import { logger } from "../../config/logger.js";
import type { UserRecord } from "../../db/types.js";
import type { IUsersRepository } from "../users/users.repository.js";
import type { AuthSummaryDto } from "../users/users.types.js";
import type { IRefreshTokenRepository } from "./auth.repository.js";
import { newJti, refreshTokenExpiryIso, signAccessToken, signRefreshToken, verifyRefreshToken } from "./token.service.js";
import type { AuthenticatedUser } from "./auth.types.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthSummaryDto;
}

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly usersRepo: IUsersRepository,
    private readonly refreshRepo: IRefreshTokenRepository
  ) {}

  async register(input: RegisterInput): Promise<SessionTokens> {
    const existing = await this.usersRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.validation({ email: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(input.password);

    let user: UserRecord;
    try {
      user = await this.usersRepo.create({
        name: cleanText(input.name),
        email: input.email,
        mobile: cleanMobile(input.mobile),
        passwordHash,
        plan: input.plan,
      });
    } catch (err) {
      // The check above is a TOCTOU race: two concurrent registrations for the same email
      // can both pass findByEmail before either commits. The `users.email` unique index is
      // the actual guard; this just converts its violation into the same validation error
      // findByEmail already produces for the non-concurrent case, instead of a raw 500.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw AppError.validation({ email: "An account with this email already exists." });
      }
      throw err;
    }

    logger.info({ userId: user.id }, "auth.register");
    return this.issueSession(user);
  }

  async login(input: LoginInput): Promise<SessionTokens> {
    const user = await this.usersRepo.findByEmail(input.email);
    const valid = user
      ? await verifyPassword(input.password, user.passwordHash)
      : await verifyPasswordAgainstDummy(input.password);

    if (!user || !valid) {
      logger.warn({ email: input.email }, "auth.login_failed");
      throw AppError.unauthorized("Incorrect email or password. Please try again.");
    }

    logger.info({ userId: user.id }, "auth.login");
    return this.issueSession(user);
  }

  async refresh(refreshTokenCookie: string | undefined): Promise<RefreshedTokens> {
    if (!refreshTokenCookie) throw AppError.unauthorized("Not authenticated.");

    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw AppError.unauthorized("Session expired. Please sign in again.");
    }

    const record = await this.refreshRepo.findByJti(payload.jti);
    if (!record) {
      throw AppError.unauthorized("Session invalid. Please sign in again.");
    }

    if (record.revokedAt) {
      // This token was already rotated (or explicitly revoked) once before — reuse implies
      // the refresh token was stolen. Kill every token in the family as a precaution.
      logger.warn({ userId: payload.sub, familyId: payload.familyId }, "auth.refresh_reuse_detected");
      await this.refreshRepo.revokeFamily(payload.familyId);
      throw AppError.unauthorized("Session invalid. Please sign in again.");
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw AppError.unauthorized("Session expired. Please sign in again.");
    }

    const user = await this.usersRepo.findById(payload.sub);
    if (!user) {
      await this.refreshRepo.revokeFamily(payload.familyId);
      throw AppError.unauthorized("Session invalid. Please sign in again.");
    }

    const rotatedJti = newJti();
    const refreshToken = signRefreshToken(user.id, rotatedJti, payload.familyId);
    await this.refreshRepo.rotate(payload.jti, {
      jti: rotatedJti,
      userId: user.id,
      familyId: payload.familyId,
      revokedAt: null,
      replacedByJti: null,
      expiresAt: refreshTokenExpiryIso(),
      createdAt: new Date().toISOString(),
    });

    const accessToken = signAccessToken(this.toAuthenticatedUser(user));
    logger.info({ userId: user.id }, "auth.refresh");
    return { accessToken, refreshToken };
  }

  async logout(refreshTokenCookie: string | undefined): Promise<void> {
    if (!refreshTokenCookie) return;
    try {
      const payload = verifyRefreshToken(refreshTokenCookie);
      await this.refreshRepo.revoke(payload.jti, null);
      logger.info({ userId: payload.sub }, "auth.logout");
    } catch {
      // Already expired/invalid — nothing to revoke, cookies get cleared regardless.
    }
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshRepo.revokeAllForUser(userId);
    logger.info({ userId }, "auth.logout_all");
  }

  private toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
    return { id: user.id, name: user.name, plan: user.plan, role: "member" };
  }

  private async issueSession(user: UserRecord): Promise<SessionTokens> {
    const accessToken = signAccessToken(this.toAuthenticatedUser(user));

    const familyId = newJti();
    const jti = newJti();
    const refreshToken = signRefreshToken(user.id, jti, familyId);
    await this.refreshRepo.create({
      jti,
      userId: user.id,
      familyId,
      revokedAt: null,
      replacedByJti: null,
      expiresAt: refreshTokenExpiryIso(),
      createdAt: new Date().toISOString(),
    });

    return { accessToken, refreshToken, user: { name: user.name, plan: user.plan } };
  }
}
