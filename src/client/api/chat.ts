import type {
  Message,
  ChatApiRequest,
  ChatApiResponse,
  ErrorResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_TIMEOUT = 60000; // 60 seconds

export class ChatApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

/**
 * Send a chat message to the API
 */
export async function sendChatMessage(
  messages: Message[],
  userMessage: string,
): Promise<ChatApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const requestBody: ChatApiRequest = {
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      userMessage,
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "An error occurred while sending your message";

      try {
        const errorData = (await response.json()) as ErrorResponse;
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse the error response, use default message
      }

      throw new ChatApiError(response.status, errorMessage);
    }

    const data = (await response.json()) as ChatApiResponse;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ChatApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ChatApiError(408, "Request timeout. Please try again.");
    }

    throw new ChatApiError(500, "Failed to connect to chat service");
  }
}

/**
 * Check if the chat service is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
    });

    return response.ok;
  } catch {
    return false;
  }
}
