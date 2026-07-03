import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app.js";
import { resetDatabase } from "./setup.js";
import { TestClient } from "./testClient.js";

const app = createApp();

const validUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  mobile: "9876543210",
  password: "password123",
  plan: "bft",
};

beforeEach(resetDatabase);

function extractCookie(res: { headers: Record<string, unknown> }, name: string): string | undefined {
  const raw = res.headers["set-cookie"] as unknown as string[] | undefined;
  return raw?.find((c) => c.startsWith(`${name}=`));
}

/** Presents a specific (possibly stolen) refresh-token cookie directly, bypassing the
 * TestClient's cookie jar, which always holds the *current* rotated token. */
async function refreshWithRawToken(refreshToken: string, csrfToken: string) {
  return request(app as unknown as Express)
    .post("/api/auth/refresh")
    .set("Cookie", [`refresh_token=${refreshToken}`, `csrf_token=${csrfToken}`])
    .set("X-CSRF-Token", csrfToken)
    .send({});
}

describe("POST /api/auth/refresh", () => {
  it("rotates the refresh token — old jti becomes unusable, new one works", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    await client.post("/api/auth/register", validUser);

    const firstRefresh = await client.post("/api/auth/refresh");
    expect(firstRefresh.status).toBe(200);
    expect(extractCookie(firstRefresh, "refresh_token")).toBeDefined();

    // The client's cookie jar now holds the rotated token; refreshing again must succeed.
    const secondRefresh = await client.post("/api/auth/refresh");
    expect(secondRefresh.status).toBe(200);
  });

  it("detects reuse of a rotated-away token and kills the whole session family", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    const registerRes = await client.post("/api/auth/register", validUser);
    const originalRefreshCookie = extractCookie(registerRes, "refresh_token")!;
    const originalRefreshToken = originalRefreshCookie.split(";")[0]!.split("=")[1]!;

    // Rotate once via the normal client (its cookie jar now holds the NEW token).
    const rotateRes = await client.post("/api/auth/refresh");
    expect(rotateRes.status).toBe(200);

    // Replay the original (now-revoked) refresh token directly — simulates a stolen cookie.
    const csrf = client.getCsrfToken()!;
    const replay = await refreshWithRawToken(originalRefreshToken, csrf);
    expect(replay.status).toBe(401);

    // Because reuse was detected, even the legitimately-rotated token must now be dead.
    const afterReuse = await client.post("/api/auth/refresh");
    expect(afterReuse.status).toBe(401);
  });
});
