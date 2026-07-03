# Deployment Guide

## Quick start (Docker Compose — recommended)

One command starts the whole application (client + server + Postgres):

```bash
cp .env.example .env    # fill in real secrets before anything beyond local rehearsal
docker compose up -d --build
```

- Client: http://localhost:8080
- API directly: http://localhost:5000 (also reachable through the client's own `/api` proxy)
- Postgres: `localhost:5432` (`elev8` / see `docker-compose.yml`)

`docker-compose.yml` (repo root) runs three services:

| Service    | Build context | Notes                                                             |
| ---------- | ------------- | ------------------------------------------------------------------ |
| `postgres` | `postgres:16-alpine` | Named volume `elev8_postgres_data`; healthcheck via `pg_isready` |
| `server`   | `./server`    | Runs `prisma migrate deploy` automatically on start; healthcheck hits `/ready` |
| `client`   | `./client`    | Multi-stage build → static files served by nginx; healthcheck hits `/` |

`client` waits on `server`'s healthcheck, which waits on `postgres`'s — one command, correct
startup order, no manual migration step.

### A note on cookies and HTTPS

This compose stack has **no TLS in front of it** — `COOKIE_SECURE=false` is set
deliberately so auth cookies actually reach the browser over plain HTTP. `NODE_ENV=production`
does **not** force `Secure` cookies on its own (see `docs/security.md`); if you put this
behind a real TLS-terminating proxy or load balancer, set `COOKIE_SECURE=true` — otherwise
login will appear to succeed but no cookie will actually be stored by the browser.

## Running client and server separately (local development)

```bash
# server/
cp .env.example .env    # point DATABASE_URL at a local or docker-compose-only postgres
npm install
npm run prisma:migrate:deploy
npm run dev              # http://localhost:5000

# client/  (separate terminal)
npm install
npm run dev               # http://localhost:5173, proxies /api to :5000
```

## Environment variables

See `server/.env.example` for the full annotated list. The most important ones:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `postgresql://...` — validated at startup by Zod |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | yes | ≥16 chars each; generate with `openssl rand -hex 32` |
| `REFRESH_TOKEN_HASH_SECRET` | yes | Must differ from `JWT_REFRESH_SECRET` (defense in depth) |
| `COOKIE_SECURE` | no (default `false`) | Set `true` once served over HTTPS |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | App boots without them; payment endpoints just fail until set. A startup warning fires if `NODE_ENV=production` and these are still the placeholder values |

The app **refuses to start** (`process.exit(1)`) if `DATABASE_URL`/JWT secrets are missing
or malformed — this is intentional fail-fast behavior, not a bug.

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:
- **server job**: typecheck (source + tests), lint, spins up a real `postgres:16-alpine`
  service container, runs migrations, then the full test suite.
- **client job**: typecheck, lint, production build.

There is no deploy step configured (no hosting target specified yet) — CI is a
build/test gate only.

## Production checklist

- [ ] Real `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `REFRESH_TOKEN_HASH_SECRET` (not the repo defaults)
- [ ] Real `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- [ ] `COOKIE_SECURE=true` once TLS is actually in front of the app
- [ ] `DATABASE_URL` pointing at a durable, backed-up Postgres instance (not the compose volume)
- [ ] `CLIENT_ORIGIN` set to the real deployed client origin (CORS will reject anything else)
- [ ] `LOG_LEVEL` set appropriately (`info` is a reasonable production default)
