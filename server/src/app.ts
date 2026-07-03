import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env, isProduction } from "./config/env.js";
import { logger } from "./config/logger.js";
import { openApiSpec } from "./config/swagger.js";
import { buildContainer } from "./container.js";
import { ensureCsrfCookie } from "./shared/middleware/csrf.js";
import { globalRateLimiter } from "./shared/middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";
import { createHealthRouter } from "./modules/health/health.routes.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createUsersRouter } from "./modules/users/users.routes.js";
import { createBookingsRouter } from "./modules/bookings/bookings.routes.js";
import { createPaymentsRouter } from "./modules/payments/payments.routes.js";
import { createFeedbackRouter } from "./modules/feedback/feedback.routes.js";
import { createContactRouter } from "./modules/contact/contact.routes.js";

export function createApp(): Express {
  const app = express();
  const container = buildContainer();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req: { url?: string }) => req.url === "/health" || req.url === "/ready" },
    })
  );
  app.use(globalRateLimiter);
  app.use(ensureCsrfCookie);

  app.use(createHealthRouter(container.healthController));

  // API docs aren't served in production — this is an internal-facing SaaS API with no
  // third-party integrators today, so there's no reason to expose route/schema detail publicly.
  if (!isProduction) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  }

  app.use("/api/auth", createAuthRouter(container.authController));
  app.use("/api/users", createUsersRouter(container.usersController));
  app.use("/api/bookings", createBookingsRouter(container.bookingsController));
  app.use("/api/payments", createPaymentsRouter(container.paymentsController));
  app.use("/api/feedback", createFeedbackRouter(container.feedbackController));
  app.use("/api/contact", createContactRouter(container.contactController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
