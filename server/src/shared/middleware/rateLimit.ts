import rateLimit from "express-rate-limit";

/** Generous global ceiling — protects against gross abuse without affecting normal use. */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down and try again shortly." },
});

/** Tight limiter for auth endpoints — mitigates credential stuffing / brute force. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
});
