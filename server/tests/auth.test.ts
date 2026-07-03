import { beforeEach, describe, expect, it } from "vitest";
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

describe("POST /api/auth/register", () => {
  it("rejects invalid input with field-level errors", async () => {
    const client = new TestClient(app);
    await client.get("/health"); // primes the csrf_token cookie

    const res = await client.post("/api/auth/register", {
      name: "",
      email: "not-an-email",
      mobile: "123",
      password: "short",
      plan: "xx",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      mobile: expect.any(String),
      password: expect.any(String),
      plan: expect.any(String),
    });
  });

  it("creates an account and sets auth cookies", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/auth/register", validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toEqual({ name: "Jane Doe", plan: "bft" });
    expect(res.body.data.redirect).toBe("/dashboard");

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh_token="))).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    await client.post("/api/auth/register", validUser);

    const client2 = new TestClient(app);
    await client2.get("/health");
    const res = await client2.post("/api/auth/register", { ...validUser, name: "Someone Else" });

    expect(res.status).toBe(422);
    expect(res.body.errors.email).toMatch(/already exists/i);
  });

  it("converts a concurrent duplicate-email race into the same 422, not a 500", async () => {
    const clients = [new TestClient(app), new TestClient(app)];
    await Promise.all(clients.map((c) => c.get("/health")));

    // Both requests pass the pre-check (findByEmail) before either commits — the unique
    // index on users.email is the real guard; this exercises that the resulting P2002 is
    // converted to the normal validation error rather than leaking as a raw 500.
    const responses = await Promise.all(clients.map((c) => c.post("/api/auth/register", validUser)));
    const statuses = responses.map((r) => r.status).sort();

    expect(statuses).toEqual([201, 422]);
    const rejected = responses.find((r) => r.status === 422)!;
    expect(rejected.body.errors.email).toMatch(/already exists/i);
  });

  it("rejects mutating requests without a matching CSRF header", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    client.overrideCsrfToken(null);

    const res = await client.post("/api/auth/register", validUser);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/login and GET /api/auth/me", () => {
  it("logs in and returns the authenticated profile", async () => {
    const register = new TestClient(app);
    await register.get("/health");
    await register.post("/api/auth/register", validUser);

    const client = new TestClient(app);
    await client.get("/health");
    const loginRes = await client.post("/api/auth/login", { email: validUser.email, password: validUser.password });
    expect(loginRes.status).toBe(200);

    const meRes = await client.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      mobile: "9876543210",
      plan: "bft",
      subscriptionStatus: "inactive",
    });
  });

  it("returns a generic error for a wrong password (no user enumeration)", async () => {
    const register = new TestClient(app);
    await register.get("/health");
    await register.post("/api/auth/register", validUser);

    const client = new TestClient(app);
    await client.get("/health");
    const res = await client.post("/api/auth/login", { email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/incorrect email or password/i);
  });

  it("rejects /me without a session", async () => {
    const client = new TestClient(app);
    const res = await client.get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
