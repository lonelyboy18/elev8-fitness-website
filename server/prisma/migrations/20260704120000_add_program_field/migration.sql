-- Schema prep only (no functionality wired up yet) for future gym-management modules — see
-- docs/future-modules.md. Distinct from plan_id/plan (the membership/pricing tier): this is the
-- operational training track a member is actually enrolled in day to day. Nullable, no default —
-- existing and new users have no program until a future module sets one.
CREATE TYPE "program_id" AS ENUM ('bw', 'ct');

ALTER TABLE "users" ADD COLUMN "program" "program_id";
