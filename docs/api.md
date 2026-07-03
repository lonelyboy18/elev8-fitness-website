# API Reference

The full interactive reference — every endpoint, request/response schema, and error
shape — is generated from JSDoc comments on each route file and served live:

```
npm run dev            # in server/
open http://localhost:5000/api-docs
```

`/api-docs` is only mounted when `NODE_ENV !== "production"` (see `server/src/app.ts`) —
this is an internal API with no third-party integrators, so the spec isn't exposed
publicly. The raw OpenAPI 3.0 document is assembled in `server/src/config/swagger.ts` from
`@openapi` blocks in `server/src/modules/*/*.routes.ts`.

## Response envelope

Every response is JSON with a `success` boolean:

```jsonc
// success
{ "success": true, "message"?: "...", "data": { ... } }

// error — generic message
{ "success": false, "message": "..." }

// error — field-level validation
{ "success": false, "errors": { "email": "Enter a valid email address." } }
```

A few endpoints intentionally double-nest `data` (e.g. `GET /api/bookings` returns
`{ data: { data: [...] } }`) — this exists purely to match a generic `httpClient.get<{data:
T}>(...)` helper on the frontend and is not a documentation bug.

## Endpoint summary

| Method | Path                         | Auth        | Notes                                    |
| ------ | ---------------------------- | ----------- | ----------------------------------------- |
| GET    | `/health`                    | none        | Liveness — no DB check                    |
| GET    | `/ready`                     | none        | Readiness — checks DB connectivity        |
| POST   | `/api/auth/register`         | CSRF        | Rate-limited                              |
| POST   | `/api/auth/login`            | CSRF        | Rate-limited, no user enumeration         |
| POST   | `/api/auth/refresh`          | CSRF        | Rate-limited; rotates the refresh token   |
| POST   | `/api/auth/logout`           | CSRF        |                                            |
| POST   | `/api/auth/logout-all`       | session+CSRF| Revokes every refresh-token family        |
| GET    | `/api/auth/me`                | session     |                                           |
| PATCH  | `/api/users/me`              | session+CSRF| Update name/mobile                        |
| DELETE | `/api/users/me`              | CSRF        | Re-confirms via email+password in body    |
| GET    | `/api/bookings/availability`  | none        | Public slot capacity lookup               |
| GET    | `/api/bookings`               | session     | Most recent 60                            |
| POST   | `/api/bookings`               | session+CSRF| Locked transaction — see `docs/database.md`|
| PATCH  | `/api/bookings/:id/cancel`    | session+CSRF|                                            |
| GET    | `/api/payments`               | session     | Most recent 20                            |
| POST   | `/api/payments/order`        | session+CSRF| Creates a Razorpay order                  |
| POST   | `/api/payments/verify`       | session+CSRF| Verifies signature, activates subscription|
| GET    | `/api/feedback/stats`        | none        |                                            |
| POST   | `/api/feedback`               | CSRF        |                                            |
| POST   | `/api/contact`                | CSRF        | Error keys use legacy `ct-*` prefixes      |

## Cookies

| Cookie          | Set by                         | Path         | httpOnly | Purpose                          |
| --------------- | ------------------------------ | ------------ | -------- | --------------------------------- |
| `access_token`  | register/login/refresh          | `/`          | yes      | Short-lived JWT (15 min default)  |
| `refresh_token` | register/login/refresh          | `/api/auth`  | yes      | Long-lived JWT (7 days default)   |
| `csrf_token`    | any GET once one is missing     | `/`          | no       | Double-submit CSRF value          |

All three are `SameSite=Strict`. `Secure` is controlled entirely by `COOKIE_SECURE` (see
`docs/security.md` for why this is deliberately *not* auto-derived from `NODE_ENV`).

## JWT flow

1. `register`/`login` issue a fresh access token + a new refresh-token *family*
   (`familyId` + `jti`, both random UUIDs).
2. The access token authenticates ordinary requests (`requireAuth` middleware); once it
   expires, the frontend calls `POST /api/auth/refresh` once and retries.
3. `refresh` looks up the refresh token by its hashed `jti`. If it's already been
   rotated away (i.e. presented a second time), that's treated as a stolen token: the
   entire family is revoked, forcing re-login everywhere. Otherwise it rotates to a new
   `jti` in the same family and issues a new access token.
4. `logout` revokes just the current refresh token; `logout-all` revokes every family for
   the user.

Refresh-token `jti` values are never stored in plaintext — only an HMAC-SHA256 hash
keyed by `REFRESH_TOKEN_HASH_SECRET` (a secret intentionally separate from
`JWT_REFRESH_SECRET`).

## CSRF

Every mutating route additionally requires an `X-CSRF-Token` header equal to the current
`csrf_token` cookie value (double-submit pattern) — see `server/src/shared/middleware/csrf.ts`.
