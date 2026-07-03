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

async function registeredClient(): Promise<TestClient> {
  const client = new TestClient(app);
  await client.get("/health");
  await client.post("/api/auth/register", validUser);
  return client;
}

describe("Payments", () => {
  it("rejects unauthenticated access to every route", async () => {
    const client = new TestClient(app);
    expect((await client.get("/api/payments")).status).toBe(401);
    expect((await client.post("/api/payments/order", { plan: "bft", duration: 1 })).status).toBe(401);
    expect(
      (
        await client.post("/api/payments/verify", {
          razorpay_payment_id: "x",
          razorpay_order_id: "y",
          razorpay_signature: "z",
        })
      ).status
    ).toBe(401);
  });

  // Payments are temporarily disabled (registration now hands off to a coach on WhatsApp instead
  // of checkout) — createOrder()/verify() always 503 regardless of input. See payments.service.ts's
  // TODO(payments) comments; the two tests below replace the old "rejects invalid duration" /
  // "rejects tampered signature" cases, which exercised validation logic that's now unreachable.
  it("createOrder is disabled — returns 503 regardless of input", async () => {
    const client = await registeredClient();
    const res = await client.post("/api/payments/order", { plan: "bft", duration: 999 });

    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/temporarily unavailable/i);
  });

  it("verify is disabled — returns 503 regardless of input", async () => {
    const client = await registeredClient();
    const res = await client.post("/api/payments/verify", {
      razorpay_payment_id: "pay_fake123",
      razorpay_order_id: "order_fake123",
      razorpay_signature: "not-a-real-hmac-signature",
    });

    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/temporarily unavailable/i);
  });

  it("starts with an empty payment history", async () => {
    const client = await registeredClient();
    const res = await client.get("/api/payments");

    expect(res.status).toBe(200);
    expect(res.body.data.data).toEqual([]);
  });
});
