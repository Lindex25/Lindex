import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";
import type { ErrorResponse } from "./types.js";

// Extend Express Request to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Middleware to add correlation ID to each request
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const correlationId = logger.generateCorrelationId();
  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);
  next();
}

/**
 * Middleware to log incoming requests
 */
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const correlationId = req.correlationId ?? "unknown";

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      "Request completed",
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration_ms: duration,
      },
      correlationId,
    );
  });

  logger.info(
    "Request received",
    {
      method: req.method,
      path: req.path,
    },
    correlationId,
  );

  next();
}

/**
 * Global error handler middleware
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const correlationId = req.correlationId ?? "unknown";

  logger.error("Unhandled error", err, correlationId);

  // Never expose internal errors to clients
  const errorResponse: ErrorResponse = {
    error: "InternalServerError",
    message: "An error occurred. Please try again.",
    status: 500,
  };

  res.status(500).json(errorResponse);
}

/**
 * 404 handler for unknown routes
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  const correlationId = req.correlationId ?? "unknown";

  logger.warn("Route not found", { path: req.path }, correlationId);

  const errorResponse: ErrorResponse = {
    error: "NotFound",
    message: "Route not found",
    status: 404,
  };

  res.status(404).json(errorResponse);
}
