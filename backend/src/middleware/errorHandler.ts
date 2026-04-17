import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// ─── Global error handler ─────────────────────────────────────
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "SERVER_ERROR";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? `'${field}'` : "A value"} already exists`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid ID format";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid token";
  }

  if (process.env.NODE_ENV !== "production") {
    logger.error(`[${req.method}] ${req.path} → ${statusCode} ${message}`, { stack: err.stack });
  } else {
    logger.error(`[${req.method}] ${req.path} → ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

// ─── 404 handler ──────────────────────────────────────────────
export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: "NOT_FOUND",
  });
}

// ─── Async wrapper ─────────────────────────────────────────────
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
