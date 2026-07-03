# Project Structure

```
elev8-fitness-website/
├── client/                  React 18 + TypeScript + Vite SPA (Feature-Sliced Design)
│   ├── src/app/               composition root: providers, layouts, router, global CSS
│   ├── src/pages/              one folder per route
│   ├── src/widgets/            composite UI independent of any one page
│   ├── src/features/           user actions with their own state
│   ├── src/entities/           domain types + API clients
│   ├── src/shared/              framework-agnostic building blocks
│   ├── public/                 static assets (images, video, legacy loader/bootstrap JS)
│   ├── eslint.config.js        (this phase)
│   ├── .prettierrc.json        (this phase)
│   ├── Dockerfile              (this phase) — nginx-served static build
│   └── nginx.conf              (this phase) — SPA fallback + /api proxy
│
├── server/                   Node/Express/TypeScript API on PostgreSQL + Prisma 7
│   ├── src/modules/            auth, users, bookings, payments, feedback, contact, health
│   ├── src/shared/              middleware, errors, HTTP helpers
│   ├── src/db/                 Prisma client, transaction helper, token hashing
│   ├── src/config/              env (Zod), logger (Pino), constants, swagger (this phase)
│   ├── src/container.ts        composition root (manual DI)
│   ├── prisma/                  schema + hand-authored migrations + seed script
│   ├── tests/                   vitest + supertest integration tests
│   ├── eslint.config.js        (this phase)
│   ├── .prettierrc.json        (this phase)
│   └── Dockerfile               multi-stage build; runs `prisma migrate deploy` on start
│
├── Elev8/                    Legacy static PHP/MySQL site — reference only, not deployed
├── docs/                     This documentation set (this phase)
├── .github/workflows/ci.yml  CI: typecheck, lint, test, build (this phase)
├── docker-compose.yml        Full-stack local/rehearsal deployment (this phase — moved from server/)
├── .env.example              Compose-level secrets (this phase)
├── .husky/pre-commit          Runs lint-staged (this phase)
└── package.json                Root: husky + lint-staged only, no app code (this phase)
```

## Why the client and server are separate npm projects

They have entirely different runtimes, dependency graphs, and build tools (Vite vs
`tsc`); a single root `package.json` only holds tooling that genuinely spans both
(`husky`, `lint-staged`) rather than trying to unify two unrelated dependency trees into
one workspace. `docker-compose.yml` and CI treat them as independent build contexts for
the same reason.
