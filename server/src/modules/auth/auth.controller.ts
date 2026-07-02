import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/respond.js";
import type { UsersService } from "../users/users.service.js";
import type { AuthService } from "./auth.service.js";
import { REFRESH_COOKIE, clearAuthCookies, setAccessCookie, setRefreshCookie } from "./token.service.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;
    const { accessToken, refreshToken, user } = await this.authService.register(input);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, redirect: "/dashboard" }, "Welcome to ELEV8! Your account has been created.", 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;
    const { accessToken, refreshToken, user } = await this.authService.login(input);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, redirect: "/dashboard" }, `Welcome back, ${user.name}!`);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const cookie = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { accessToken, refreshToken } = await this.authService.refresh(cookie);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, {}, "Session refreshed.");
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const cookie = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(cookie);
    clearAuthCookies(res);
    sendSuccess(res, { redirect: "/" }, "Signed out successfully.");
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logoutAll(req.user!.id);
    clearAuthCookies(res);
    sendSuccess(res, {}, "Signed out of all devices.");
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.usersService.getProfile(req.user!.id);
    sendSuccess(res, { user }, "Authenticated.");
  };
}
