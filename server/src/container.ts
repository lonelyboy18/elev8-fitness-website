// Composition root — manual dependency injection (no DI framework, per project constraints).
// Every service takes its dependencies through its constructor; this is the single place
// concrete repositories get wired up. Phase 4 swapped the in-memory repositories for
// Prisma/PostgreSQL-backed ones below — services and controllers were not touched.

import { PrismaRefreshTokenRepository } from "./modules/auth/auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";

import { PrismaUsersRepository } from "./modules/users/users.repository.js";
import { UsersService } from "./modules/users/users.service.js";
import { UsersController } from "./modules/users/users.controller.js";

import { PrismaBookingsRepository } from "./modules/bookings/bookings.repository.js";
import { BookingsService } from "./modules/bookings/bookings.service.js";
import { BookingsController } from "./modules/bookings/bookings.controller.js";

import { PrismaPaymentsRepository } from "./modules/payments/payments.repository.js";
import { PaymentsService } from "./modules/payments/payments.service.js";
import { PaymentsController } from "./modules/payments/payments.controller.js";

import { PrismaFeedbackRepository } from "./modules/feedback/feedback.repository.js";
import { FeedbackService } from "./modules/feedback/feedback.service.js";
import { FeedbackController } from "./modules/feedback/feedback.controller.js";

import { PrismaContactRepository } from "./modules/contact/contact.repository.js";
import { ContactService } from "./modules/contact/contact.service.js";
import { ContactController } from "./modules/contact/contact.controller.js";

import { HealthController } from "./modules/health/health.controller.js";

export function buildContainer() {
  // Repositories (data layer — Postgres via Prisma; see src/db/prismaClient.ts)
  const usersRepo = new PrismaUsersRepository();
  const refreshTokenRepo = new PrismaRefreshTokenRepository();
  const bookingsRepo = new PrismaBookingsRepository();
  const paymentsRepo = new PrismaPaymentsRepository();
  const feedbackRepo = new PrismaFeedbackRepository();
  const contactRepo = new PrismaContactRepository();

  // Services (business logic — unchanged from Phase 3)
  const authService = new AuthService(usersRepo, refreshTokenRepo);
  const usersService = new UsersService(usersRepo);
  const bookingsService = new BookingsService(bookingsRepo);
  const paymentsService = new PaymentsService(paymentsRepo);
  const feedbackService = new FeedbackService(feedbackRepo);
  const contactService = new ContactService(contactRepo);

  // Controllers (HTTP layer — unchanged from Phase 3)
  const authController = new AuthController(authService, usersService);
  const usersController = new UsersController(usersService, (userId) => authService.logoutAll(userId));
  const bookingsController = new BookingsController(bookingsService);
  const paymentsController = new PaymentsController(paymentsService);
  const feedbackController = new FeedbackController(feedbackService);
  const contactController = new ContactController(contactService);
  const healthController = new HealthController();

  return {
    authController,
    usersController,
    bookingsController,
    paymentsController,
    feedbackController,
    contactController,
    healthController,
  };
}

export type Container = ReturnType<typeof buildContainer>;
