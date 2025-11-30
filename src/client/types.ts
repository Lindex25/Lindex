export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatApiRequest {
  messages: Array<{ role: string; content: string }>;
  userMessage: string;
}

export interface ChatApiResponse {
  reply: string;
  conversationId?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}
