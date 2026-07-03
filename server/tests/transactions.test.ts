import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/db/prismaClient.js";
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

describe("Cross-table transactions", () => {
  it("payment verification commits the payment AND the subscription activation atomically", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    await client.post("/api/auth/register", validUser);

    const meRes = await client.get("/api/auth/me");
    const userId: number = meRes.body.data.user.id;

    // Seed a pending payment directly (bypasses the real Razorpay HTTP call in createOrder,
    // which needs live credentials this test environment doesn't have).
    const orderId = `order_test_${Date.now()}`;
    await prisma.payment.create({
      data: { userId, plan: "cst", durationMonths: 3, amountPaise: 600000, razorpayOrderId: orderId },
    });

    const paymentId = `pay_test_${Date.now()}`;
    const signature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const verifyRes = await client.post("/api/payments/verify", {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.plan).toBe("cst");

    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: orderId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    expect(payment?.status).toBe("paid");
    expect(payment?.razorpayPaymentId).toBe(paymentId);
    expect(user?.plan).toBe("cst");
    expect(user?.subscriptionStatus).toBe("active");
    expect(user?.subscriptionExpires).not.toBeNull();
  });

  it("cascades deletes: removing a user removes their bookings, payments, and refresh tokens", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    await client.post("/api/auth/register", validUser);

    const meRes = await client.get("/api/auth/me");
    const userId: number = meRes.body.data.user.id;

    const date = new Date();
    date.setDate(date.getDate() + 3);
    await client.post("/api/bookings", {
      class_type: "bft",
      date: date.toISOString().slice(0, 10),
      time_slot: "05:30",
    });

    expect(await prisma.booking.count({ where: { userId } })).toBe(1);
    expect(await prisma.refreshToken.count({ where: { userId } })).toBeGreaterThan(0);

    const deleteRes = await client.delete("/api/users/me", {
      email: validUser.email,
      password: validUser.password,
      confirm: true,
    });
    expect(deleteRes.status).toBe(200);

    expect(await prisma.user.findUnique({ where: { id: userId } })).toBeNull();
    expect(await prisma.booking.count({ where: { userId } })).toBe(0);
    expect(await prisma.refreshToken.count({ where: { userId } })).toBe(0);
  });
});
