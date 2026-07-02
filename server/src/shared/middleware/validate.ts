import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";

type Source = "body" | "query" | "params";

/**
 * Builds a validation middleware for the given zod schema.
 * `keyMap` renames a schema field to the error key the frontend expects
 * (e.g. legacy contact-form keys `ct-name`, or booking's `class_type` -> `type`)
 * when it differs from the schema's own field name.
 */
export function validate(source: Source, schema: ZodSchema, keyMap: Record<string, string> = {}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "form";
        const key = keyMap[path] ?? path;
        if (!errors[key]) errors[key] = issue.message;
      }
      next(AppError.validation(errors));
      return;
    }
    req[source] = result.data;
    next();
  };
}

export const validateBody = (schema: ZodSchema, keyMap?: Record<string, string>) => validate("body", schema, keyMap);
export const validateQuery = (schema: ZodSchema, keyMap?: Record<string, string>) =>
  validate("query", schema, keyMap);
export const validateParams = (schema: ZodSchema, keyMap?: Record<string, string>) =>
  validate("params", schema, keyMap);
