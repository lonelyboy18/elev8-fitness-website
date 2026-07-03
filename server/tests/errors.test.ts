import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { ZodError, z } from "zod";
import { createApp } from "../src/app.js";
import { AppError } from "../src/shared/errors/AppError.js";
import { errorHandler, notFoundHandler } from "../src/shared/middleware/errorHandler.js";

const app = createApp();

describe("404 handling", () => {
  it("returns a JSON 404 for an unknown route", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Route not found: GET /api/this-route-does-not-exist",
    });
  });
});

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler middleware (unit)", () => {
  it("renders an AppError with a plain message using its own status code", () => {
    const res = mockRes();
    errorHandler(AppError.conflict("Already booked."), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Already booked." });
  });

  it("renders an AppError with a field-error map instead of a message", () => {
    const res = mockRes();
    errorHandler(AppError.validation({ email: "Enter a valid email address." }), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, errors: { email: "Enter a valid email address." } });
  });

  it("maps a raw ZodError to a flat 422 error object", () => {
    const schema = z.object({ age: z.number() });
    const result = schema.safeParse({ age: "not a number" });
    const res = mockRes();

    errorHandler(result.error as ZodError, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.errors.age).toEqual(expect.any(String));
  });

  it("collapses any other thrown error into a generic 500 without leaking internals", () => {
    const res = mockRes();
    errorHandler(new Error("column users.ssn does not exist"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Something went wrong. Please try again." });
  });
});

describe("notFoundHandler (unit)", () => {
  it("builds the 404 message from the request method and URL", () => {
    const res = mockRes();
    notFoundHandler({ method: "DELETE", originalUrl: "/api/nope" } as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Route not found: DELETE /api/nope" });
  });
});
