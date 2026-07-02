export class AppError extends Error {
  readonly statusCode: number;
  readonly errors?: Record<string, string>;

  constructor(statusCode: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string) {
    return new AppError(400, message);
  }

  static unauthorized(message = "Authentication required. Please sign in.") {
    return new AppError(401, message);
  }

  static forbidden(message: string) {
    return new AppError(403, message);
  }

  static notFound(message: string) {
    return new AppError(404, message);
  }

  static conflict(message: string) {
    return new AppError(409, message);
  }

  static validation(errors: Record<string, string>) {
    return new AppError(422, "Validation failed.", errors);
  }

  static internal(message = "Something went wrong. Please try again.") {
    return new AppError(500, message);
  }
}
