import { logger } from "./logger.js";
import type { OllamaRequest, OllamaResponse } from "./types.js";

const SYSTEM_PROMPT = `You are a helpful AI assistant with strict knowledge boundaries.

CRITICAL RULES:
1. You must ONLY answer using information you have been explicitly given or that exists in your configured knowledge sources.
2. If you do not have relevant information to answer a question, you MUST respond EXACTLY with: "Sorry I do not know this information"
3. Do NOT make assumptions, guesses, or provide information you are uncertain about.
4. Do NOT improvise or create answers beyond what you know with certainty.
5. If a question is partially answerable, only answer the parts you know and acknowledge what you don't know.

Remember: It is better to admit you don't know than to provide incorrect or uncertain information.`;

const FALLBACK_RESPONSE = "Sorry I do not know this information";

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor(baseUrl: string, model: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeout = timeout;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      logger.error("Ollama health check failed", error);
      return false;
    }
  }

  async generateResponse(
    conversationHistory: Array<{ role: string; content: string }>,
    userMessage: string,
    correlationId: string,
  ): Promise<string> {
    try {
      const conversationContext = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
        )
        .join("\n");

      const fullPrompt = `${SYSTEM_PROMPT}\n\n${
        conversationContext
          ? `Previous conversation:\n${conversationContext}\n\n`
          : ""
      }User: ${userMessage}\nAssistant:`;

      const requestBody: OllamaRequest = {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9 },
      };

      logger.info("Calling Ollama API", { model: this.model }, correlationId);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Ollama API error", new Error(errorText), correlationId);
        return FALLBACK_RESPONSE;
      }

      const data = (await response.json()) as OllamaResponse;
      const reply = data.response.trim();

      if (!reply || reply.length === 0) {
        logger.warn("Empty response from Ollama", {}, correlationId);
        return FALLBACK_RESPONSE;
      }

      if (this.isUncertainResponse(reply)) {
        logger.info(
          "Model expressed uncertainty, returning fallback",
          {},
          correlationId,
        );
        return FALLBACK_RESPONSE;
      }

      logger.info("Ollama response generated successfully", {}, correlationId);
      return reply;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.error("Ollama request timeout", error, correlationId);
      } else {
        logger.error("Ollama request failed", error, correlationId);
      }
      return FALLBACK_RESPONSE;
    }
  }

  private isUncertainResponse(response: string): boolean {
    const uncertaintyPhrases = [
      "i don't know",
      "i'm not sure",
      "i cannot answer",
      "no information",
      "not certain",
      "unclear",
    ];
    const lowerResponse = response.toLowerCase();
    return uncertaintyPhrases.some((phrase) => lowerResponse.includes(phrase));
  }
}
