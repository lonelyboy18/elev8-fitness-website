import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").startsWith("postgresql://", {
    message: "DATABASE_URL must be a postgresql:// connection string",
  }),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  REFRESH_TOKEN_HASH_SECRET: z.string().min(16, "REFRESH_TOKEN_HASH_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_TTL_MIN: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

  RAZORPAY_KEY_ID: z.string().default("rzp_test_YOUR_KEY_ID_HERE"),
  RAZORPAY_KEY_SECRET: z.string().default("YOUR_KEY_SECRET_HERE"),

  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
});

const PLACEHOLDER_RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_ID_HERE";
const PLACEHOLDER_RAZORPAY_KEY_SECRET = "YOUR_KEY_SECRET_HERE";

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  // Placeholder Razorpay credentials pass the base schema (they're just non-empty strings).
  // Not fatal — the app is still useful in production with payments unconfigured (booking,
  // feedback, contact, auth all work standalone), and createOrder() already fails cleanly
  // with a 502 rather than silently misbehaving. But it's an easy thing to forget, so warn.
  if (
    parsed.data.NODE_ENV === "production" &&
    (parsed.data.RAZORPAY_KEY_ID === PLACEHOLDER_RAZORPAY_KEY_ID ||
      parsed.data.RAZORPAY_KEY_SECRET === PLACEHOLDER_RAZORPAY_KEY_SECRET)
  ) {
    console.warn(
      "[env] NODE_ENV=production with placeholder RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET: payment endpoints will fail against the real Razorpay API until these are set to real credentials."
    );
  }

  // Not fatal — a production deploy behind a TLS-terminating proxy is a normal, valid
  // setup, and this project's own docker-compose.yml runs "production mode" over plain
  // HTTP for local rehearsal. But if this combination is unintentional, auth cookies will
  // silently never reach the browser (Secure cookies are dropped over HTTP), so surface it.
  if (parsed.data.NODE_ENV === "production" && !parsed.data.COOKIE_SECURE) {
    console.warn(
      "[env] NODE_ENV=production with COOKIE_SECURE=false: auth cookies will only work if this really is served over plain HTTP. If there's TLS in front of this app (directly or via a proxy/load balancer), set COOKIE_SECURE=true."
    );
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
