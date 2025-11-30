import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./logger.js";
import {
  correlationIdMiddleware,
  requestLoggerMiddleware,
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middleware.js";
import chatRouter from "./routes/chat.js";

const app = express();

// Security headers
app.disable("x-powered-by");

// CORS configuration
app.use(
  cors({
    origin:
      config.nodeEnv === "production"
        ? config.corsOrigin
        : [config.corsOrigin, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Custom middleware
app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);

// API routes
app.use("/api", chatRouter);

// Health check at root
app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorHandlerMiddleware);

// Graceful shutdown handler
function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(() => {
    logger.info("Server closed, exiting process");
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000);
}

// Start server
const server = app.listen(config.port, () => {
  logger.info("Server started", {
    port: config.port,
    nodeEnv: config.nodeEnv,
    ollamaBaseUrl: config.ollamaBaseUrl,
    ollamaModel: config.ollamaModel,
  });
});

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection", reason);
  process.exit(1);
});
