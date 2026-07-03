# Security Notes

## Fixed in Phase 6 (release-candidate audit)

| Issue | Fix | File(s) |
| --- | --- | --- |
| Registration had the same class of race condition as the booking one: `findByEmail` then `create` as separate queries, so two concurrent registrations for the same email could both pass the check before either committed — the loser would hit an unhandled `P2002` unique-violation and surface as a raw 500 instead of the intended "email already exists" message | Catch `P2002` on the `users.create()` call and convert it to the same `422` validation error the pre-check produces | `auth.service.ts` |
| No `unhandledRejection`/`uncaughtException` handlers; graceful shutdown had no forced-exit timeout (a hung `server.close()` callback would block forever, defeating an orchestrator's SIGTERM grace period) | Added both process handlers (log + exit) and a 10s forced-exit fallback in shutdown | `index.ts` |

## Fixed in Phase 5 (production hardening)

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

## Dependency audit (Phase 6)

`npm audit` reports 4 moderate-severity findings across both workspaces. None are exploitable in this app's actual runtime:

| Package | Where | Why it doesn't apply here |
| --- | --- | --- |
| `uuid` (<11.1.1, CVE re: buffer bounds when a `buf` argument is passed) | `server`, direct dependency | The only call site (`token.service.ts`'s `newJti()`) calls `uuid()` with zero arguments — the vulnerable code path (passing a pre-allocated buffer) is never exercised. Safe to leave; upgrading to v11+ is a breaking major bump, deferred to routine post-release maintenance rather than done under an RC freeze. |
| `@hono/node-server` (<1.19.13, middleware bypass via repeated slashes) | `server`, transitive via `prisma`'s own `@prisma/dev` devDependency | Three levels deep inside the Prisma CLI's internal dev-server tooling (used by `prisma dev`'s local shadow-database feature) — not imported by any of this project's own code, and devDependencies aren't shipped in the Docker runtime image. Requires an upstream Prisma fix; not actionable here without downgrading Prisma to 6.x, which would break the driver-adapter API this whole backend is built on. |
| `esbuild` (<=0.24.2, dev server accepts requests from any origin) | `client`, transitive via `vite@5.4.x` | Only affects `vite dev`'s local dev server; the shipped Docker deployment builds via `vite build` and serves static files through nginx (`client/Dockerfile`), which never runs the dev server at all. Fixing requires a Vite 6+ major bump — deferred post-release. |

All three are genuine CVEs in the abstract but zero-impact given how this app actually uses (or doesn't use) the vulnerable code paths. None block release; all three are listed again under "Remaining technical debt" in the RC report as routine post-v1.0.0 maintenance.

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
