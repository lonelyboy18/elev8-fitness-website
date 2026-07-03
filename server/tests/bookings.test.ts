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

function nearDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function registeredClient(): Promise<TestClient> {
  const client = new TestClient(app);
  await client.get("/health");
  await client.post("/api/auth/register", validUser);
  return client;
}

describe("Bookings", () => {
  it("rejects unauthenticated access", async () => {
    const client = new TestClient(app);
    const res = await client.get("/api/bookings");
    expect(res.status).toBe(401);
  });

  it("creates, lists, and cancels a booking", async () => {
    const client = await registeredClient();
    const date = nearDate(3);

    const createRes = await client.post("/api/bookings", { class_type: "bft", date, time_slot: "05:30" });
    expect(createRes.status).toBe(200);
    expect(createRes.body.data.booking).toMatchObject({ class_type: "bft", class_date: date, time_slot: "05:30", status: "confirmed" });
    const bookingId = createRes.body.data.booking.id as number;

    const listRes = await client.get("/api/bookings");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.data).toHaveLength(1);

    const cancelRes = await client.patch(`/api/bookings/${bookingId}/cancel`);
    expect(cancelRes.status).toBe(200);

    const listAfterCancel = await client.get("/api/bookings");
    expect(listAfterCancel.body.data.data[0].status).toBe("cancelled");
  });

  it("rejects a duplicate booking for the same date and slot", async () => {
    const client = await registeredClient();
    const date = nearDate(3);

    await client.post("/api/bookings", { class_type: "bft", date, time_slot: "05:30" });
    const dup = await client.post("/api/bookings", { class_type: "bft", date, time_slot: "05:30" });

    expect(dup.status).toBe(409);
    expect(dup.body.message).toMatch(/already have a booking/i);
  });

  it("rejects booking more than 30 days ahead with a field-level error", async () => {
    const client = await registeredClient();
    const res = await client.post("/api/bookings", { class_type: "bft", date: nearDate(45), time_slot: "05:30" });

    expect(res.status).toBe(422);
    expect(res.body.errors.date).toMatch(/30 days/i);
  });

  it("enforces slot capacity across different users", async () => {
    const date = nearDate(5);
    const capacity = 15; // MAX_SLOT_CAPACITY

    for (let i = 0; i < capacity; i++) {
      const client = new TestClient(app);
      await client.get("/health");
      await client.post("/api/auth/register", { ...validUser, email: `member${i}@example.com` });
      const res = await client.post("/api/bookings", { class_type: "bft", date, time_slot: "06:30" });
      expect(res.status).toBe(200);
    }

    const overflowClient = new TestClient(app);
    await overflowClient.get("/health");
    await overflowClient.post("/api/auth/register", { ...validUser, email: "overflow@example.com" });
    const overflow = await overflowClient.post("/api/bookings", { class_type: "bft", date, time_slot: "06:30" });

    expect(overflow.status).toBe(409);
    expect(overflow.body.message).toMatch(/slot is full/i);
  });

  it("never over-books a slot when requests race for the last spots", async () => {
    const date = nearDate(7);
    const capacity = 15; // MAX_SLOT_CAPACITY
    const overbookAttempt = 5; // fire capacity + this many concurrent requests

    const clients: TestClient[] = [];
    for (let i = 0; i < capacity + overbookAttempt; i++) {
      const client = new TestClient(app);
      await client.get("/health");
      await client.post("/api/auth/register", { ...validUser, email: `racer${i}@example.com` });
      clients.push(client);
    }

    // All clients hit the same empty slot at once — without the advisory-lock transaction,
    // more than `capacity` of these can pass the count-check before any insert commits.
    const responses = await Promise.all(
      clients.map((client) => client.post("/api/bookings", { class_type: "bft", date, time_slot: "07:30" }))
    );

    const succeeded = responses.filter((res) => res.status === 200);
    const rejected = responses.filter((res) => res.status === 409);

    expect(succeeded).toHaveLength(capacity);
    expect(rejected).toHaveLength(overbookAttempt);
    for (const res of rejected) {
      expect(res.body.message).toMatch(/slot is full/i);
    }
  });

  it("reports slot availability publicly without authentication", async () => {
    const client = new TestClient(app);
    const date = nearDate(3);
    const res = await client.get(`/api/bookings/availability?date=${date}&class_type=bft`);

    expect(res.status).toBe(200);
    expect(res.body.data.capacity).toBe(15);
    expect(res.body.data.slots).toHaveLength(7);
  });
});
