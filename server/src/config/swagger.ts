import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

/**
 * OpenAPI 3.0 spec, generated from @openapi JSDoc blocks on each module's *.routes.ts file.
 * Served at GET /api-docs (non-production only — see app.ts) via swagger-ui-express.
 */
const definition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "ELEV8 Fitness API",
    version: "1.0.0",
    description: `
REST API for the ELEV8 Fitness platform (auth, bookings, payments, feedback, contact, users).

## Authentication
Session state is carried in two httpOnly cookies set by /api/auth/register, /api/auth/login,
and /api/auth/refresh:
- **access_token** — short-lived JWT (default 15 min), path \`/\`, required by every
  \`cookieAuth\`-tagged endpoint below.
- **refresh_token** — long-lived JWT (default 7 days), path \`/api/auth\` only, used solely by
  \`POST /api/auth/refresh\` to mint a new access token. Refresh tokens rotate on every use;
  presenting an already-rotated token is treated as theft and revokes the entire token family.

Cookies are \`Secure\` whenever \`COOKIE_SECURE=true\` (required once served over HTTPS) and
always \`SameSite=Strict\`.

## CSRF
Every mutating request (POST/PATCH/DELETE) must echo the \`csrf_token\` cookie's value back in
an \`X-CSRF-Token\` header (double-submit cookie pattern). The cookie is set automatically by
any GET request (including \`GET /health\`) once a client has none yet.

## Error shape
Every error response is \`{ "success": false, "message": string }\` or, for field-level
validation failures, \`{ "success": false, "errors": { [field]: string } }\`.
    `.trim(),
  },
  servers: [{ url: "/", description: "Current origin" }],
  tags: [
    { name: "Auth", description: "Registration, login, session refresh, logout" },
    { name: "Users", description: "Profile updates and account deletion" },
    { name: "Bookings", description: "Class slot availability and reservations" },
    { name: "Payments", description: "Razorpay order creation and verification" },
    { name: "Feedback", description: "Public feedback submissions and aggregate stats" },
    { name: "Contact", description: "Public contact form" },
    { name: "Health", description: "Liveness/readiness probes" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "Set automatically on register/login/refresh. Not settable manually.",
      },
      csrfHeader: {
        type: "apiKey",
        in: "header",
        name: "X-CSRF-Token",
        description: "Must equal the current csrf_token cookie value. Required on all mutating requests.",
      },
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
      ValidationErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          errors: { type: "object", additionalProperties: { type: "string" } },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          mobile: { type: "string" },
          plan: { type: "string", enum: ["bft", "cst"] },
          subscriptionStatus: { type: "string", enum: ["inactive", "active", "expired"] },
          subscriptionExpires: { type: "string", format: "date", nullable: true },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer" },
          class_type: { type: "string", enum: ["bft", "cst"] },
          class_date: { type: "string", format: "date" },
          time_slot: { type: "string", example: "05:30" },
          status: { type: "string", enum: ["confirmed", "cancelled"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          plan: { type: "string", enum: ["bft", "cst"] },
          duration_months: { type: "integer" },
          amount_paise: { type: "integer" },
          currency: { type: "string", example: "INR" },
          status: { type: "string", enum: ["pending", "paid", "failed"] },
          razorpay_payment_id: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          paid_at: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid access_token cookie.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
      CsrfRejected: {
        description: "Missing or mismatched X-CSRF-Token header.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
      ValidationFailed: {
        description: "Field-level validation failure.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorEnvelope" } } },
      },
      Conflict: {
        description: "Business-rule conflict (duplicate, full, already exists).",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
    },
  },
};

export const openApiSpec = swaggerJsdoc({
  definition,
  apis: env.NODE_ENV === "production" ? [] : ["./src/modules/**/*.routes.ts"],
});
