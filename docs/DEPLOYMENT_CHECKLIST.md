# ELEV8 Fitness — Production Deployment Checklist

> Companion to [`docs/DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md). Work top to bottom — later sections assume earlier ones are done. Each item links back to the guide section that explains it in full.

**Deployment date:** _____________  **Performed by:** _____________  **Domain:** `elev8calisthenicsgoa.com`

---

## Phase 1 — Repository ([Guide §1](./DEPLOYMENT_GUIDE.md#1-repository-preparation))

- [ ] Repo pushed to GitHub as a **private** repository
- [ ] `git status` clean — no uncommitted changes on `main`
- [ ] `cd server && npm install && npm run typecheck && npm run lint && npm run build` passes with zero errors
- [ ] `cd client && npm install && npm run typecheck && npm run lint && npm run build` passes with zero errors
- [ ] `server/tests` pass locally (`npm test` against a local/Docker Postgres)
- [ ] `git ls-files | grep -i env` shows **only** `.env.example` / `server/.env.example` — no real `.env` tracked
- [ ] Confirmed no secrets exist anywhere in git history (or rotated any that were ever exposed)
- [ ] `.gitignore` (root and `server/`) excludes `node_modules/`, `dist/`, `.env`
- [ ] Release commit tagged (`git tag v1.0.0`) — optional but recommended

## Phase 2 — Backend on Railway ([Guide §2](./DEPLOYMENT_GUIDE.md#2-backend-deployment-railway))

- [ ] Railway account created, GitHub App installed and authorized
- [ ] New Railway project created from `elev8-fitness-website` repo
- [ ] Service **Root Directory** set to `server`
- [ ] Builder set to **Dockerfile** (or Nixpacks with explicit build/start commands)
- [ ] Node version confirmed as 20 (via Dockerfile `FROM node:20-alpine`, or pinned explicitly for Nixpacks)
- [ ] All required environment variables added (see Phase 4 below — do not deploy without them)
- [ ] Public domain generated under **Settings → Networking**
- [ ] First deploy triggered and build log reviewed
- [ ] `GET /health` returns `200`
- [ ] `GET /ready` returns `200` (confirms DB connectivity — requires Phase 3 done first)

## Phase 3 — Database ([Guide §3](./DEPLOYMENT_GUIDE.md#3-database) & [§4](./DEPLOYMENT_GUIDE.md#4-prisma))

- [ ] PostgreSQL provisioned — **Railway PostgreSQL** (in the same project) **or** **Neon** (direct/unpooled connection string)
- [ ] `DATABASE_URL` set on the `server` Railway service (via `${{ Postgres.DATABASE_URL }}` reference, or pasted Neon string)
- [ ] Migrations applied — `npx prisma migrate deploy` (automatic via Dockerfile `CMD`, or run manually via `railway run`)
- [ ] `railway run npx prisma migrate status` shows no pending/drifted migrations
- [ ] Seed data run only if intended for launch-day demo purposes (`railway run npm run prisma:seed`) — and demo password changed/removed before going public if so
- [ ] Backup plan decided and documented (scheduled `pg_dump`, or Neon point-in-time restore confirmed active)

## Phase 4 — Environment Variables ([Guide §5](./DEPLOYMENT_GUIDE.md#5-environment-variables))

**Railway (`server` service) — all of the following set to real production values:**

- [ ] `NODE_ENV=production`
- [ ] `CLIENT_ORIGIN=https://elev8calisthenicsgoa.com` (exact — no trailing slash, correct scheme)
- [ ] `LOG_LEVEL=info`
- [ ] `DATABASE_URL` (real, working connection string)
- [ ] `JWT_ACCESS_SECRET` — freshly generated, ≥16 chars
- [ ] `JWT_REFRESH_SECRET` — freshly generated, ≥16 chars, different from access secret
- [ ] `REFRESH_TOKEN_HASH_SECRET` — freshly generated, ≥16 chars, different from both above
- [ ] `ACCESS_TOKEN_TTL_MIN=15`
- [ ] `REFRESH_TOKEN_TTL_DAYS=7`
- [ ] `RAZORPAY_KEY_ID` — real live key (not placeholder)
- [ ] `RAZORPAY_KEY_SECRET` — real live secret (not placeholder)
- [ ] `COOKIE_SECURE=true` (only flip this on once HTTPS is confirmed live — Phase 7)

**Vercel (`client` project):**

- [ ] No environment variables required for the default same-origin rewrite setup — confirmed intentional, not an oversight

**General:**

- [ ] No secret value has ever been pasted into a GitHub issue, PR, commit message, or chat log
- [ ] No `VITE_`-prefixed variable contains a secret (only ever safe for genuinely public values)

## Phase 5 — Frontend on Vercel ([Guide §6](./DEPLOYMENT_GUIDE.md#6-frontend-deployment-vercel))

- [ ] Vercel account created, GitHub App installed and authorized
- [ ] Project imported from `elev8-fitness-website` repo
- [ ] **Root Directory** set to `client`
- [ ] Framework auto-detected as **Vite**; Build Command / Output Directory left as detected (`npm run build` / `dist`)
- [ ] First production deploy succeeded — temporary `*.vercel.app` URL loads correctly
- [ ] Preview deployment confirmed working on a test PR (optional sanity check)

## Phase 6 — Connect Frontend and Backend ([Guide §7](./DEPLOYMENT_GUIDE.md#7-connect-frontend-and-backend))

- [ ] `client/vercel.json` created with the `/api/:path*` rewrite pointing at `https://api.elev8calisthenicsgoa.com/api/:path*`
- [ ] `client/vercel.json` committed, pushed, and deployed
- [ ] `CLIENT_ORIGIN` on Railway matches the real frontend origin exactly (Phase 4)
- [ ] `COOKIE_SECURE=true` set on Railway (only after Phase 7 domain/SSL steps below are live)

## Phase 7 — Spaceship Domain ([Guide §8](./DEPLOYMENT_GUIDE.md#8-spaceship-domain))

- [ ] `elev8calisthenicsgoa.com` added as a custom domain in **Vercel → Settings → Domains**
- [ ] Vercel's required **A record** (`@`) added in Spaceship DNS
- [ ] Vercel's required **CNAME record** (`www`) added in Spaceship DNS
- [ ] Any old/conflicting parking-page DNS records removed from Spaceship first
- [ ] `api.elev8calisthenicsgoa.com` added as a custom domain in **Railway → Settings → Networking**
- [ ] Railway's required **CNAME record** (`api`) added in Spaceship DNS
- [ ] **TXT** verification record added, if either platform requested one
- [ ] DNS propagation confirmed via `nslookup` and/or [dnschecker.org](https://dnschecker.org) for all three hostnames (root, `www`, `api`)
- [ ] Domain status shows **Valid / Active** in both Vercel and Railway dashboards

## Phase 8 — SSL ([Guide §9](./DEPLOYMENT_GUIDE.md#9-ssl))

- [ ] Vercel shows a valid SSL certificate for `elev8calisthenicsgoa.com` and `www.elev8calisthenicsgoa.com`
- [ ] Railway shows a valid SSL certificate for `api.elev8calisthenicsgoa.com`
- [ ] `http://` requests to all three hostnames redirect to `https://` (confirmed with `curl -I`)
- [ ] Browser padlock icon confirmed on the live site

## Phase 9 — Production Security ([Guide §10](./DEPLOYMENT_GUIDE.md#10-production-security))

- [ ] `app.set("trust proxy", 1)` added to `server/src/app.ts` and deployed (**required** — Railway sits behind a proxy)
- [ ] Helmet confirmed active (already in code — no action, just verify headers with `curl -I`)
- [ ] Rate limiting confirmed working as expected post-trust-proxy fix (test a burst of requests against `/api/auth/login`)
- [ ] `CLIENT_ORIGIN` CORS allow-list re-confirmed correct
- [ ] Environment validation confirmed fail-fast on boot (already in code)
- [ ] Centralized error handling confirmed — no raw stack traces returned in API responses (test with a deliberately bad request)
- [ ] Logging confirmed redacting cookies/tokens/passwords (check a login request's log line in Railway)
- [ ] *(Optional)* `compression` middleware added if response sizes warrant it

## Phase 10 — Monitoring ([Guide §11](./DEPLOYMENT_GUIDE.md#11-monitoring))

- [ ] Railway Logs tab confirmed showing live structured request logs
- [ ] Vercel Logs/build output reviewed for the latest deploy
- [ ] UptimeRobot monitor created for `https://api.elev8calisthenicsgoa.com/ready`
- [ ] UptimeRobot monitor created for `https://elev8calisthenicsgoa.com`
- [ ] Alert contact (email/SMS) configured on UptimeRobot

## Phase 11 — CI/CD ([Guide §12](./DEPLOYMENT_GUIDE.md#12-cicd))

- [ ] `.github/workflows/ci.yml` passing on `main` (green check on the latest commit)
- [ ] Confirmed Railway auto-deploys on push to `main`
- [ ] Confirmed Vercel auto-deploys on push to `main`
- [ ] Rollback procedure tested at least once (redeploy an older Railway deployment, promote an older Vercel deployment) so it's not untested the first time you actually need it

## Phase 12 — End-to-End Production Testing

> These are the functional checks referenced in the original launch checklist — run every one of them against the **real domain**, not a preview/staging URL.

- [ ] Backend deployed
- [ ] Database connected
- [ ] Prisma migrations completed
- [ ] Environment variables set
- [ ] Domain connected
- [ ] SSL active
- [ ] API tested (`/health`, `/ready`, and at least one real `/api/*` route via the browser network tab)
- [ ] Contact form works (submission reaches the backend and is stored/handled correctly)
- [ ] Booking works (create a booking end-to-end; confirm it appears in the database via Prisma Studio)
- [ ] Authentication works (sign up, log in, refresh-token rotation, log out — cookies persist across a page refresh)
- [ ] Payment flow tested against Razorpay in **live** mode with a small real or test-mode transaction, per Razorpay's own go-live checklist
- [ ] Mobile responsive (test on an actual phone or DevTools device emulation — check nav, forms, and booking flow specifically)
- [ ] Lighthouse score checked (Chrome DevTools → Lighthouse, run against the production URL; note the score and revisit if Performance is notably low)
- [ ] Backup completed (a fresh `pg_dump` taken and stored safely post-launch, before real traffic accumulates)

## Phase 13 — Launch Sign-off

- [ ] All phases above complete
- [ ] Known issues (if any) documented below and consciously accepted, not forgotten
- [ ] Team notified the site is live at `https://elev8calisthenicsgoa.com`

**Known issues / follow-ups accepted at launch:**

```
-
-
```

**Signed off by:** _____________  **Date:** _____________
