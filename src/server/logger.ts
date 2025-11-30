import { randomUUID } from "crypto";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private nodeEnv: string;

  constructor(nodeEnv: string) {
    this.nodeEnv = nodeEnv;
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    correlationId?: string,
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(correlationId && { correlationId }),
      ...(metadata && { metadata }),
    };

    // In production, use JSON format for structured logging
    if (this.nodeEnv === "production") {
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, use human-readable format
      const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : "";
      const corrStr = correlationId ? ` [${correlationId}]` : "";
      console.log(
        `[${logEntry.timestamp}] ${level}${corrStr}: ${message}${metaStr}`,
      );
    }
  }

  info(
    message: string,
    metadata?: Record<string, unknown>,
    correlationId?: string,
  ): void {
    this.log("INFO", message, metadata, correlationId);
  }

  warn(
    message: string,
    metadata?: Record<string, unknown>,
    correlationId?: string,
  ): void {
    this.log("WARN", message, metadata, correlationId);
  }

  error(
    message: string,
    error?: Error | unknown,
    correlationId?: string,
  ): void {
    const metadata: Record<string, unknown> = {};

    if (error instanceof Error) {
      metadata.error = error.message;
      metadata.stack = error.stack;
    } else if (error) {
      metadata.error = String(error);
    }

    this.log("ERROR", message, metadata, correlationId);
  }

  debug(
    message: string,
    metadata?: Record<string, unknown>,
    correlationId?: string,
  ): void {
    if (this.nodeEnv !== "production") {
      this.log("DEBUG", message, metadata, correlationId);
    }
  }

  generateCorrelationId(): string {
    return `req-${randomUUID()}`;
  }
}

export const logger = new Logger(process.env.NODE_ENV ?? "development");
