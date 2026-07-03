import pino from "pino";
import { env, isProduction } from "./env.js";

// Paths are evaluated against every log object regardless of nesting depth, so this covers
// both direct logger.info({ password }) calls and pino-http's automatic req/res objects.
const REDACT_PATHS = [
  "req.headers.cookie",
  "req.headers.authorization",
  "res.headers['set-cookie']",
  "*.password",
  "*.password_hash",
  "*.passwordHash",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.razorpay_signature",
];

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.LOG_LEVEL,
  redact: { paths: REDACT_PATHS, censor: "[redacted]" },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});
