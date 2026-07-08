# ELEV8 Fitness — Final Production Audit

| | |
|---|---|
| **Scope** | `client/` (React+TS+Vite), `server/` (Node+Express+TS+Prisma), Docker/CI/CD config, `docs/` |
| **Method** | Full manual read-through of auth, middleware, every feature module, Prisma schema/migrations, frontend routing/SEO/build output, deployment configs, and `npm audit`; no code changes made as part of this pass |
| **Out of scope** | Live browser QA (Lighthouse, cross-device, broken-image checks) — flagged where relevant as "requires manual verification," not asserted as pass/fail |
| **Constraint honored** | No refactors or redesigns performed; no fixes applied (no Critical finding required one) |

---

## Executive summary

This is an unusually well-engineered codebase for a first production launch. Refresh-token rotation with theft detection, HMAC-hashed token storage, a Postgres advisory lock around the booking-capacity race, timing-safe login (no user enumeration), Zod validation on every mutating route, Prisma's parameterized queries everywhere (including the one raw SQL call), redacted structured logging, and a fail-fast environment validator are all already in place and correct. The team's own `docs/security.md` shows a prior internal audit pass that already caught and fixed several real issues (registration race condition, `COOKIE_SECURE` override bug, missing shutdown handlers) — this audit independently re-verified those fixes and found them sound.

**No Critical (launch-blocking) issues were found.** The findings below are two High-priority items (both cheap, non-blocking), a set of Medium items worth doing in the first post-launch iteration, and a longer tail of Low/backlog items.

### Findings by severity

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 8 |
| Low | 7 |

### Category scorecard

| Category | Score | Notes |
|---|---|---|
| Security | 92/100 | Best-in-class auth/session/CSRF/injection posture; two narrow gaps (below) |
| Backend robustness | 90/100 | Async handling, graceful shutdown, health checks all solid; compression/timeouts missing |
| Database | 95/100 | Indexes, constraints, locking, and migrations all correct; one deferred compliance note |
| Frontend | 85/100 | Strong code-splitting and lazy-loading already in place; SEO files and CSP missing |
| Deployment | 88/100 | Docker/CI/CD production-grade; a couple of cache-header and doc-currency gaps |
| Performance | 85/100 | Per-route JS splitting is excellent; CSS bundle and video assets are not |
| Documentation | 78/100 | Thorough, but a concrete inaccuracy (payments described as live) spans 3 docs |

## **Production Ready: YES**
## **Launch score: 90/100**

Recommend closing the two High items (~20 minutes of work combined) before or immediately at launch; everything else is safe to schedule into the first post-launch sprint without blocking go-live.

---

## Critical
*(must fix before launch)*

None found.

---

## High
*(fix soon — cheap, non-blocking, worth doing before or immediately after go-live)*

### H1. Account-deletion endpoint isn't covered by the strict auth rate limiter

- **File:** [server/src/modules/users/users.routes.ts:75](server/src/modules/users/users.routes.ts#L75)
- **Problem:** `router.delete("/me", requireCsrf, validateBody(deleteAccountSchema), asyncHandler(controller.deleteAccount))` re-verifies identity via email+password in the request body (by design — see the route's own OpenAPI comment), but the route has neither `requireAuth` nor `authRateLimiter`. It only inherits the global 300-requests/15-min limiter applied to every route in `app.ts`.
- **Why it matters:** This is a password-verification surface guarding an **irreversible** action (permanent account + booking + payment history deletion), yet it gets 15× looser rate limiting than `/api/auth/login` (20/15min) which guards a *reversible* action. The password check itself is sound (bcrypt via `verifyPassword`/`verifyPasswordAgainstDummy`), but the surrounding throttle is inconsistent with the endpoint's blast radius.
- **Recommended fix:** Add `authRateLimiter` to this route, matching login/register/refresh:
  ```ts
  router.delete("/me", authRateLimiter, requireCsrf, validateBody(deleteAccountSchema), asyncHandler(controller.deleteAccount));
  ```
- **Estimated effort:** 5 minutes.
- **Risk if ignored:** Low likelihood, high impact — a larger brute-force budget against a destructive, unrecoverable action than the app grants against login itself.

### H2. Deployment docs describe Razorpay payments as live; the feature is currently code-disabled

- **Files:**
  - [server/src/modules/payments/payments.service.ts:51-96](server/src/modules/payments/payments.service.ts#L51-L96) — `createOrder()` and `verify()` both unconditionally `throw new AppError(503, "Payments are temporarily unavailable...")`; the real implementation is preserved in comments for later re-enabling.
  - [docs/api.md:53-55](docs/api.md#L53-L55) — endpoint table describes `POST /api/payments/order` as "Creates a Razorpay order" and `POST /api/payments/verify` as "Verifies signature, activates subscription" with no disabled-status note.
  - [docs/DEPLOYMENT_CHECKLIST.md:144](docs/DEPLOYMENT_CHECKLIST.md#L144) — "Payment flow tested against Razorpay in **live** mode with a small real or test-mode transaction, per Razorpay's own go-live checklist."
  - [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — §5.2 frames `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` as needed "if you want the booking payment flow to work," without stating the flow is currently switched off site-wide.
- **Problem:** None of the deployment-facing docs reflect that payments are intentionally disabled — registration currently hands members off to a coach via WhatsApp instead of a Razorpay checkout (per the code comment in `payments.service.ts` and `DashboardPage.tsx`'s note that the Payments tab is deliberately hidden).
- **Why it matters:** Whoever runs the launch checklist will either burn time chasing a "broken" payment flow that's disabled on purpose, or worse, provision and paste in real live Razorpay credentials believing they're required for launch (they aren't — the app boots and functions fully without them).
- **Recommended fix:** Add a one-line "Payments: currently disabled, see `payments.service.ts`" callout to `docs/api.md`'s payments rows, and either remove or reword the live-payment-testing checklist item in `docs/DEPLOYMENT_CHECKLIST.md` to reflect the WhatsApp hand-off flow instead.
- **Estimated effort:** 15 minutes.
- **Risk if ignored:** Wasted launch-day effort; possible unnecessary provisioning of live payment credentials; ongoing confusion for whoever re-enables payments later without knowing the docs are stale.

---

## Medium

### M1. Public form endpoints have no dedicated rate limit

- **Files:** [server/src/modules/feedback/feedback.routes.ts:57](server/src/modules/feedback/feedback.routes.ts#L57), [server/src/modules/contact/contact.routes.ts:43](server/src/modules/contact/contact.routes.ts#L43)
- **Problem:** `POST /api/feedback` and `POST /api/contact` are public, unauthenticated, and only covered by the generous global limiter (300/15min per IP).
- **Why it matters:** `GET /api/feedback/stats` publicly surfaces the average rating on the marketing site — automated 1★ or 5★ submissions at up to 300/15min could visibly skew it. The contact form is likewise open to bulk spam at that volume.
- **Recommended fix:** Apply a lighter dedicated limiter (e.g., the same shape as `authRateLimiter`, ~15-20/15min) to both POST routes.
- **Estimated effort:** 15 minutes.
- **Risk if ignored:** Rating-manipulation and database spam; a reputational/data-quality issue, not a security breach.

### M2. No CSP or baseline security headers on the frontend host

- **File:** [client/vercel.json](client/vercel.json) (rewrites only, no `headers` block)
- **Problem:** Helmet's headers (`server/src/app.ts:31`) only protect JSON API responses. The actual HTML-serving origin — the one a browser renders — currently ships no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` header.
- **Why it matters:** No exploitable XSS was found in this audit (no `dangerouslySetInnerHTML` anywhere in `client/src`, and `cleanText()`'s deliberate non-escaping is safe *because* React auto-escapes on render — confirmed correct). A CSP is the containment layer that would matter if such a bug were introduced later (e.g., alongside a future user-generated-content feature).
- **Recommended fix:** Add a `headers` array to `client/vercel.json` with a CSP permitting Google Fonts, the Google Maps embed (`ContactPage.tsx`'s iframe), and same-origin `/api`; plus `X-Content-Type-Options: nosniff` and a `Referrer-Policy`.
- **Estimated effort:** 30-60 minutes (CSP needs care to avoid breaking the fonts/maps embed).
- **Risk if ignored:** No containment layer for a future front-end injection bug; zero current exploitability.

### M3. Account deletion cascade-deletes Payment records

- **File:** [server/prisma/schema.prisma:131](server/prisma/schema.prisma#L131) — `onDelete: Cascade` on `Payment.user`
- **Problem:** `DELETE /api/users/me` hard-deletes the user row, which cascades to `refresh_tokens`, `bookings`, and `payments` alike (confirmed in `users.repository.ts:93`'s own comment).
- **Why it matters:** Harmless *today* because payments are disabled (H2) and no real `Payment` rows will exist at launch. It becomes a real financial/tax record-retention concern the moment Razorpay payments are re-enabled — most jurisdictions expect transaction records to survive a customer's account deletion.
- **Recommended fix:** When payments are re-enabled, change the `Payment.user` relation to `onDelete: Restrict` (or anonymize the FK rather than deleting the row) and document the retention rationale in `docs/database.md`. Not urgent before this launch.
- **Estimated effort:** Small migration + a few lines in `deleteAccount()`'s service logic, deferred until payments return.
- **Risk if ignored:** None currently; real once payments go live.

### M4. No response compression

- **File:** [server/src/app.ts](server/src/app.ts) (no `compression` middleware)
- **Problem:** `compression` is not in `server/package.json` dependencies or wired into the middleware chain.
- **Why it matters:** JSON payloads here are small today, but this is a standard, low-risk win with no real downside.
- **Recommended fix:** `npm install compression` in `server/`, then `app.use(compression())` early in `createApp()` (after `helmet()`, before routes).
- **Estimated effort:** 10 minutes.
- **Risk if ignored:** Minor — marginally larger responses than necessary.

### M5. No explicit request timeout at the Express/HTTP-server layer

- **Files:** [server/src/app.ts](server/src/app.ts), [server/src/index.ts:17](server/src/index.ts#L17)
- **Problem:** Only Node's own defaults (`requestTimeout` ~5 min) bound how long a request can stay open; there's no explicit timeout middleware or `server.requestTimeout`/`headersTimeout` override.
- **Why it matters:** The one genuinely slow external call (Razorpay order creation) is already correctly bounded — `AbortSignal.timeout(20_000)` in `payments.service.ts:141` — so this gap is about the general case (e.g., a slow query under load), not a known hot spot.
- **Recommended fix:** Set `server.requestTimeout` / `server.headersTimeout` explicitly on the `http.Server` returned by `app.listen()` in `index.ts`, or add `connect-timeout` middleware.
- **Estimated effort:** 20-30 minutes.
- **Risk if ignored:** Low likelihood; a handful of stuck connections under real load rather than a known-triggerable issue.

### M6. Full CSS bundle (~215 KB uncompressed) loads on every route, unsplit

- **Files:** [client/src/main.tsx:3](client/src/main.tsx#L3), [client/src/app/styles/global.css](client/src/app/styles/global.css)
- **Problem:** `global.css` (`@import "./vendor/bootstrap.min.css"` + `main.css`) is imported once at the app root. Vite bundles this into a single `index-*.css` (219,573 bytes in the last build under `client/dist/assets/`) loaded on first paint of *every* route — unlike the JS, which is already properly per-route code-split via `AppRouter.tsx`'s `lazy()` imports.
- **Why it matters:** Pages that use almost none of Bootstrap's utility classes (sign-in, 404) still pay for the full stylesheet on first paint.
- **Recommended fix:** Not urgent. A follow-up pass to measure actual Bootstrap class usage (PurgeCSS-style) or split page-specific CSS would trim this; low priority given gzip already compresses this substantially.
- **Estimated effort:** 1-2 hours (needs careful verification nothing visually breaks).
- **Risk if ignored:** Marginally slower first paint on slow connections; no functional risk.

### M7. Unhashed static assets (`client/public/assets`) have no explicit cache-control policy

- **File:** [client/vercel.json](client/vercel.json)
- **Problem:** Vite's own build output (`dist/assets/*`) gets content-hashed filenames and is safe to cache forever, but files served verbatim from `client/public/assets/images` (2.5 MB) and `client/public/assets/videos` (28 MB, confirmed via `du -sh`) keep their original filenames. Vercel's default caching heuristics for hashed build output don't automatically extend the same guarantee to these.
- **Why it matters:** Repeat visitors may re-download unchanged coach photos and promo videos more often than necessary.
- **Recommended fix:** Add explicit `headers` rules to `client/vercel.json` for `/assets/(.*)` with `Cache-Control: public, max-age=31536000, immutable` — mirroring what `nginx.conf` already does for the Docker Compose path (`client/nginx.conf:24-27`), so the two deployment paths behave consistently.
- **Estimated effort:** 15 minutes.
- **Risk if ignored:** Minor — extra redundant bandwidth use, not a functional risk.

### M8. `npm audit` — 4 moderate transitive findings (already triaged by the team, re-verified here)

- **Files:** `server/package-lock.json` (`uuid` <11.1.1; `@hono/node-server` <1.19.13 via Prisma's own dev tooling), `client/package-lock.json` (`esbuild` <=0.24.2 via `vite@5`, dev-server-only)
- **Problem:** Outdated transitive packages flagged by `npm audit --production`.
- **Why it matters:** Independently re-verified in this audit and confirmed **not exploitable** in this app's actual runtime, matching `docs/security.md`'s own prior conclusion: `uuid()` is called with zero arguments in `token.service.ts:33` (the vulnerable code path requires a caller-supplied buffer, never exercised here); `@hono/node-server` is three levels deep inside Prisma's CLI dev-tooling and never imported by app code; `esbuild`'s issue only affects `vite dev`'s local server, not the static build served by nginx/Vercel.
- **Recommended fix:** Routine maintenance — bump `uuid` to v11+ when convenient (breaking major version, low actual code impact since only `v4()` is used); the other two require upstream fixes from Prisma/Vite respectively.
- **Estimated effort:** Small (uuid bump); N/A for the other two (upstream).
- **Risk if ignored:** Effectively none currently; keep on the maintenance backlog as already tracked in `docs/security.md`.

---

## Low

### L1. bcrypt cost factor is 10, not 12
- **File:** [server/src/shared/utils/password.ts:3](server/src/shared/utils/password.ts#L3)
- **Problem/why it matters:** `SALT_ROUNDS = 10` is `bcryptjs`'s own default and still broadly acceptable, but current OWASP guidance leans toward 12 for stronger resistance if the password-hash table is ever exfiltrated.
- **Fix:** Bump to `SALT_ROUNDS = 12` (the precomputed `DUMMY_HASH` on line 15 picks up the new cost automatically since it's derived from the same constant).
- **Effort:** 5 minutes.
- **Risk if ignored:** Marginal; only matters if the DB is ever breached.

### L2. CSRF token comparison isn't constant-time
- **File:** [server/src/shared/middleware/csrf.ts:30](server/src/shared/middleware/csrf.ts#L30)
- **Problem/why it matters:** `cookieToken !== headerToken` is an ordinary string comparison. Double-submit CSRF's security model doesn't hinge on the token's secrecy from a *remote* timing attack the way an HMAC comparison does, so real-world risk is negligible — but it's a cheap fix.
- **Fix:** Compare via `crypto.timingSafeEqual` on equal-length buffers (guard the length check first, since `timingSafeEqual` throws on mismatched lengths).
- **Effort:** 10 minutes.
- **Risk if ignored:** Negligible in practice.

### L3. Lazy-loaded route chunks render nothing while downloading
- **File:** [client/src/app/routes/AppRouter.tsx:25-27](client/src/app/routes/AppRouter.tsx#L25-L27) — `function RouteFallback() { return null; }`
- **Problem/why it matters:** `<Suspense fallback={<RouteFallback />}>` shows a blank screen during route-chunk download. In-page data loading (e.g. `DashboardPage`'s session/bookings spinners) already handles loading state correctly — this is specifically about the moment between clicking a nav link and the new route's JS chunk arriving. Per the last build, chunks are small (2-20 KB, see `client/dist/assets/`), so the window is brief on a normal connection.
- **Fix:** Give `RouteFallback` a minimal spinner matching the site's existing loader aesthetic.
- **Effort:** 20-30 minutes.
- **Risk if ignored:** Minor UX rough edge on slow connections only.

### L4. No `robots.txt`, `sitemap.xml`, or web app manifest
- **File:** `client/public/` (confirmed absent — directory contains only `404/`, `assets/`, `loader/`, `bootstrap.bundle.min.js`)
- **Problem/why it matters:** Search engines will still crawl the site by default without a `robots.txt`, but there's no sitemap to speed/guide discovery of the marketing pages, and no manifest for "Add to Home Screen" on mobile.
- **Fix:** Add `client/public/robots.txt` (allow-all, reference the sitemap), a `sitemap.xml` listing the public marketing routes, a minimal `site.webmanifest`, and an `apple-touch-icon`.
- **Effort:** 30-45 minutes total.
- **Risk if ignored:** Slightly slower/less complete search indexing; no functional risk.

### L5. No email verification on registration
- **File:** [server/src/modules/auth/auth.service.ts](server/src/modules/auth/auth.service.ts) (`register()`)
- **Problem/why it matters:** Anyone can register with an email address they don't own. Reasonable for a gym-booking MVP at this stage, but it affects trust in the address used for future booking-confirmation email (see Section 16, "Custom SMTP," in `docs/DEPLOYMENT_GUIDE.md`).
- **Fix:** Backlog — pair with the future transactional-email work rather than building in isolation now.
- **Effort:** N/A (backlog).
- **Risk if ignored:** Low for the current MVP scope.

### L6. Missing `og:url`, Twitter Card tags, and canonical link
- **File:** [client/index.html](client/index.html)
- **Problem/why it matters:** OpenGraph title/description/image/type/locale are present (lines 12-16), but there's no `og:url`, no `twitter:card`/`twitter:title`/etc., and no `<link rel="canonical">`. Since this is a client-only SPA with no SSR/prerendering, every route also shares this exact same static OG data — acceptable for a small marketing site, but per-route social-preview customization isn't possible without further work.
- **Fix:** Add `og:url`, basic Twitter Card meta tags, and a canonical link pointing at `https://elev8calisthenicsgoa.com`.
- **Effort:** 15 minutes.
- **Risk if ignored:** Slightly less polished social-share previews; no functional risk.

### L7. `client/package.json` has no `engines` field
- **File:** [client/package.json](client/package.json)
- **Problem/why it matters:** `server/package.json` declares `"engines": { "node": ">=18" }`; the client has no equivalent. Vercel auto-detects the Node version for the build regardless, so this is a documentation/consistency nit, not a functional gap.
- **Fix:** Add `"engines": { "node": ">=20" }` to match the server's Dockerfile pin.
- **Effort:** 2 minutes.
- **Risk if ignored:** None functionally.

---

## What's already solid (verified, not just claimed)

Confirmed correct by direct code inspection in this pass, not just by reading `docs/security.md`'s own claims:

- **No SQL injection surface** — every query goes through Prisma's query builder or a `$executeRaw`/`$queryRaw` **tagged template** (`bookings.repository.ts:93`, `prismaClient.ts:19`); no `$queryRawUnsafe`/`$executeRawUnsafe` anywhere in `server/src`.
- **No XSS surface found** — zero `dangerouslySetInnerHTML` in `client/src`; `cleanText()`'s deliberate non-HTML-escaping is safe precisely because it relies on React's own auto-escaping on render, and that assumption holds (no raw-HTML injection points exist).
- **Refresh-token theft detection is real, not aspirational** — reusing an already-rotated refresh token revokes its entire token family (`auth.service.ts:94-100`), verified end-to-end from route → service → repository.
- **Booking capacity race is correctly closed** — `pg_advisory_xact_lock` inside a transaction, plus a unique index as defense-in-depth (`bookings.service.ts:39`, `schema.prisma:114`); this is a harder problem than most first launches bother to solve correctly.
- **Timing-safe login** — `verifyPasswordAgainstDummy()` ensures a non-existent email still pays a real bcrypt cost, closing the classic email-enumeration-via-timing gap (`password.ts:13-20`).
- **Environment validation fails fast and loud** — a malformed/missing secret exits the process at boot rather than serving requests in a broken state (`config/env.ts`).
- **Logging redaction is thorough and applies automatically** — cookies, auth headers, passwords, tokens, and Razorpay signatures are redacted in every log line via Pino's `redact.paths`, including automatic request/response logs (`config/logger.ts:6-17`).
- **Graceful shutdown is properly implemented** — `SIGTERM`/`SIGINT` handlers, a forced-exit timeout so a hung `server.close()` can't block a deploy forever, and `prisma.$disconnect()` on the way out (`index.ts:21-38`).
- **Input validation is comprehensive** — every mutating route runs its body/query/params through a Zod schema before the controller ever sees it (verified across all six feature modules).
- **Frontend code-splitting and image lazy-loading are already well done** — every route is a separate lazy-loaded chunk (`AppRouter.tsx`), and 11 of 13 `<img>` tags already carry `loading="lazy"`; all `<img>` tags have `alt` text.
- **`trust proxy` and the Vercel same-origin rewrite** (added earlier this session) are both correctly in place and verified via a passing DB-independent liveness test.

---

## Verification notes

- `npm run typecheck` (server) — pass.
- `npm audit --production` — client: 0 vulnerabilities; server: 4 moderate, all triaged (see M8).
- Not independently re-verified in this pass (would require a live browser/deployed environment): Lighthouse score, cross-device responsive layout, actual broken-image/broken-link sweep, live DNS/SSL status. These remain correctly listed as manual QA steps in `docs/DEPLOYMENT_CHECKLIST.md` Phase 12.
