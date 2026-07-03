import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { resetDatabase } from "./setup.js";
import { TestClient } from "./testClient.js";

const app = createApp();

beforeEach(resetDatabase);

describe("Feedback", () => {
  it("rejects invalid input with field-level errors", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/feedback", { name: "", email: "not-an-email", rating: 9, feedback: "short" });

    expect(res.status).toBe(422);
    expect(res.body.errors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      rating: expect.any(String),
      feedback: expect.any(String),
    });
  });

  it("accepts a valid submission without requiring authentication", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/feedback", {
      name: "Jane Doe",
      email: "jane@example.com",
      rating: 5,
      feedback: "Absolutely loved the coaching and the community here.",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/thank you/i);
  });

  it("rejects a mutating request without a matching CSRF header", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    client.overrideCsrfToken(null);

    const res = await client.post("/api/feedback", {
      name: "Jane Doe",
      email: "jane@example.com",
      rating: 5,
      feedback: "Absolutely loved the coaching and the community here.",
    });

    expect(res.status).toBe(403);
  });

  it("reports aggregate stats reflecting submitted feedback", async () => {
    const client = new TestClient(app);
    await client.get("/health");
    await client.post("/api/feedback", {
      name: "Jane Doe",
      email: "jane@example.com",
      rating: 4,
      feedback: "Great experience overall, would recommend to anyone.",
    });
    await client.post("/api/feedback", {
      name: "John Roe",
      email: "john@example.com",
      rating: 2,
      feedback: "It was okay but scheduling could be improved a lot.",
    });

    const res = await client.get("/api/feedback/stats");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ average: 3, count: 2 });
  });
});

describe("Contact", () => {
  it("rejects invalid input with legacy ct-* field-level errors", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/contact", { name: "", email: "bad", phone: "123", message: "x" });

    expect(res.status).toBe(422);
    expect(res.body.errors).toMatchObject({
      "ct-name": expect.any(String),
      "ct-email": expect.any(String),
      "ct-phone": expect.any(String),
      "ct-message": expect.any(String),
    });
  });

  it("accepts a valid submission without requiring authentication", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/contact", {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "9876543210",
      message: "I'd like to know more about the calisthenics program.",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/thanks, jane/i);
  });

  it("allows an empty phone number (optional field)", async () => {
    const client = new TestClient(app);
    await client.get("/health");

    const res = await client.post("/api/contact", {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "",
      message: "I'd like to know more about the calisthenics program.",
    });

    expect(res.status).toBe(200);
  });
});
