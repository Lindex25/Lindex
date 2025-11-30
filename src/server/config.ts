import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaTimeout: number;
  nodeEnv: string;
  corsOrigin: string;
}

function validateConfig(): Config {
  const port = parseInt(process.env.PORT ?? "3000", 10);
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "llama2";
  const ollamaTimeout = parseInt(process.env.OLLAMA_TIMEOUT ?? "30000", 10);
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

  // Validate configuration
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT configuration");
  }

  if (isNaN(ollamaTimeout) || ollamaTimeout < 1000) {
    throw new Error("Invalid OLLAMA_TIMEOUT configuration (minimum 1000ms)");
  }

  if (!ollamaBaseUrl.startsWith("http")) {
    throw new Error("OLLAMA_BASE_URL must start with http or https");
  }

  return {
    port,
    ollamaBaseUrl,
    ollamaModel,
    ollamaTimeout,
    nodeEnv,
    corsOrigin,
  };
}

export const config = validateConfig();
