import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import { clearAuthCookies } from "../auth/token.service.js";
import type { UsersService } from "./users.service.js";
import type { DeleteAccountInput, UpdateProfileInput } from "./users.validation.js";

export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly revokeAllSessions: (userId: number) => Promise<void>
  ) {}

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { name, mobile } = req.body as UpdateProfileInput;
    const result = await this.usersService.updateProfile(req.user!.id, name, mobile);
    sendSuccess(res, result, "Profile updated successfully.");
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as DeleteAccountInput;
    const deletedUserId = await this.usersService.deleteAccount(email, password);

    if (req.user?.id === deletedUserId) {
      await this.revokeAllSessions(deletedUserId);
    }
    clearAuthCookies(res);

    sendSuccess(res, { redirect: "/" }, "Your account has been permanently deleted. We're sorry to see you go.");
  };
}
