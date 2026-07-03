# Security Notes

## Fixed this phase

| Issue | Fix | File(s) |
| --- | --- | --- |
| Booking capacity race condition | Postgres advisory lock + transaction; unique index as defense-in-depth | `bookings.service.ts`, `bookings.repository.ts`, migration `20260703120000_add_booking_unique_constraint` |
| `COOKIE_SECURE` was overridden by `NODE_ENV` (`isProduction \|\| COOKIE_SECURE`), so a "production mode" deployment without TLS in front (e.g. this project's own Docker Compose rehearsal) would silently force `Secure` cookies the browser then drops over plain HTTP | `COOKIE_SECURE` is now the single source of truth for the `Secure` flag on all three cookies (auth + CSRF); a non-fatal startup warning fires if `NODE_ENV=production` and `COOKIE_SECURE=false` | `token.service.ts`, `csrf.ts`, `env.ts` |
| `/api/auth/refresh` had no dedicated rate limit (only the generous global one) | Added `authRateLimiter` | `auth.routes.ts` |
| Razorpay placeholder credentials could silently run in production | Non-fatal startup warning (not fatal — the app is still useful with payments unconfigured) | `env.ts` |
| Logs had no redaction — `Cookie`/`Set-Cookie` headers (containing raw JWTs) flowed into pino-http's automatic request/response logs unredacted | Added `redact` paths to the Pino instance | `logger.ts` |
| CSRF rejections and rate-limit trips weren't logged as security events | Added `logger.warn` calls | `csrf.ts`, `rateLimit.ts` |

## Already solid (verified, not changed)

- **Passwords**: bcrypt via `bcryptjs`, never logged.
- **Auth cookies**: `httpOnly`, `SameSite=Strict`, path-scoped (`refresh_token` limited to `/api/auth`).
- **CSRF**: double-submit cookie pattern, required on every mutating route.
- **Refresh-token rotation + reuse detection**: a replayed (already-rotated) refresh token
  revokes its entire token family, not just itself — see `docs/api.md`'s JWT flow.
- **Refresh-token storage**: only an HMAC-SHA256 hash of the `jti` is stored, keyed by a
  secret (`REFRESH_TOKEN_HASH_SECRET`) deliberately separate from `JWT_REFRESH_SECRET`.
- **Login timing**: `verifyPasswordAgainstDummy()` runs a dummy bcrypt compare when no
  user is found, so response timing doesn't reveal whether an email is registered.
- **Input validation**: Zod schemas on every mutating route, applied before the
  controller ever sees the request.
- **SQL injection**: all queries go through Prisma's parameterized query builder; the one
  raw query added this phase (`pg_advisory_xact_lock(hashtext($1))`) uses Prisma's tagged
  template `$executeRaw`, which parameterizes automatically — it does not interpolate the
  key into the SQL string.
- **Payment signature verification**: HMAC-SHA256 compared with `crypto.timingSafeEqual`
  (constant-time), not `===`.
- **Rate limiting**: global ceiling (300/15min) plus a tighter one (20/15min) on
  register/login/refresh; both are relaxed to a very high limit under `NODE_ENV=test` so
  the automated test suite doesn't trip them — real production limits are unaffected.
- **Environment validation**: Zod-validated at startup; the app fails fast rather than
  running with missing/malformed secrets.

## Known, accepted limitations

- **Rate limiting is in-memory** (`express-rate-limit`'s default store) — does not share
  state across multiple server instances. Acceptable at current scale; would need a Redis
  store behind a load balancer.
- **No CSP configured on Helmet** (defaults only) — acceptable since this is a pure JSON
  API with no server-rendered HTML to protect against injected scripts. The client is a
  separate static SPA with its own CSP surface, out of scope for the API server.
- **API docs (`/api-docs`) are only disabled by `NODE_ENV`, not authenticated** — acceptable
  given they're already off in production; revisit if a staging environment needs
  restricting too.
