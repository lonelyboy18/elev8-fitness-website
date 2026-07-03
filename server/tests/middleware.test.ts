import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { requireRole } from "../src/shared/middleware/authenticate.js";
import { resetDatabase } from "./setup.js";
import { TestClient } from "./testClient.js";

const app = createApp();

beforeEach(resetDatabase);

const validContact = { name: "A", email: "a@example.com", phone: "", message: "Hello there, this is a test." };

describe("CSRF middleware (requireCsrf)", () => {
  it("rejects a mutating request with no CSRF cookie/header at all", async () => {
    const res = await request(app).post("/api/contact").send(validContact);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("rejects a mutating request when the header doesn't match the cookie", async () => {
    const client = new TestClient(app);
    await client.get("/health"); // primes the real csrf_token cookie
    client.overrideCsrfToken("not-the-real-token");

    const res = await client.post("/api/contact", validContact);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/security token mismatch/i);
  });

  it("accepts the request once cookie and header match", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/contact", validContact);
    expect(res.status).toBe(200);
  });
});

describe("requireAuth middleware", () => {
  it("401s when no access_token cookie is present", async () => {
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(401);
  });

  it("401s when the access_token cookie is garbage", async () => {
    const res = await request(app).get("/api/bookings").set("Cookie", ["access_token=not-a-real-jwt"]);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/session expired/i);
  });
});

describe("requireRole guard (unit — not yet wired to any route, tested directly)", () => {
  it("calls next() with no error when the user has an allowed role", () => {
    const req = { user: { id: 1, name: "A", plan: "bft", role: "member" } } as any;
    const next = vi.fn();

    requireRole("member")(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError.forbidden) when the user's role isn't allowed", () => {
    const req = { user: { id: 1, name: "A", plan: "bft", role: "member" } } as any;
    const next = vi.fn();

    requireRole("admin" as never)(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]?.statusCode).toBe(403);
  });

  it("calls next(AppError.unauthorized) when req.user is missing", () => {
    const next = vi.fn();
    requireRole("member")({} as any, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]?.statusCode).toBe(401);
  });
});

describe("rate limiter configuration (express-rate-limit wiring, isolated instance)", () => {
  it("returns 429 once a small limit is exceeded", async () => {
    const miniApp = express();
    miniApp.use(rateLimit({ windowMs: 60_000, limit: 2, standardHeaders: true, legacyHeaders: false }));
    miniApp.get("/ping", (_req, res) => res.json({ ok: true }));

    const agent = request.agent(miniApp);
    expect((await agent.get("/ping")).status).toBe(200);
    expect((await agent.get("/ping")).status).toBe(200);
    expect((await agent.get("/ping")).status).toBe(429);
  });
});

describe("validate() keyMap support", () => {
  it("maps contact validation errors onto the legacy ct-* keys", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/contact", { name: "", email: "not-an-email", phone: "123", message: "x" });

    expect(res.status).toBe(422);
    expect(res.body.errors).toMatchObject({
      "ct-name": expect.any(String),
      "ct-email": expect.any(String),
      "ct-phone": expect.any(String),
      "ct-message": expect.any(String),
    });
  });
});
