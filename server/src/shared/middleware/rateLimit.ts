import rateLimit, { type Options } from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

// Automated test runs share one IP across hundreds of requests per file (registering many
// users, concurrency tests, etc.) — production limits would make the suite flaky rather
// than testing anything real. The limiter's own behavior is covered directly in
// tests/middleware.test.ts against a standalone instance with a small limit.
const isTest = env.NODE_ENV === "test";

function loggingHandler(eventName: string, body: Options["message"]) {
  return (req: Request, res: Response) => {
    logger.warn({ path: req.path, method: req.method, ip: req.ip }, eventName);
    res.status(429).json(body);
  };
}

/** Generous global ceiling — protects against gross abuse without affecting normal use. */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 100_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down and try again shortly." },
  handler: loggingHandler("security.rate_limit_exceeded", {
    success: false,
    message: "Too many requests. Please slow down and try again shortly.",
  }),
});

/** Tight limiter for auth endpoints — mitigates credential stuffing / brute force. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 100_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
  handler: loggingHandler("security.auth_rate_limit_exceeded", {
    success: false,
    message: "Too many attempts. Please wait a few minutes and try again.",
  }),
});
