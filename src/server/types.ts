import { z } from "zod";

// Zod schemas for request validation
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(100),
  userMessage: z.string().min(1).max(10000),
});

// TypeScript types derived from schemas
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
  reply: string;
  conversationId?: string;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}
