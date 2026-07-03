# ELEV8 Fitness

Full-stack platform for ELEV8, a calisthenics/BFT studio in Goa: membership signup,
Razorpay payments, class booking with live slot availability, coach/program info, and a
public feedback/contact flow.

- **Client**: React 18 + TypeScript + Vite, Feature-Sliced Design (`client/`)
- **Server**: Node.js + Express + TypeScript, modular monolith (`server/`)
- **Database**: PostgreSQL 16 via Prisma 7
- **Payments**: Razorpay
- **Legacy**: the original static PHP/MySQL site is kept at `Elev8/` for reference only

## Quick start

```bash
cp .env.example .env
docker compose up -d --build
```

Client at http://localhost:8080, API at http://localhost:5000, interactive API docs at
http://localhost:5000/api-docs (non-production only).

For running client/server separately in local dev, environment variables, and the
production checklist, see **[docs/deployment.md](docs/deployment.md)**.

## Documentation

| Doc | Covers |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Client (FSD) + server (modular) layout and request flow |
| [docs/api.md](docs/api.md) | Endpoint summary, cookies, JWT/CSRF flow — full spec at `/api-docs` |
| [docs/database.md](docs/database.md) | Schema, indexes, migrations, the booking-race-condition fix |
| [docs/deployment.md](docs/deployment.md) | Docker Compose, env vars, CI/CD, production checklist |
| [docs/security.md](docs/security.md) | What changed this phase, what was already solid, known limitations |
| [docs/project-structure.md](docs/project-structure.md) | Directory-by-directory breakdown |

## Development

```bash
# server/
npm install && npm run prisma:migrate:deploy && npm run dev   # http://localhost:5000

# client/
npm install && npm run dev                                     # http://localhost:5173
```

Common scripts in both `client/` and `server/`: `typecheck`, `lint`, `format`,
`format:check`. Server also has `test` (vitest + supertest against a real Postgres) and
`prisma:*` scripts. A root `.husky/pre-commit` hook runs `lint-staged` on staged files in
both projects.
