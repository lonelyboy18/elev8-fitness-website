import crypto from "node:crypto";
import { env } from "../config/env.js";

/**
 * Refresh-token identifiers (jti) are bearer credentials in their own right — anyone who
 * reads the `refresh_tokens` table should not be able to replay a session from it. We
 * store only an HMAC-SHA256 of the jti, keyed by a secret that's independent of the JWT
 * signing secret (defense in depth).
 */
export function hashTokenId(jti: string): string {
  return crypto.createHmac("sha256", env.REFRESH_TOKEN_HASH_SECRET).update(jti).digest("hex");
}
