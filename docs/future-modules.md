# Future Modules — Architecture Readiness

None of the modules below are implemented. This document exists so the next phase that picks one
up doesn't have to re-derive where it fits — it follows the same shape as the 7 existing modules
(`auth`, `users`, `bookings`, `payments`, `feedback`, `contact`, `health`) documented in
`docs/architecture.md`.

## The pattern every module follows

```
server/src/modules/<name>/
  <name>.routes.ts       Express Router + OpenAPI JSDoc
  <name>.controller.ts   thin HTTP adapter
  <name>.service.ts      business rules
  <name>.repository.ts   Prisma queries behind an interface
  <name>.validation.ts   Zod schemas
  <name>.types.ts        DTOs
```

Wired into `server/src/container.ts` (repository → service → controller, constructor-injected)
and mounted in `server/src/app.ts` under `/api/<name>`. Client counterpart under
`client/src/entities/<name>/` (types + API client) and `client/src/features/<name>/` (UI), matching
the existing `booking`/`payment`/`feedback` slices.

The one piece of schema prep already done, ahead of any of these: `User.program` (nullable
`Program` enum, `bw`/`ct` — see `server/prisma/schema.prisma` and
`server/src/config/constants.ts`'s `ALLOWED_PROGRAMS`). Not exposed via any API yet.

## Trainer Assignment

Which coach a member is assigned to. Likely shape: `TrainerAssignment { id, userId, coachName,
assignedAt }`, or promote "coach" to a first-class `Coach` model if trainers need their own login
later (out of scope until then — the current `client/src/shared/config/coaches.ts` is a static
placeholder list, not a DB-backed entity). FK to `User`, one-to-one or one-to-many depending on
whether reassignment history matters.

## Attendance

Check-in records per booking. Likely `Attendance { id, bookingId, checkedInAt }`, FK to `Booking`
(1:1 — a booking either has a check-in or doesn't). Query pattern would mirror
`bookings.repository.ts`'s existing slot-lookup index.

## Workout Tracking

Per-session exercise logs. Likely `WorkoutLog { id, userId, date, exercises: Json }` or a
normalized `WorkoutLog` → `WorkoutSet` pair if querying individual lifts matters later. FK to
`User`.

## Diet Plans

Coach-assigned nutrition plans. Likely `DietPlan { id, userId, assignedBy, content, startDate,
endDate }`. FK to `User`; `assignedBy` would reference whatever Trainer/Coach model exists once
Trainer Assignment above is built.

## Progress Tracking

Body-metric snapshots over time (weight, measurements, skill milestones). Likely `ProgressEntry {
id, userId, recordedAt, metric, value }` — a narrow, generic shape (metric name + value) avoids a
new column per tracked metric.

## Membership Management

Broader than the current `plan`/`subscriptionStatus` fields on `User` — this would be for
multi-membership-type support, pausing/freezing, renewal history. Likely a proper `Membership`
model with its own history table, superseding the current flat `plan`/`subscriptionStatus`/
`subscriptionExpires` fields on `User` (a migration that moves those out to a related table, once
this is actually being built).

## Payment Integration (re-enablement)

Not a new module — the existing `payments` module already has everything (routes, service,
repository, Prisma `Payment` model). Re-enabling is restoring the commented-out logic in
`payments.service.ts`'s `createOrder()`/`verify()` (see the `TODO(payments)` comments there and in
`docs/security.md`) and wiring a real checkout UI into the client (none exists today — see
`docs/deployment.md`/release notes for why payments are currently off).

## Notifications

Outbound member communications (booking confirmations, reminders, coach messages). Likely a
`notifications` module with a `NotificationLog { id, userId, channel, sentAt, payload }` table and
a pluggable sender (email/SMS/WhatsApp/push) behind an interface, mirroring how `payments.service.ts`
isolates the external Razorpay HTTP call behind `createRazorpayOrder()` — the same pattern would
isolate whichever notification provider gets chosen.
