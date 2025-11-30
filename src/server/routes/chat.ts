import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  ChatRequestSchema,
  type ChatResponse,
  type ErrorResponse,
} from "../types.js";
import { OllamaClient } from "../ollama-client.js";
import { config } from "../config.js";
import { logger } from "../logger.js";

const router = Router();

// Initialize Ollama client
const ollamaClient = new OllamaClient(
  config.ollamaBaseUrl,
  config.ollamaModel,
  config.ollamaTimeout,
);

/**
 * POST /api/chat
 * Send a chat message and receive a response
 */
router.post("/chat", async (req: Request, res: Response) => {
  const correlationId = req.correlationId ?? "unknown";

  try {
    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);

    if (!validation.success) {
      logger.warn(
        "Invalid chat request",
        { errors: validation.error.errors },
        correlationId,
      );

      const errorResponse: ErrorResponse = {
        error: "ValidationError",
        message: "Invalid request format",
        status: 400,
      };

      return res.status(400).json(errorResponse);
    }

    const { messages, userMessage } = validation.data;

    logger.info(
      "Processing chat request",
      {
        messageCount: messages.length,
        userMessageLength: userMessage.length,
      },
      correlationId,
    );

    // Check Ollama health before processing
    const isHealthy = await ollamaClient.healthCheck();

    if (!isHealthy) {
      logger.error("Ollama service unavailable", undefined, correlationId);

      const errorResponse: ErrorResponse = {
        error: "ServiceUnavailable",
        message: "Chat service is temporarily unavailable",
        status: 503,
      };

      return res.status(503).json(errorResponse);
    }

    // Generate response from Ollama
    const reply = await ollamaClient.generateResponse(
      messages,
      userMessage,
      correlationId,
    );

    const response: ChatResponse = {
      reply,
      conversationId: correlationId,
    };

    logger.info("Chat response sent successfully", {}, correlationId);
    return res.status(200).json(response);
  } catch (error) {
    logger.error("Chat endpoint error", error, correlationId);

    const errorResponse: ErrorResponse = {
      error: "InternalServerError",
      message: "An error occurred while processing your request",
      status: 500,
    };

    return res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/health", async (req: Request, res: Response) => {
  const correlationId = req.correlationId ?? "unknown";

  try {
    const ollamaHealthy = await ollamaClient.healthCheck();

    if (ollamaHealthy) {
      return res.status(200).json({ status: "healthy", ollama: "connected" });
    } else {
      logger.warn(
        "Health check failed: Ollama not connected",
        {},
        correlationId,
      );
      return res
        .status(503)
        .json({ status: "degraded", ollama: "disconnected" });
    }
  } catch (error) {
    logger.error("Health check error", error, correlationId);
    return res
      .status(503)
      .json({ status: "unhealthy", error: "Health check failed" });
  }
});

export default router;
