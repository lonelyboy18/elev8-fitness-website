import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("GET /health", () => {
  it("reports liveness without touching the database", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ status: "ok", version: expect.any(String), uptimeSeconds: expect.any(Number) });
  });
});

describe("GET /ready", () => {
  it("reports readiness backed by a real database connectivity check", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: "ok", environment: "test", database: "connected" },
    });
  });
});
