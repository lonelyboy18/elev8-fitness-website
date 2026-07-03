# Architecture

ELEV8 Fitness is a full-stack SaaS platform: a React SPA talking to a Node/Express API
backed by PostgreSQL. The legacy static PHP site (`Elev8/`) is kept in the repo as a
historical reference and is not part of the running application.

```
┌─────────────┐      HTTPS/HTTP       ┌──────────────┐      SQL (pg driver)     ┌────────────┐
│   client/   │ ────────────────────► │   server/    │ ───────────────────────► │ PostgreSQL │
│ React 18 SPA│ ◄──────────────────── │ Express API  │ ◄─────────────────────── │            │
└─────────────┘   cookies + JSON      └──────────────┘      Prisma 7 (adapter)  └────────────┘
```

## Client (`client/`) — Feature-Sliced Design

```
src/
  app/        composition root: providers, layouts, router, global styles
  pages/      one folder per route (Home, About, Programs, Membership, Coaches,
              Gallery, Contact, Feedback, SignIn, SignUp, DeleteAccount, Dashboard, 404)
  widgets/    page-independent composite UI (Navbar, SiteFooter, BackgroundVideo)
  features/   user actions with their own state (auth session, sign-in/up forms,
              booking form, feedback form)
  entities/   domain types + API client per entity (user, booking, payment, feedback)
  shared/     framework-agnostic building blocks: httpClient, UI atoms, hooks, constants
```

Dependency direction is one-way down that list (`pages` may import from anything below
it; `shared` imports from nothing else in `src/`). All 13 legacy pages were ported 1:1
with their CSS reused verbatim — this phase did not touch layout, styling, or component
logic beyond the two build-config tweaks noted in `docs/deployment.md`.

Routing is code-split: every page in `app/routes/AppRouter.tsx` is a `React.lazy` import
behind one `<Suspense>` boundary, so the initial bundle only pays for the app shell.

## Server (`server/`) — modular monolith, manual DI

```
src/
  modules/<name>/       one folder per bounded context: auth, users, bookings,
                         payments, feedback, contact, health
    <name>.routes.ts       Express Router + OpenAPI JSDoc + middleware wiring
    <name>.controller.ts   thin HTTP adapter (req/res only, no business logic)
    <name>.service.ts      business rules
    <name>.repository.ts   Prisma queries, behind an interface (IXRepository)
    <name>.validation.ts   Zod schemas + legacy error-key maps
    <name>.types.ts        DTOs shared between service and controller
  shared/middleware/     csrf, rateLimit, authenticate, validate, errorHandler, asyncHandler
  shared/errors/         AppError (statusCode + optional field-error map)
  db/                    Prisma client singleton, transaction helper, refresh-token hashing
  config/                env (Zod-validated), logger (Pino), constants, swagger
  container.ts           composition root — wires repository → service → controller
                          per module; no DI framework
```

Each module's dependencies are constructor-injected and wired once in `container.ts`.
Repositories expose an interface (`IBookingsRepository`, etc.) so a service never imports
Prisma types directly — the only place Prisma leaks into a service is via the
`xRepositoryFor(tx)` factory functions used for cross-repository transactions (payment
verification, refresh-token rotation, and the booking capacity lock — see
`docs/database.md`).

## Data flow for a typical mutating request

1. `helmet`, `cors`, `express.json`, `cookieParser`, `pino-http` (request logging),
   `globalRateLimiter`, `ensureCsrfCookie` run for every request (`app.ts`).
2. The route's own middleware chain runs next, in this order where present:
   `authRateLimiter`/`requireAuth` → `requireCsrf` → `validateBody`/`validateQuery`/`validateParams`.
3. The controller extracts the (now-validated) input and calls the service.
4. The service applies business rules and calls one or more repositories.
5. `asyncHandler` forwards any thrown error to `errorHandler`, which shapes it into the
   `{success, message}` / `{success, errors}` envelope described in `docs/api.md`.

## Why these boundaries

- **Controllers stay thin** so business rules are testable without spinning up Express.
- **Repository interfaces** mean a service's tests only need a fake implementing the
  interface, not a real database — though this project's actual test suite (see
  `docs/database.md` and `server/tests/`) exercises the real Postgres-backed
  repositories through the full HTTP stack via `supertest`, since the business logic here
  is thin enough that integration tests give more confidence per line of test code than
  unit tests with fakes would.
- **No DI framework**: the whole dependency graph is small enough (7 modules) that a
  50-line `container.ts` is easier to read and debug than a decorator-based DI container.
