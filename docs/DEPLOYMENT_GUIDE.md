# ELEV8 Fitness — Production Deployment Guide

| | |
|---|---|
| **Document owner** | Engineering |
| **Audience** | Anyone deploying ELEV8 for the first time — no prior deployment experience assumed |
| **Applies to** | `client/` (React + TypeScript + Vite) and `server/` (Node.js + Express + TypeScript + Prisma) |
| **Target domain** | `elev8calisthenicsgoa.com` |
| **Status** | First production deployment |

> **📌 How to use this document**
> This guide assumes you have never deployed this project before and walks through every screen, button, and field you will encounter in Railway, Vercel, and Spaceship. Follow the sections in order — later sections (domain, SSL, security) depend on earlier ones (backend and database) already being live. Skipping ahead will leave you stuck on steps that reference resources that don't exist yet.

---

## Table of contents

1. [Repository Preparation](#1-repository-preparation)
2. [Backend Deployment (Railway)](#2-backend-deployment-railway)
3. [Database](#3-database)
4. [Prisma](#4-prisma)
5. [Environment Variables](#5-environment-variables)
6. [Frontend Deployment (Vercel)](#6-frontend-deployment-vercel)
7. [Connect Frontend and Backend](#7-connect-frontend-and-backend)
8. [Spaceship Domain](#8-spaceship-domain)
9. [SSL](#9-ssl)
10. [Production Security](#10-production-security)
11. [Monitoring](#11-monitoring)
12. [CI/CD](#12-cicd)
13. [Deployment Checklist](#13-deployment-checklist)
14. [Troubleshooting](#14-troubleshooting)
15. [Cost](#15-cost)
16. [Future Scaling](#16-future-scaling)

---

## Architecture overview

```mermaid
flowchart LR
    subgraph User["Visitor's Browser"]
        A[elev8calisthenicsgoa.com]
    end

    subgraph Spaceship["Spaceship — DNS"]
        DNS[DNS Records]
    end

    subgraph Vercel["Vercel — Frontend Hosting"]
        FE["client/ — React + Vite\nStatic build"]
    end

    subgraph Railway["Railway — Backend Hosting"]
        BE["server/ — Node + Express\napi.elev8calisthenicsgoa.com"]
        DB[("PostgreSQL\n(Railway or Neon)")]
    end

    A -->|HTTPS| DNS
    DNS -->|CNAME / A / AAAA| FE
    FE -->|"/api/* rewrite\n(same-origin)"| BE
    BE -->|Prisma| DB
```

**Why this shape:** the React app is a static Vite build, so it belongs on Vercel's global CDN. The Express API needs a persistent Node process (not a serverless function) because it talks to PostgreSQL through a long-lived connection pool, so it belongs on Railway. Both are wired to the same custom domain via Spaceship DNS so the whole product looks like one site to visitors, even though it's two independently deployed services.

> **Note:** This repository is a monorepo. The two folders that matter for this deployment are `client/` and `server/` at the repository root. The `Elev8/` folder is a legacy static PHP prototype that predates this stack and is **not** part of this deployment — you will not touch it in this guide. The `domain/` folder contains the domain purchase receipt for reference only.

---

## 1. Repository Preparation

Before touching Railway, Vercel, or Spaceship, get the repository itself into a deployable state.

### 1.1 Confirm your project structure

Your repository root should look like this:

```
elev8-fitness-website/
├── client/                 # React + TypeScript + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile          # used for local Docker Compose, not for Vercel
│   └── nginx.conf          # used for local Docker Compose, not for Vercel
├── server/                 # Node + Express + TypeScript backend
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # local-only convenience stack, not used in production
├── .github/workflows/ci.yml
└── docs/
    ├── DEPLOYMENT_GUIDE.md       # this file
    └── DEPLOYMENT_CHECKLIST.md
```

> **Note:** `client/` and `server/` are two independent Node projects (each with its own `package.json` and `package-lock.json`) — this is **not** an npm workspace. You will always run `npm install` / `npm run build` separately inside each folder, and later you will tell Railway and Vercel to treat each folder as its own "Root Directory."

### 1.2 Create a production branch strategy

For a project this size, a single protected `main` branch is enough — you don't need a separate `production` branch. Railway and Vercel will both deploy automatically from `main`, and every other branch/PR gets its own disposable preview deployment (covered in [Section 12](#12-cicd)).

If you'd prefer stricter separation, use this convention instead:

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Always production-ready | Railway production + Vercel production |
| `develop` (optional) | Integration branch | Not deployed, or Vercel preview only |
| `feature/*` | Individual work | Vercel/Railway preview deployments only |

This guide assumes the simpler `main`-only model. Adjust Section 12 if you adopt `develop`.

### 1.3 Push the repository to GitHub

If the repository isn't already on GitHub:

```bash
# From the repository root
git status                     # confirm you're on main and everything is committed
git remote -v                  # check whether a remote already exists
```

If there is no remote yet:

1. Go to [github.com/new](https://github.com/new) and create a new **private** repository named `elev8-fitness-website` (private is recommended — this repo contains Razorpay integration code and, in `.env` files, would contain live secrets if they were ever committed, which they should not be).
2. Do **not** initialize it with a README, `.gitignore`, or license — you already have all three.
3. Copy the remote URL GitHub shows you, then run:

```bash
git remote add origin https://github.com/<your-org>/elev8-fitness-website.git
git branch -M main
git push -u origin main
```

> **Warning:** Double-check the repository visibility is **Private** before pushing, unless you have a specific reason to make ELEV8 open source. A public repo exposes your code structure and route names to anyone, even though real secrets are correctly kept out of git via `.gitignore`.

### 1.4 Verify the project actually builds, locally, before deploying

Do this for both `client/` and `server/` — a build that fails on Railway/Vercel is much slower to debug than one that fails on your own machine.

**Backend:**

```bash
cd server
npm install
npm run typecheck
npm run lint
npm run build          # runs `prisma generate && tsc -p tsconfig.json`
```

A successful build produces `server/dist/`. If you have a local PostgreSQL instance running (see `docker-compose.yml`), also run:

```bash
npm test
```

**Frontend:**

```bash
cd client
npm install
npm run typecheck
npm run lint
npm run build           # runs `tsc --noEmit && vite build`
```

A successful build produces `client/dist/`. Preview it locally with:

```bash
npm run preview
```

> **✅ Do not proceed to Section 2 until both builds succeed with zero errors.** Railway and Vercel run the exact same commands — if it doesn't build on your machine, it will not build in the cloud either.

### 1.5 Remove development environment variables from the repo

Check what's tracked in git right now:

```bash
git ls-files | grep -i env
```

You should see **only** the example/template files:

```
.env.example
server/.env.example
```

You should **never** see `server/.env` or a root `.env` in that output. If you do, they are being committed by mistake — remove them from git tracking (this does not delete the file from your disk, only from git):

```bash
git rm --cached server/.env
git rm --cached .env
```

> **🚨 Warning — secret rotation:** If a real `.env` file (with real JWT secrets or real Razorpay keys) was ever committed to git history at any point, those values are compromised even after deletion — they still exist in old commits. Rotate them (generate new secrets, get new Razorpay keys) before going to production. Don't reuse a secret that was ever visible in git history, even briefly.

### 1.6 Confirm `.gitignore` is doing its job

Your root `.gitignore` should already contain:

```gitignore
node_modules/
dist/
build/
*.tsbuildinfo
.env
.env.local
.DS_Store
```

Check `server/.gitignore` too — it should also exclude `.env` and `dist/` at minimum. Run this to confirm nothing sensitive is tracked:

```bash
git status --ignored
```

Anything you don't want in production (build artifacts, `node_modules`, local `.env` files, IDE folders like `.vscode/`) should show up under "Ignored files," not under "Changes to be committed."

### 1.7 Tag this state (optional but recommended)

Once builds pass and the repo is clean, tag the commit you're about to deploy — it gives you a known-good rollback point:

```bash
git tag -a v1.0.0 -m "First production deployment"
git push origin v1.0.0
```

---

## 2. Backend Deployment (Railway)

Railway will host the `server/` Express API as a persistent, always-on Node process.

### 2.1 Create a Railway account and project

1. Go to [railway.app](https://railway.app) and sign up (GitHub sign-in is the fastest option, and it's what you'll need anyway to connect your repo).
2. On the Railway dashboard, click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. If this is your first time, Railway will prompt you to install the **Railway GitHub App**. Click **Configure GitHub App**, then either grant access to **All repositories** or select **Only select repositories** and pick `elev8-fitness-website`. Click **Install & Authorize**.
5. Back in Railway, select `elev8-fitness-website` from the repository list.

> 📷 Screenshot: Railway "Deploy from GitHub repo" repository picker

Railway will create a new **Project** and immediately try to build a **Service** from the repository root. Because this repo is a monorepo, that first build will fail (or misbehave) — that's expected, you'll fix it in the next step.

### 2.2 Set the Root Directory to `server`

1. Click into the service Railway just created (it will likely be named after your repo).
2. Go to the **Settings** tab.
3. Under **Source**, find **Root Directory** and click the pencil/edit icon.
4. Enter `server` and confirm.

> 📷 Screenshot: Railway Service → Settings → Source → Root Directory field set to `server`

This tells Railway: "only look inside `server/` when building — ignore `client/`, `Elev8/`, and everything else."

### 2.3 Choose the build method: Dockerfile (recommended)

`server/Dockerfile` already exists and is tested (it's the same image used by `docker-compose.yml` locally). Using it means Railway builds the exact same artifact you've already verified, and it automatically runs database migrations on every deploy (see below).

1. Still in **Settings**, scroll to **Build**.
2. Set **Builder** to **Dockerfile**.
3. **Dockerfile Path** should resolve to `Dockerfile` (relative to the Root Directory you set above, i.e. `server/Dockerfile`).

> 📷 Screenshot: Railway Service → Settings → Build → Builder set to "Dockerfile"

**What this Dockerfile does on every deploy**, so you understand what you're about to trigger:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

Every time Railway starts a new container, it first applies any pending Prisma migrations against the connected database, then starts the API. This is why you don't need a separate manual "run migrations" step for normal deploys — it's built in.

> **Alternative — Nixpacks (no Dockerfile):** Railway's default builder, Nixpacks, also works if you'd rather not use the Dockerfile. Set **Build Command** to `npm run build` and **Start Command** to `npx prisma migrate deploy && node dist/index.js`. The Dockerfile path is recommended here because it's the same image already exercised by local Docker Compose and CI-adjacent tooling — one less thing that behaves differently between environments.

### 2.4 Set the Start Command (Dockerfile builder only)

If you used the Dockerfile builder, Railway reads the `CMD` from the Dockerfile automatically — you do **not** need to set a separate Start Command. Leave **Settings → Deploy → Custom Start Command** blank.

If you used Nixpacks instead, set it explicitly:

```
npx prisma migrate deploy && node dist/index.js
```

### 2.5 Set the Node version

The Dockerfile pins `FROM node:20-alpine`, so Dockerfile deployments automatically use Node 20 — no action needed.

If you're using Nixpacks, pin the version explicitly so Railway doesn't silently pick a different one later:

1. In **Settings → Build**, find **Nixpacks Config** (or add a `server/.nvmrc` file containing `20`).
2. Alternatively, add to `server/package.json` (already present):
   ```json
   "engines": { "node": ">=18" }
   ```
   Nixpacks respects `engines.node`, but for exact reproducibility, prefer the Dockerfile method above.

### 2.6 Add environment variables

Before the first successful boot, the app needs its environment variables set — the app **deliberately refuses to start** if required variables are missing or malformed (see `server/src/config/env.ts`), so this step is not optional.

1. In the Railway service, go to the **Variables** tab.
2. Click **+ New Variable**, or click **Raw Editor** to paste many at once.

Paste the following, then fill in the placeholder values (full explanation of each variable is in [Section 5](#5-environment-variables)):

```bash
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://elev8calisthenicsgoa.com
LOG_LEVEL=info

DATABASE_URL=postgresql://REPLACE_ME

JWT_ACCESS_SECRET=REPLACE_WITH_GENERATED_SECRET
JWT_REFRESH_SECRET=REPLACE_WITH_GENERATED_SECRET
REFRESH_TOKEN_HASH_SECRET=REPLACE_WITH_GENERATED_SECRET
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=7

RAZORPAY_KEY_ID=REPLACE_WITH_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=REPLACE_WITH_LIVE_KEY_SECRET

COOKIE_SECURE=true
```

> **Note on `PORT`:** Railway automatically injects its own `PORT` value into every service's environment and expects your app to listen on it. This app already reads `process.env.PORT` via `server/src/config/env.ts`, so it will work correctly whether you set `PORT` explicitly or let Railway manage it. Setting it explicitly to `5000` above is just for clarity/local parity — Railway's own injected value will still take effect at runtime.

> 📷 Screenshot: Railway Service → Variables tab with the Raw Editor open

Leave `DATABASE_URL` for now — you'll come back and fill it in once you've created the database in [Section 3](#3-database). Generate the three JWT-related secrets now:

```bash
# Git Bash / macOS / Linux
openssl rand -hex 32

# Any platform with Node installed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this **three separate times** — `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `REFRESH_TOKEN_HASH_SECRET` must each be a distinct value.

### 2.7 Generate a public domain for the API

1. Go to **Settings → Networking**.
2. Under **Public Networking**, click **Generate Domain**.
3. Railway assigns something like `elev8-server-production.up.railway.app`. Confirm it responds once deployed (Section 2.9) — you will later point a custom subdomain (`api.elev8calisthenicsgoa.com`) at this same service in [Section 8](#8-spaceship-domain).

> 📷 Screenshot: Railway Service → Settings → Networking → Generate Domain button

### 2.8 Trigger the first deploy

1. Go to the **Deployments** tab.
2. Click **Deploy** (or push a commit to `main` — either triggers a build).
3. Watch the build log in real time.

> 📷 Screenshot: Railway Deployments tab showing a build in progress with live logs

A healthy first deploy log ends with something like:

```
ELEV8 API listening on http://localhost:5000 (production)
```

> **Warning:** The very first deploy will fail at the `DATABASE_URL` step if you haven't completed [Section 3](#3-database) yet — that's expected. Come back to this step after the database is provisioned and `DATABASE_URL` is filled in.

### 2.9 Confirm the health endpoint

Once live, open the Railway-generated domain in a browser or with `curl`:

```bash
curl https://elev8-server-production.up.railway.app/health
curl https://elev8-server-production.up.railway.app/ready
```

| Endpoint | Checks | Expected response |
|---|---|---|
| `GET /health` | Process is running (no DB call) | `200 { "success": true, "data": { "status": "ok", ... } }` |
| `GET /ready` | Process **and** database are reachable (`SELECT 1`) | `200` if DB reachable, `503` if not |

`/ready` failing with `503` almost always means `DATABASE_URL` is wrong or the database isn't reachable yet — see [Section 14](#14-troubleshooting).

### 2.10 Logs, restarting, and redeploying

**Viewing logs:**
- **Deployments tab → click a deployment → Logs** shows build logs.
- **Observability / Logs tab** (or the log pane on the service overview) shows live runtime logs (everything from Pino, including request logs).

> 📷 Screenshot: Railway Service → Logs tab showing live application output

**Restarting** (same code, fresh process — useful if the app is in a bad in-memory state):
- Go to **Deployments**, find the active deployment, click the **⋮** menu → **Restart**.

**Redeploying** (re-run the build from the same commit — useful after fixing environment variables):
- **Deployments → ⋮ → Redeploy**, or push a new commit to `main` for a fresh build.

**Rolling back** (revert to a previously-working deployment instantly):
- **Deployments** tab → find an older, known-good deployment → **⋮ → Redeploy**. Railway keeps every past deployment available for instant rollback without needing a new git commit.

---

## 3. Database

You have two supported options. **Railway PostgreSQL** is the path of least friction (same dashboard, automatic variable wiring). **Neon** is a good choice if you want your database decoupled from your compute host (e.g., you might move the API off Railway later but keep the same database). This guide defaults to Railway and calls out Neon as an alternative at each step.

### 3.1 Option A — Railway PostgreSQL (recommended default)

1. In the same Railway **project** as your `server` service (not a new project), click **+ New** (or right-click the canvas) → **Database → Add PostgreSQL**.
2. Railway provisions a managed Postgres instance in a few seconds and adds it as a new service tile in your project canvas.

> 📷 Screenshot: Railway project canvas showing the `server` service and a new `Postgres` service tile connected

3. Click the new **Postgres** service → **Variables** tab. Note the auto-generated `DATABASE_URL` (Railway also exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` individually, but you only need `DATABASE_URL`).
4. Go back to your **server** service → **Variables**, and set:
   ```
   DATABASE_URL=${{ Postgres.DATABASE_URL }}
   ```
   Typing `${{` in the Railway variable editor opens an autocomplete that lets you reference another service's variable directly — pick **Postgres → DATABASE_URL**. This keeps the two services wired together automatically: if the database's credentials ever change, your API's variable updates with them, with no copy-pasting.

> 📷 Screenshot: Railway Variables tab showing the `${{ Postgres.DATABASE_URL }}` reference autocomplete

5. Redeploy the `server` service (**Deployments → ⋮ → Redeploy**) so it picks up the new variable.

### 3.2 Option B — Neon PostgreSQL (alternative)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. Click **Create a project**. Name it `elev8-production`, choose a region close to your Railway service's region (reduces latency between API and DB), and choose the current Postgres version (16 or later).
3. On the project's **Dashboard**, find the **Connection string** panel.
4. Neon gives you two connection strings — **Pooled connection** and **Direct connection**. For this project, use the **Direct connection** string as `DATABASE_URL` (this codebase uses a single `DATABASE_URL` for both migrations and runtime queries via `@prisma/adapter-pg`; pooled/PgBouncer connections need extra Prisma configuration that isn't set up yet — see [Section 16](#16-future-scaling) if you want to add pooling later).
5. Copy that string — it looks like:
   ```
   postgresql://neondb_owner:REPLACE_ME@ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
6. In Railway, go to your `server` service → **Variables** → set `DATABASE_URL` to this string directly (paste it in, since it's an external service Railway can't autocomplete).

> **Note:** Neon's free tier auto-suspends an inactive database after a period of no traffic. The first request after a suspend will be slower (a "cold start" while Neon resumes compute) — acceptable for a low-traffic launch, worth knowing about if you see an occasional slow first request.

### 3.3 Run migrations against the new database

If you deployed via the **Dockerfile** method in Section 2, migrations already ran automatically on container start (`npx prisma migrate deploy && node dist/index.js`) — you can skip to 3.4 to verify.

To run migrations manually (useful for the very first deploy, or to run them ahead of a deploy):

1. Install the Railway CLI locally:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
2. Link your local `server/` folder to the Railway service:
   ```bash
   cd server
   railway link
   ```
   Select your project and the `server` service when prompted.
3. Run the migration command with Railway's environment injected:
   ```bash
   railway run npx prisma migrate deploy
   ```

> 📷 Screenshot: Terminal output of `railway run npx prisma migrate deploy` applying migrations

### 3.4 Seed data (optional — demo/QA data only)

`server/prisma/seed.ts` creates a demo member account and sample bookings. It is **safe to re-run** (everything is upsert-or-skip), but it is meant for local development and manual QA — not something you'd normally run against real production data.

```bash
cd server
railway run npm run prisma:seed
```

This creates a demo login: `demo@elev8.fit` / `password123`. If you seed production for launch-day demo purposes, **delete or change this account's password before announcing the site publicly** — it's a well-known, publicly-documented credential.

### 3.5 Resetting the database

> **🚨 Warning — destructive.** `prisma migrate reset` drops every table and re-applies migrations from scratch. Never run this against production once real user data exists. It is included here only because you may need it once, before launch, to recover from a bad first migration.

```bash
railway run npx prisma migrate reset
```

It will prompt for confirmation before doing anything. Prefer this only pre-launch; after launch, use a proper migration or a manual, reviewed SQL fix instead.

### 3.6 Prisma Studio against the production database

Prisma Studio gives you a spreadsheet-like GUI over your database — useful for manually checking a booking or a user record without writing SQL.

```bash
cd server
railway run npm run prisma:studio
```

This opens `http://localhost:5555` in your browser, connected through Railway's environment to your **production** database.

> **🚨 Warning:** Studio launched this way has full read/write access to production data. Close it when you're done, and never leave it running unattended on a shared machine.

### 3.7 Backup recommendations

| Provider | Built-in backups | Recommendation |
|---|---|---|
| **Railway Postgres** | No automatic backups on the base plan | Set up a scheduled `pg_dump` (see below) or upgrade to a plan/add-on with backups before you have real user data you can't afford to lose |
| **Neon** | Point-in-time restore (up to your plan's retention window, e.g. 7 days on paid tiers) | Built-in — verify your plan's retention window matches your risk tolerance |

Minimal manual backup, runnable from any machine with the Railway CLI or a raw `DATABASE_URL`:

```bash
pg_dump "$DATABASE_URL" -F c -f "elev8_backup_$(date +%Y%m%d).dump"
```

> **Recommendation:** At minimum, schedule this as a weekly cron/GitHub Actions job that uploads the dump to cloud storage (S3, Backblaze B2, etc.) once you have real member data. See [Section 16](#16-future-scaling) for a fuller backup strategy.

---

## 4. Prisma

Quick reference for the Prisma commands you'll actually use, and what each one does in this project specifically.

| Command | What it does | When to run it |
|---|---|---|
| `npm run prisma:generate` | Regenerates the Prisma Client into `server/src/generated/prisma` (custom output path — not the default `node_modules/@prisma/client`) | After every `schema.prisma` change; automatically runs as part of `npm run build` |
| `npm run prisma:migrate` | `prisma migrate dev` — creates a new migration file from schema changes **and** applies it. Local development only. | While developing new features locally |
| `npm run prisma:migrate:deploy` | `prisma migrate deploy` — applies existing migration files, does **not** generate new ones | Every production deploy (already automated in the Dockerfile `CMD`) |
| `npm run prisma:studio` | Opens the Prisma Studio GUI | Ad-hoc data inspection (Section 3.6) |
| `npm run prisma:seed` | Runs `prisma/seed.ts` | Fresh database setup / demo data only |

### 4.1 Generate

```bash
cd server
npm run prisma:generate
```

Regenerates the typed client. You rarely run this by hand in production — it's baked into `npm run build`, which both the Dockerfile and CI already call.

### 4.2 Migrate deploy (production)

```bash
npx prisma migrate deploy
```

This is the **only** migration command that should ever run against production. Unlike `migrate dev`, it never prompts, never resets data, and never generates new migration files — it strictly applies whatever is already committed in `server/prisma/migrations/`. This is exactly what the Dockerfile's `CMD` runs on every container start.

### 4.3 Studio

Covered in [Section 3.6](#36-prisma-studio-against-the-production-database).

### 4.4 Making a schema change (future migrations)

This is the workflow for **every** future change to `server/prisma/schema.prisma` after this first deployment:

```bash
# 1. Edit server/prisma/schema.prisma locally

# 2. Generate + apply a new migration against your LOCAL database
cd server
npx prisma migrate dev --name describe_your_change_here

# 3. Commit the new migration folder — it's just files on disk
git add prisma/migrations
git commit -m "db: describe your change"

# 4. Push to main (or open a PR into main)
git push
```

```mermaid
sequenceDiagram
    participant Dev as Your machine
    participant Git as GitHub (main)
    participant RW as Railway
    participant DB as PostgreSQL

    Dev->>Dev: prisma migrate dev --name x
    Dev->>Git: git push (includes new migration files)
    Git->>RW: Railway auto-deploy triggers
    RW->>RW: npm run build (prisma generate)
    RW->>DB: prisma migrate deploy (applies new migration)
    RW->>RW: node dist/index.js (start API)
```

Once Railway redeploys, `prisma migrate deploy` in the container's start command applies your new migration automatically — you never need to SSH into anything or run a manual command against production for a routine schema change.

> **Warning:** Never hand-edit a migration file that has already been applied to production, and never delete a migration folder that production has already run. Prisma tracks applied migrations in a `_prisma_migrations` table — if history on disk and history in that table disagree, `migrate deploy` will refuse to run until you resolve the drift.

---

## 5. Environment Variables

### 5.1 Development vs. production

| | Development | Production |
|---|---|---|
| Where it lives | `server/.env` (git-ignored, never committed) | Railway **Variables** tab / Vercel **Environment Variables** |
| `NODE_ENV` | `development` | `production` |
| `CLIENT_ORIGIN` | `http://localhost:5173` | `https://elev8calisthenicsgoa.com` |
| `COOKIE_SECURE` | `false` (no HTTPS locally) | `true` |
| Secrets | Placeholder values are fine | Must be real, unique, generated values — see [Section 1.5](#15-remove-development-environment-variables-from-the-repo) |

### 5.2 Backend variables (Railway)

Full reference — this mirrors `server/.env.example` and what's validated in `server/src/config/env.ts`:

| Variable | Required | Example (production) | Notes |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Enables production log formatting, disables `/api-docs` |
| `PORT` | No | *(Railway sets this automatically)* | App reads `process.env.PORT` |
| `CLIENT_ORIGIN` | Yes | `https://elev8calisthenicsgoa.com` | CORS allow-list is a **single origin** — must match exactly, including `https://` and no trailing slash |
| `LOG_LEVEL` | No | `info` | One of `fatal, error, warn, info, debug, trace, silent` |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` | Must start with `postgresql://`; from Railway Postgres or Neon |
| `JWT_ACCESS_SECRET` | Yes | *(generated, ≥16 chars)* | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Yes | *(generated, ≥16 chars)* | Must differ from `JWT_ACCESS_SECRET` |
| `REFRESH_TOKEN_HASH_SECRET` | Yes | *(generated, ≥16 chars)* | Must differ from `JWT_REFRESH_SECRET` — used to hash refresh-token identifiers before they touch the DB |
| `ACCESS_TOKEN_TTL_MIN` | No | `15` | Minutes |
| `REFRESH_TOKEN_TTL_DAYS` | No | `7` | Days |
| `RAZORPAY_KEY_ID` | No* | Live key from Razorpay dashboard | App boots without it; payment endpoints fail until set. A startup warning fires in production if it's still the placeholder |
| `RAZORPAY_KEY_SECRET` | No* | Live secret from Razorpay dashboard | Same as above |
| `COOKIE_SECURE` | No | `true` | **Must** be `true` once served over HTTPS, or login cookies silently won't be stored by the browser |

\* Required in practice if you want the booking payment flow to work — the app just won't crash without it.

### 5.3 Frontend variables (Vercel)

The current frontend calls its API via a **relative, same-origin path** (`client/src/shared/api/httpClient.ts` hardcodes `const API_BASE = "/api"`), so **no `VITE_API_URL` or similar variable is required** for the recommended deployment shape in this guide (see [Section 7](#7-connect-frontend-and-backend) for how same-origin is achieved via a Vercel rewrite).

If you later refactor the frontend to call an absolute API URL instead of a relative one, you would add:

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `https://api.elev8calisthenicsgoa.com` | Vite only exposes env vars prefixed `VITE_` to client code — anything without that prefix is invisible to the browser bundle, by design |

> **🚨 Never expose secrets to the frontend.** Anything with a `VITE_` prefix is bundled into the JavaScript shipped to every visitor's browser and is trivially readable by anyone (view source, dev tools). Never put `JWT_*`, `RAZORPAY_KEY_SECRET`, or `DATABASE_URL` in a `VITE_`-prefixed variable — only the Razorpay **public** key ID (`RAZORPAY_KEY_ID`, not the secret) would ever be safe to expose client-side if you add client-side Razorpay checkout later, since Razorpay's own SDK is designed for that key to be public.

### 5.4 General secret-handling rules

- Never commit a real `.env` file. Only `.env.example` files belong in git.
- Never paste real secrets into a GitHub issue, PR description, commit message, or chat log.
- Rotate a secret immediately if it's ever pasted somewhere it shouldn't be, even "just to test."
- Use different secrets for local development, CI, and production — this project already does this (compare `server/.env.example`'s placeholders to `.github/workflows/ci.yml`'s `ci_access_secret_min_16_chars`-style CI-only values).

---

## 6. Frontend Deployment (Vercel)

Vercel will host the `client/` React app as a static, globally-distributed build — this is a separate deployment from the backend, on a separate platform.

### 6.1 Create a Vercel account and import the project

1. Go to [vercel.com](https://vercel.com) and sign up (again, GitHub sign-in is the smoothest path).
2. From the dashboard, click **Add New… → Project**.
3. Under **Import Git Repository**, find `elev8-fitness-website` (Vercel will ask to install the **Vercel GitHub App** the first time, similar to Railway — grant it access to the repo).
4. Click **Import**.

> 📷 Screenshot: Vercel "Import Git Repository" screen with `elev8-fitness-website` listed

### 6.2 Configure the project — Root Directory

On the **Configure Project** screen, before clicking Deploy:

1. Find **Root Directory** and click **Edit**.
2. Select `client`.

> 📷 Screenshot: Vercel Configure Project screen with Root Directory set to `client`

This is the single most important setting — without it, Vercel will try to build the whole monorepo root and fail (or build the wrong thing).

### 6.3 Framework detection

Once you set the Root Directory to `client`, Vercel automatically detects **Vite** from `client/package.json` and `client/vite.config.ts`, and pre-fills:

| Setting | Auto-detected value | Leave as-is? |
|---|---|---|
| Framework Preset | Vite | Yes |
| Build Command | `npm run build` (or `vite build` — Vercel may show either) | Yes — this matches `client/package.json`'s `"build": "tsc --noEmit && vite build"` |
| Output Directory | `dist` | Yes — matches `vite build`'s default output |
| Install Command | `npm install` | Yes |

> **Note:** You generally do not need to override any of these — Vite is one of Vercel's first-class, zero-config frameworks. Only touch these fields if you see a build failure that specifically points to a wrong command being run.

### 6.4 Environment variables

As established in [Section 5.3](#53-frontend-variables-vercel), this project's frontend doesn't require any environment variables for the recommended same-origin deployment. Leave the **Environment Variables** section on this screen empty and continue.

### 6.5 Deploy

Click **Deploy**. Vercel will:

1. Clone the repo.
2. `cd client && npm install`.
3. Run the build command.
4. Deploy the static `dist/` output to its global CDN.
5. Assign a temporary URL like `elev8-fitness-website.vercel.app`.

> 📷 Screenshot: Vercel deployment progress screen (Building → Deploying → Ready)

This first deploy is a **production build**, published to a `*.vercel.app` URL — every subsequent push to `main` triggers a new production build automatically. You will attach your real domain in [Section 8](#8-spaceship-domain).

### 6.6 Preview deployments

This is automatic and requires no extra setup: every pull request opened against `main` gets its own unique, shareable preview URL (e.g., `elev8-fitness-website-git-feature-x-yourteam.vercel.app`), rebuilt on every push to that PR's branch. This lets you (or a client/stakeholder) review a change live, in the browser, before it merges — without affecting the real production site.

> 📷 Screenshot: A GitHub PR showing the Vercel bot comment with a preview deployment link

---

## 7. Connect Frontend and Backend

This is the step most first-time deployers get stuck on, so read this section fully before touching Spaceship.

### 7.1 The problem

Once deployed, your frontend and backend live on **two different domains**:

- Frontend: `elev8calisthenicsgoa.com` (Vercel)
- Backend: `api.elev8calisthenicsgoa.com` (Railway)

This project's frontend HTTP client (`client/src/shared/api/httpClient.ts`) calls the API using a **relative path**: `fetch('/api/...', { credentials: 'include' })`. It also relies on a browser cookie for authentication (JWT stored in an `httpOnly` cookie) plus a second, readable cookie for CSRF protection (`csrf_token`, double-submitted as a header). Relative-path requests only work if the browser considers the frontend and the API to be the **same origin** — otherwise `/api/...` would just try (and fail) to hit the frontend's own domain.

### 7.2 The recommended solution — a Vercel rewrite (no code changes)

Instead of making the frontend call a different domain (which would turn every request into a cross-origin request and complicate the cookie/CORS story considerably), configure Vercel to **transparently proxy** any request to `/api/*` through to the Railway backend. From the browser's point of view, it's still talking to one origin — `elev8calisthenicsgoa.com` — so cookies flow as ordinary first-party cookies, exactly like local development (where the Vite dev server proxy does the same job) and exactly like the Docker Compose setup (where nginx does the same job).

Create `client/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.elev8calisthenicsgoa.com/api/:path*"
    }
  ]
}
```

This file already exists in the repo at `client/vercel.json` — nothing to create, just push it. Vercel picks up `vercel.json` automatically on the next deploy, no dashboard configuration needed.

> **Note:** This mirrors what `client/nginx.conf` already does for the Docker Compose deployment (`location /api/ { proxy_pass http://server:5000/api/; }`) and what `client/vite.config.ts`'s dev server proxy does locally. Production is now consistent with both of your existing local setups — same pattern, three different proxies.

> **Why a rewrite, not a redirect or a direct call to the Railway URL:** A **redirect** would send the browser an HTTP 3xx pointing at `api.elev8calisthenicsgoa.com` — the browser would then issue a *second*, cross-origin request, which is exactly the problem this avoids, not a fix for it. Calling the Railway URL **directly** from frontend code (e.g. `fetch('https://api.elev8calisthenicsgoa.com/...')`) would work, but turns every request cross-origin: the `httpOnly` auth cookie and the CSRF cookie would need `SameSite=None; Secure`, the backend CORS config would need to handle credentialed cross-origin requests, and the Railway hostname would be baked into the shipped JS bundle for anyone to read. A **rewrite** keeps the browser's view of the world at exactly one origin — `elev8calisthenicsgoa.com` — so cookies stay ordinary first-party/`SameSite=Lax` cookies, no code in `client/src` needs to know the backend's real address, and swapping backend hosts later (e.g. off Railway) only ever means editing this one `destination` field.

### 7.3 CORS — still worth setting correctly

Even with the rewrite in place, keep `CLIENT_ORIGIN=https://elev8calisthenicsgoa.com` set correctly on the Railway backend ([Section 5.2](#52-backend-variables-railway)). It's your safety net: it ensures that direct browser requests to `api.elev8calisthenicsgoa.com` (bypassing the rewrite — e.g., someone testing the API directly, or a future mobile app) are still restricted to your real frontend origin, per `server/src/app.ts`:

```ts
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  })
);
```

> **Warning:** `CLIENT_ORIGIN` must match **exactly** — scheme, host, and no trailing slash. `https://elev8calisthenicsgoa.com/` (trailing slash) or `http://elev8calisthenicsgoa.com` (wrong scheme) will both cause every cross-context request to be silently rejected by the browser's CORS check.

### 7.4 Cookies over HTTPS

Set `COOKIE_SECURE=true` on Railway once your domain is live over HTTPS ([Section 9](#9-ssl) covers getting HTTPS itself). Until then, `Secure` cookies are silently dropped by browsers over plain HTTP — login will appear to succeed (a `200` response comes back) but no session cookie will actually be stored, and the next request will look logged-out. This exact failure mode is called out directly in `server/src/config/env.ts`'s startup warning, so check your Railway logs if this happens.

### 7.5 Production testing checklist

Once both the rewrite and `COOKIE_SECURE=true` are in place, verify end-to-end on the **real domain** (not the `*.vercel.app` / `*.up.railway.app` URLs, since cookie/CORS behavior can differ):

```bash
# 1. Same-origin API proxy works
curl -i https://elev8calisthenicsgoa.com/api/health

# 2. Direct backend health check still works
curl -i https://api.elev8calisthenicsgoa.com/health
```

Then in an actual browser:

1. Open DevTools → **Network** tab.
2. Visit `https://elev8calisthenicsgoa.com/sign-in` (or the equivalent route) and log in.
3. Confirm the `POST /api/auth/login` request shows `Set-Cookie` response headers, and that **Application → Cookies** shows the cookies attached to `elev8calisthenicsgoa.com` (not `api.elev8calisthenicsgoa.com`).
4. Refresh the page — you should stay logged in.
5. Submit a booking and confirm it round-trips to the database (check Prisma Studio, [Section 3.6](#36-prisma-studio-against-the-production-database), if unsure).

---

## 8. Spaceship Domain

You already own `elev8calisthenicsgoa.com` through Spaceship (see `domain/receipt.pdf`). This section wires it to Vercel (root domain + `www`) and Railway (an `api.` subdomain for the backend).

### 8.1 Understanding DNS records (quick primer)

| Record type | Purpose | Used for in this deployment |
|---|---|---|
| **A** | Points a domain directly at an IPv4 address | Root domain (`elev8calisthenicsgoa.com`) → Vercel's IP |
| **AAAA** | Same as A, but for IPv6 | Optional — Vercel provides one if you want IPv6 reachability on the root domain |
| **CNAME** | Points a subdomain at another hostname (not an IP) | `www` → Vercel; `api` → Railway |
| **TXT** | Arbitrary text, used for domain ownership verification | Vercel's/Railway's domain-verification step, if they require it before issuing SSL |

> **Note:** A root/apex domain (`elev8calisthenicsgoa.com`, no subdomain) technically cannot use a CNAME record per the DNS spec — that's why the root uses an **A** record while `www` and `api` (both subdomains) use **CNAME**.

### 8.2 Log in to Spaceship and find DNS management

1. Go to [spaceship.com](https://www.spaceship.com) and log in.
2. Go to **Your Products → Domains**.
3. Click on `elev8calisthenicsgoa.com`.
4. Find the **DNS Records** (sometimes labeled **Advanced DNS** or **DNS Zone**) tab/section.

> 📷 Screenshot: Spaceship domain management page for `elev8calisthenicsgoa.com`

### 8.3 Add the Vercel domain first (get the exact records Vercel wants)

1. In Vercel, open your project → **Settings → Domains**.
2. Type `elev8calisthenicsgoa.com` and click **Add**.
3. Vercel will show you the exact record(s) it needs. Typically:
   - **A record**, host `@`, value `76.76.21.21` (Vercel's anycast IP — always double-check the exact value Vercel's UI shows you, as it can change).
   - Vercel will also suggest adding `www.elev8calisthenicsgoa.com` and redirecting it to the root (or vice versa) — click **Add** for that too when prompted.
4. Vercel shows a **CNAME** record for `www`, typically host `www`, value `cname.vercel-dns.com`.

> 📷 Screenshot: Vercel Settings → Domains showing the required A and CNAME records

### 8.4 Enter the records in Spaceship

Back in Spaceship's DNS Records screen, add each record Vercel showed you. The exact form fields are usually **Type**, **Host/Name**, **Value/Points to**, and **TTL**.

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` *(use the exact IP Vercel's dashboard shows)* | Automatic / 3600 |
| CNAME | `www` | `cname.vercel-dns.com` | Automatic / 3600 |

Click **Save** / **Add Record** after each one.

> **Warning:** If Spaceship already has an existing **A record** on `@` (a "parking page" record, common on freshly purchased domains) or an existing **CNAME** on `www`, you must **edit/replace** it rather than add a duplicate — most DNS providers, Spaceship included, will not resolve correctly with two conflicting A records on the same host.

> 📷 Screenshot: Spaceship "Add DNS Record" form filled in for the Vercel A record

### 8.5 Add the API subdomain for Railway

1. In Railway, go to your `server` service → **Settings → Networking → Custom Domain**.
2. Click **+ Custom Domain**, enter `api.elev8calisthenicsgoa.com`, and click **Add**.
3. Railway shows you a **CNAME** target, typically something like `<random-id>.up.railway.app` — copy the exact value shown.

> 📷 Screenshot: Railway Settings → Networking → Custom Domain dialog showing the CNAME target

4. Back in Spaceship's DNS Records, add:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `api` | `<the exact value Railway showed you>` | Automatic / 3600 |

> **Note — why a subdomain, not a path:** Railway serves the whole backend on its own domain; there's no way to run the Express API "under" `elev8calisthenicsgoa.com/api` at the DNS level (that's exactly what the Vercel rewrite in [Section 7](#7-connect-frontend-and-backend) fakes for browser requests). `api.elev8calisthenicsgoa.com` is the real, direct address of the backend — useful for direct health checks, webhooks (e.g. a future Razorpay webhook URL), and debugging, even though the website itself talks to the API through the same-origin rewrite.

### 8.6 TXT record — domain verification (if requested)

If Vercel or Railway flags the domain as needing ownership verification (usually only if the domain was recently transferred, or added to another Vercel/Railway account previously), they'll show a **TXT** record to add, typically:

| Type | Host | Value |
|---|---|---|
| TXT | `_vercel` (or similar, exact host given in-dashboard) | *(verification string shown in-dashboard)* |

Copy the exact host and value shown — these are unique per domain and per account, so there's no generic value to reuse here.

### 8.7 Verify DNS propagation

DNS changes are not instant — they can take anywhere from a few minutes to 48 hours to propagate globally, though Spaceship + Vercel/Railway is typically well under an hour in practice.

```bash
# Check the root domain's A record
nslookup elev8calisthenicsgoa.com

# Check the www CNAME
nslookup www.elev8calisthenicsgoa.com

# Check the api CNAME
nslookup api.elev8calisthenicsgoa.com
```

Or use [dnschecker.org](https://dnschecker.org) to see propagation status across many global DNS resolvers at once.

> 📷 Screenshot: dnschecker.org showing green checkmarks for `elev8calisthenicsgoa.com` across multiple locations

Once DNS resolves, both Vercel and Railway will automatically detect the valid record and move the domain's status from "Pending" to "Active" / "Valid" in their respective dashboards — no manual "check again" click needed, though both platforms do offer one if you don't want to wait for the automatic recheck.

---

## 9. SSL

### 9.1 Automatic certificates

Both Vercel and Railway automatically provision free TLS certificates (via Let's Encrypt) for any domain you attach, **once DNS is correctly pointed at them** (Section 8). You do not upload or configure a certificate manually.

- **Vercel**: issues certificates for `elev8calisthenicsgoa.com` and `www.elev8calisthenicsgoa.com` automatically after the domain shows "Valid Configuration" in **Settings → Domains**.
- **Railway**: issues a certificate for `api.elev8calisthenicsgoa.com` automatically after the CNAME resolves, shown as a green checkmark next to the custom domain in **Settings → Networking**.

> 📷 Screenshot: Vercel Domains tab showing a green "Valid Configuration" / SSL-active status

### 9.2 Verification

```bash
curl -vI https://elev8calisthenicsgoa.com 2>&1 | grep -i "SSL certificate"
curl -vI https://api.elev8calisthenicsgoa.com 2>&1 | grep -i "SSL certificate"
```

Or simply open each URL in a browser and check for the padlock icon — click it to inspect the certificate issuer (should show Let's Encrypt or Vercel's/Railway's certificate authority) and expiry date.

> **Note:** Certificates auto-renew before expiry on both platforms — there is nothing to schedule or remember here.

### 9.3 Force HTTPS

Both platforms redirect plain `http://` requests to `https://` automatically for custom domains — no configuration needed. You can confirm this:

```bash
curl -I http://elev8calisthenicsgoa.com
# Expect: HTTP/1.1 301/308 redirect, Location: https://elev8calisthenicsgoa.com
```

If you ever add a reverse proxy or CDN in front of these platforms later, ensure it preserves this redirect rather than terminating TLS and forwarding plain HTTP internally without the app knowing — see the `COOKIE_SECURE` / trusted-proxy notes in [Section 10](#10-production-security).

---

## 10. Production Security

Most of this project's production security posture already exists in code — this section documents what's already there, and flags the two gaps worth closing before launch.

### 10.1 Helmet

Already wired in `server/src/app.ts`:

```ts
app.use(helmet());
```

Sets a standard set of protective HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, a conservative default Content-Security-Policy, etc.) with sane defaults. No action needed for launch; revisit if you later embed third-party widgets that need a relaxed CSP.

### 10.2 Rate limiting

Already wired via `express-rate-limit` (`server/src/shared/middleware/rateLimit.ts`):

| Limiter | Window | Limit | Applies to |
|---|---|---|---|
| `globalRateLimiter` | 15 min | 300 requests | Every route |
| `authRateLimiter` | 15 min | 20 requests | `/api/auth/*` only — mitigates credential stuffing |

> **🚨 Action required before launch — trusted proxy setting.** `express-rate-limit` (and `req.ip` generally) determines the caller's IP from the `X-Forwarded-For` header, which is only trustworthy if Express is told to trust the proxy in front of it. Railway sits behind its own edge proxy, so add this **once**, near the top of `createApp()` in `server/src/app.ts`, before the app is deployed:
> ```ts
> app.set("trust proxy", 1);
> ```
> Without this, `express-rate-limit` will either rate-limit every visitor as if they share one IP (the proxy's), or throw a validation error at request time — see [Section 14](#14-troubleshooting) for the exact symptom if you skip this and hit it in production.

### 10.3 Compression

Not currently enabled in `server/src/app.ts`. For a JSON API of this size, response bodies are small enough that this is a minor, optional win rather than a launch blocker. If you want it:

```bash
cd server
npm install compression
npm install -D @types/compression
```

```ts
import compression from "compression";
app.use(compression());
```

Add this early in the middleware chain, before your routes.

### 10.4 Trusted proxies

Covered in 10.2 — `app.set("trust proxy", 1)` is the relevant setting for both Railway (rate limiting accuracy) and correctly detecting HTTPS termination if you ever add proxy-aware secure-redirect logic.

### 10.5 CORS

Covered in [Section 7.3](#73-cors--still-worth-setting-correctly). Single allow-listed origin via `CLIENT_ORIGIN`, credentials enabled for cookie-based auth.

### 10.6 Environment validation

Already enforced by `server/src/config/env.ts` — a Zod schema validates every environment variable at boot, and the process exits immediately (`process.exit(1)`) with a clear error if anything required is missing or malformed. This is intentional fail-fast behavior: you want a misconfigured deploy to fail loudly in Railway's logs, not start up in a broken state and fail mysteriously on the first real request.

### 10.7 Error handling

Already wired via `notFoundHandler` and `errorHandler` in `server/src/app.ts` (registered last, after all routes) — unhandled errors are caught centrally rather than leaking raw stack traces to API responses.

### 10.8 Logging

Already configured via Pino (`server/src/config/logger.ts`) with **automatic redaction** of sensitive fields — cookies, authorization headers, passwords, tokens, and Razorpay signatures are all replaced with `[redacted]` in every log line, including Pino's automatic request/response logging. Production uses structured JSON output (no `pino-pretty` transport in production, matching `isProduction` in `logger.ts`) — this is what you want feeding into Railway's log viewer or any external log aggregator ([Section 11](#11-monitoring)).

---

## 11. Monitoring

### 11.1 Railway logs

**Service → Logs** (or the **Observability** tab, naming varies slightly by Railway UI version) shows live, structured JSON logs from Pino, including every HTTP request (method, path, status, duration) except `/health` and `/ready`, which are deliberately excluded from request logging to avoid drowning real traffic in health-check noise.

> 📷 Screenshot: Railway Logs tab with a live stream of JSON request logs

Use Railway's built-in log search/filter to look for `"level":50` (error) or `"level":60` (fatal) — Pino's numeric log levels — when investigating an incident.

### 11.2 Vercel logs

**Project → Logs** (or **Observability**) tab shows build logs for every deployment plus runtime logs for any serverless functions — this project has none (it's a static SPA), so Vercel logs here are mainly useful for diagnosing failed builds.

> 📷 Screenshot: Vercel Logs tab showing a deployment's build output

### 11.3 Health endpoint monitoring

You already have the right primitive — `GET /ready` on the Railway domain checks both process liveness and database connectivity in one call:

```
https://api.elev8calisthenicsgoa.com/ready
```

### 11.4 UptimeRobot (recommended, free tier)

1. Sign up at [uptimerobot.com](https://uptimerobot.com).
2. **+ Add New Monitor**.
3. **Monitor Type**: HTTP(s).
4. **Friendly Name**: `ELEV8 API — /ready`.
5. **URL**: `https://api.elev8calisthenicsgoa.com/ready`.
6. **Monitoring Interval**: 5 minutes (free tier).
7. Add a second monitor for the frontend: **URL** `https://elev8calisthenicsgoa.com`, expecting a `200`.
8. Under **Alert Contacts**, add your email (and optionally SMS/Slack on paid tiers) so you're notified the moment either goes down.

> 📷 Screenshot: UptimeRobot dashboard showing two green "Up" monitors

### 11.5 BetterStack (alternative/upgrade path)

BetterStack (formerly Better Uptime) offers a similar uptime-monitoring product plus log management and status pages, useful once you outgrow UptimeRobot's free tier or want a public status page (`status.elev8calisthenicsgoa.com`) for members to check during an incident. Not required for launch — evaluate later under [Section 16](#16-future-scaling).

---

## 12. CI/CD

### 12.1 What's already automated

`.github/workflows/ci.yml` already runs on every push and pull request against `main`:

```mermaid
flowchart TD
    Push["git push to main / open PR"] --> CI["GitHub Actions: CI"]
    CI --> S["server job:\ntypecheck → lint → migrate → test\n(against a real ephemeral Postgres)"]
    CI --> C["client job:\ntypecheck → lint → build"]
    S -->|pass| Merge["Safe to merge / already on main"]
    C -->|pass| Merge
    Merge --> RW["Railway: auto-deploy server/"]
    Merge --> VC["Vercel: auto-deploy client/"]
```

This is a **build/test gate**, not a deploy step — CI proves the code is healthy; Railway and Vercel each independently watch the same GitHub repo and redeploy themselves whenever `main` changes.

### 12.2 Automatic deploy

No extra configuration needed — this is the default behavior once you've connected each service to GitHub in Sections 2 and 6:

- **Railway**: any push to `main` (that touches files under `server/`, if you've scoped watch paths — otherwise any push) triggers a new build + deploy of the `server` service.
- **Vercel**: any push to `main` triggers a new production build + deploy of the `client` project.

You can scope Railway to only redeploy on changes under `server/` via **Settings → Source → Watch Paths**, `server/**` — this avoids an unnecessary backend redeploy when you only touched frontend code. Vercel does this automatically for monorepos via its Root Directory setting.

### 12.3 Rollback

- **Railway**: **Deployments** tab → pick any previous successful deployment → **⋮ → Redeploy**. Instant — no rebuild needed, Railway keeps built images.
- **Vercel**: **Deployments** tab → pick any previous production deployment → **⋮ → Promote to Production**. Also instant.

> **Note:** Neither rollback undoes a database migration. If a bad deploy included a destructive schema change, rolling back the app code does not roll back the database — plan schema changes to be backward-compatible with the previous app version where possible (e.g., add a column before removing the old one in a later deploy), especially once you have real user data.

### 12.4 Preview deployments

Covered in [Section 6.6](#66-preview-deployments) for Vercel. Railway supports the equivalent (**PR Environments**) under **Settings → Environments** if you want an ephemeral backend + database per pull request too — not required for a first launch, but useful once the team grows.

---

## 13. Deployment Checklist

The step-by-step, checkbox version of this entire guide lives in a separate file so you can tick items off during the actual deployment without scrolling through prose:

➡️ **[`docs/DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)**

---

## 14. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **Database won't connect** (`/ready` returns 503, or boot log shows "Could not connect to PostgreSQL") | Wrong/missing `DATABASE_URL`; database not provisioned yet; Neon database suspended | Confirm `DATABASE_URL` is set on the `server` Railway service and starts with `postgresql://`. For Railway Postgres, confirm you used the `${{ Postgres.DATABASE_URL }}` reference. For Neon, wake the project by visiting its dashboard, then retry. |
| **Railway build failed** | Wrong Root Directory; missing lockfile; Dockerfile path wrong | Confirm **Settings → Source → Root Directory** is exactly `server`. Confirm `server/package-lock.json` is committed (Dockerfile runs `npm ci`, which requires it). Check the build log for the exact failing step. |
| **Prisma errors on deploy** (`P3009`, migration drift, `Environment variable not found: DATABASE_URL`) | Migration history mismatch between `prisma/migrations/` on disk and the `_prisma_migrations` table; or `DATABASE_URL` not present at build/start time | Never hand-edit applied migration files. For drift, inspect `railway run npx prisma migrate status`. For the env var error, confirm `DATABASE_URL` is set as a **Variable** on the service (not just locally) before deploying. |
| **CORS errors in browser console** (`No 'Access-Control-Allow-Origin' header`) | `CLIENT_ORIGIN` doesn't exactly match the calling origin; or you're calling the Railway domain directly instead of going through the Vercel rewrite | Confirm `CLIENT_ORIGIN=https://elev8calisthenicsgoa.com` (exact scheme/host, no trailing slash) on Railway. Confirm the frontend is calling `/api/...` (same-origin, proxied) and not `https://api.elev8calisthenicsgoa.com/api/...` directly from browser JS. |
| **502 Bad Gateway** | Backend process crashed or hasn't finished booting yet; health check failing | Check Railway **Logs** for a crash/stack trace right before the 502s started. Common cause: a required env var missing, causing `process.exit(1)` at boot — the platform then can't route to a process that isn't listening. |
| **404 on a frontend route after refresh** (e.g. `/dashboard` works when navigated to from the app, but a hard refresh 404s) | Vercel isn't rewriting unknown paths to `index.html` for client-side routing | This is normally automatic for Vite/SPA frameworks on Vercel. If it's not happening, add a catch-all rewrite in `client/vercel.json` alongside the `/api` rewrite: `{ "source": "/((?!api/).*)", "destination": "/index.html" }`. |
| **404 on `/api/...` specifically** | The `client/vercel.json` rewrite isn't deployed, or the path doesn't match `/api/:path*` | Confirm `client/vercel.json` is committed and was included in the latest deploy (check the deployment's source in Vercel). Confirm the destination URL matches your real Railway domain exactly. |
| **DNS not propagating** | TTL still cached at your ISP/resolver; record entered incorrectly in Spaceship | Wait — can take up to 48h, though usually much faster. Check [dnschecker.org](https://dnschecker.org). Re-verify the exact **Host** and **Value** fields in Spaceship match what Vercel/Railway asked for, character for character. |
| **SSL "pending" / not issuing** | DNS not fully propagated yet; conflicting old DNS record still present | SSL issuance depends on DNS resolving correctly first — resolve the DNS issue above, then wait a few minutes; both platforms auto-retry issuance. |
| **"Missing environment variable" crash on boot** | A required var (see [Section 5.2](#52-backend-variables-railway)) wasn't set before deploying | Check Railway **Variables** tab against the table in Section 5.2. Redeploy after fixing — env var changes require a redeploy to take effect. |
| **Login succeeds (200) but user appears logged out on next request** | `COOKIE_SECURE=true` but site isn't actually served over HTTPS yet (or vice versa: `COOKIE_SECURE=false` in production over real HTTPS, which is merely insecure, not broken) | Confirm the domain serves `https://` (Section 9) before setting `COOKIE_SECURE=true`. Check Railway boot logs for the explicit warning `server/src/config/env.ts` prints about this exact mismatch. |
| **Rate limiter throws / blocks everyone identically** | Missing `app.set("trust proxy", 1)` behind Railway's edge proxy — see [Section 10.2](#102-rate-limiting) | Add the trust proxy setting, commit, redeploy. |
| **Deployment failures in general** | — | Always start with the platform's build/deploy log — it names the exact failing step. Reproduce the same command locally (`npm run build` in the relevant folder) before assuming it's a platform issue. |

---

## 15. Cost

Estimated **monthly** cost for a low-to-moderate traffic launch (a single-location fitness studio's marketing + booking site — not high-volume e-commerce traffic).

| Provider | Plan | Estimated monthly cost | Notes |
|---|---|---|---|
| **Railway** | Hobby plan usage-based pricing | **$5–$10** | Includes $5 of usage credit on the Hobby plan; a small always-on Node API + small Postgres instance typically lands in this range. Usage-based beyond the included credit. |
| **Vercel** | Hobby (free) | **$0** | Free tier covers a single-developer static SPA with normal traffic comfortably. Upgrade to Pro (**$20/mo**) only if you need team seats, more build minutes, or higher bandwidth than the free tier allows. |
| **Neon** *(if used instead of Railway Postgres)* | Free tier, or Launch plan | **$0–$19** | Free tier is workable for launch (with auto-suspend); Launch plan (~$19/mo) removes suspend behavior and adds more compute/storage if traffic grows. |
| **Spaceship** | Domain registration | **~$1–$2/mo** (billed yearly, ~$12–$20/yr for a `.com`) | One-time-ish annual renewal, not a recurring monthly platform charge. |
| **UptimeRobot** | Free tier | **$0** | Sufficient for a handful of monitors at 5-minute intervals. |

### Expected total monthly cost

| Scenario | Estimated total |
|---|---|
| **Railway Postgres** (recommended default) | **≈ $5–$12/month** + ~$1–2/month amortized domain cost |
| **Neon (free tier) + Railway for backend only** | **≈ $5–$10/month** + ~$1–2/month amortized domain cost |

> **Note:** These are launch-stage estimates assuming modest traffic. Revisit pricing pages directly before committing — Railway and Neon in particular are usage-based and will scale with real traffic, storage, and compute time. Set a billing alert on both platforms if available.

---

## 16. Future Scaling

Not needed for launch — listed here so the team knows what the natural next steps look like as ELEV8 grows.

| Area | What to add | Why |
|---|---|---|
| **Custom SMTP** | A transactional email provider (Postmark, Resend, SES) | Booking confirmations, password resets, and contact-form notifications currently have no email delivery layer — needed before relying on email for real member communication |
| **Redis** | Managed Redis (Railway add-on or Upstash) | Move rate-limiting and session/refresh-token state off in-process memory once you run more than one backend instance — `express-rate-limit`'s default in-memory store does not share state across multiple Railway replicas |
| **CDN** | Already partially covered — Vercel's edge network serves the frontend globally by default | Revisit only if you start self-hosting large media (class videos, galleries) outside of Vercel's own asset pipeline |
| **Object storage** | S3-compatible storage (Cloudflare R2, AWS S3, Backblaze B2) | For member-uploaded content (progress photos, documents) if that feature is ever added — don't store user uploads on Railway's ephemeral filesystem |
| **Monitoring** | Upgrade UptimeRobot → BetterStack, or add Sentry for error tracking | Structured error tracking with stack traces and user context becomes valuable once you have real traffic and can't just eyeball Railway logs |
| **Analytics** | Vercel Analytics, Plausible, or PostHog | Understand real visitor/booking funnel behavior — currently no analytics are wired in |
| **Production backups** | Automate the `pg_dump` from [Section 3.7](#37-backup-recommendations) as a scheduled job (GitHub Actions cron, or upgrade to a managed-backup DB plan) | Manual/ad-hoc backups don't scale as a real recovery strategy once you have paying members' data |
| **Connection pooling** | Add Neon's pooled connection string as a separate `directUrl` in `schema.prisma`, or add PgBouncer in front of Railway Postgres | Only needed once concurrent connections from the API start approaching your Postgres plan's connection limit |

---

*This document is maintained alongside the codebase. If a deployment step changes (a new Railway UI, a Vercel setting that moves), update this file in the same PR as the change that caused it to go stale.*
