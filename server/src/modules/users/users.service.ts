import { AppError } from "../../shared/errors/AppError.js";
import { cleanMobile } from "../../shared/utils/mobile.js";
import { cleanText } from "../../shared/utils/text.js";
import { verifyPassword, verifyPasswordAgainstDummy } from "../../shared/utils/password.js";
import { logger } from "../../config/logger.js";
import type { IUsersRepository } from "./users.repository.js";
import type { UserProfileDto } from "./users.types.js";

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export class UsersService {
  constructor(private readonly usersRepo: IUsersRepository) {}

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw AppError.unauthorized("Session invalid. Please sign in again.");

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpires: user.subscriptionExpires,
      memberSince: formatMemberSince(user.createdAt),
    };
  }

  async updateProfile(userId: number, name: string, mobile: string): Promise<{ name: string }> {
    const cleanName = cleanText(name);
    await this.usersRepo.updateProfile(userId, cleanName, mobile ? cleanMobile(mobile) : "");
    return { name: cleanName };
  }

  async deleteAccount(email: string, password: string): Promise<number> {
    const user = await this.usersRepo.findByEmail(email);
    const valid = user ? await verifyPassword(password, user.passwordHash) : await verifyPasswordAgainstDummy(password);

    if (!user || !valid) {
      throw AppError.unauthorized("Incorrect email or password.");
    }

    await this.usersRepo.delete(user.id);
    logger.info({ userId: user.id }, "auth.account_deleted");
    return user.id;
  }
}
