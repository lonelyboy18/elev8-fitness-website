import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200): void {
  res.status(status).json({ success: true, ...(message ? { message } : {}), data });
}
