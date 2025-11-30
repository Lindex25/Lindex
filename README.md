# Lindex - AI Chat Application with Ollama

An AI chat application with Ollama integration, featuring strict knowledge guardrails to prevent hallucination. Built with TypeScript, Express, and React.

## Features

- **🤖 Ollama Integration**: Local LLM integration with configurable models
- **🛡️ Knowledge Guardrails**: Strict system prompts and response filtering to prevent hallucination
- **💬 Real-time Chat**: Beautiful, responsive chat interface built with React
- **🔒 Type Safety**: Full TypeScript coverage with strict mode enabled
- **📝 Structured Logging**: JSON-formatted logs with correlation IDs for request tracing
- **⚡ Modern Stack**: Express.js backend, React frontend, Vite for fast dev experience
- **🎨 Beautiful UI**: Gradient design, smooth animations, responsive layout

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **Ollama** installed and running locally
- A downloaded Ollama model (e.g., llama2)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Install and start Ollama (if not already installed)
# macOS:
brew install ollama
ollama serve

# Windows: Download from https://ollama.ai/download/windows

# Linux:
curl https://ollama.ai/install.sh | sh

# 3. Download a model
ollama pull llama2

# 4. Environment variables are already configured in .env
# Modify if needed for custom setup

# 5. Start the application (both frontend and backend)
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Detailed Setup

For detailed setup instructions, troubleshooting, and configuration options, see [SETUP.md](SETUP.md).

## How It Works

### Knowledge Guardrails

The application enforces strict guardrails to prevent AI hallucination:

1. **System Prompt**: Instructs the model to only answer using known information
2. **Response Filtering**: Detects uncertainty phrases like "I don't know" or "I'm not sure"
3. **Fallback Response**: Returns `"Sorry I do not know this information"` when:
   - No relevant context is available
   - The model expresses uncertainty
   - An error occurs during processing

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │ ──HTTP─→│  Express    │ ──HTTP─→│   Ollama    │
│  Frontend   │ ←─JSON──│   API       │ ←─JSON──│   Server    │
└─────────────┘         └─────────────┘         └─────────────┘
```

1. User sends message via chat UI
2. Frontend calls `/api/chat` endpoint
3. Backend validates request with Zod schemas
4. System prompt is prepended to conversation
5. Request sent to Ollama with timeout
6. Response filtered for uncertainty
7. Fallback returned if no confident answer
8. Frontend displays response

## Project Structure

```
lindex/
├── src/
│   ├── server/                 # Backend (Express + TypeScript)
│   │   ├── index.ts            # Server entry point
│   │   ├── config.ts           # Environment configuration
│   │   ├── logger.ts           # Structured logging
│   │   ├── middleware.ts       # Express middleware
│   │   ├── ollama-client.ts    # Ollama API client with guardrails
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── routes/
│   │       └── chat.ts         # Chat API endpoints
│   └── client/                 # Frontend (React + TypeScript)
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Root component
│       ├── types.ts            # TypeScript types
│       ├── api/
│       │   └── chat.ts         # API client
│       └── components/
│           ├── ChatBox.tsx     # Chat UI component
│           └── ChatBox.css     # Component styles
├── .env                        # Environment variables
├── .env.example                # Environment template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # Base TypeScript config
├── tsconfig.server.json        # Server TypeScript config
├── tsconfig.client.json        # Client TypeScript config
├── vite.config.ts              # Vite configuration
├── index.html                  # HTML template
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## Available Scripts

```bash
# Development
npm run dev              # Run both frontend and backend
npm run dev:server       # Run backend only
npm run dev:client       # Run frontend only

# Build
npm run build            # Build both frontend and backend
npm run build:server     # Build backend only
npm run build:client     # Build frontend only

# Production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## API Endpoints

### `POST /api/chat`

Send a chat message and receive a response.

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi!" }
  ],
  "userMessage": "What is Python?"
}
```

**Response:**

```json
{
  "reply": "Python is a high-level programming language...",
  "conversationId": "req-abc-123"
}
```

### `GET /api/health`

Check API and Ollama service health.

**Response:**

```json
{
  "status": "healthy",
  "ollama": "connected"
}
```

### `GET /health/live`

Liveness probe for container orchestration.

**Response:**

```json
{
  "status": "ok"
}
```

## Configuration

All configuration is done via environment variables in `.env`:

| Variable          | Default                  | Description          |
| ----------------- | ------------------------ | -------------------- |
| `PORT`            | `3000`                   | Backend server port  |
| `NODE_ENV`        | `development`            | Environment mode     |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API URL       |
| `OLLAMA_MODEL`    | `llama2`                 | Ollama model to use  |
| `OLLAMA_TIMEOUT`  | `30000`                  | Request timeout (ms) |
| `CORS_ORIGIN`     | `http://localhost:5173`  | Allowed CORS origin  |

## Customization

### Change the AI Model

```bash
# Pull a different model
ollama pull mistral

# Update .env
OLLAMA_MODEL=mistral

# Restart the server
```

### Modify System Prompt

Edit the `SYSTEM_PROMPT` constant in `src/server/ollama-client.ts` to customize AI behavior.

### Adjust Response Filtering

Modify the `isUncertainResponse()` method in `src/server/ollama-client.ts` to change uncertainty detection.

## Troubleshooting

### Ollama Connection Failed

**Error:** "Chat service is temporarily unavailable"

**Solutions:**

1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check model is downloaded: `ollama list`
3. Restart Ollama service
4. Verify `OLLAMA_BASE_URL` in `.env`

### Port Already in Use

Change `PORT` in `.env` to a different port (e.g., 3001).

### Slow Responses

1. Use a smaller model: `ollama pull llama2:7b`
2. Update `OLLAMA_MODEL=llama2:7b` in `.env`
3. Increase `OLLAMA_TIMEOUT` if needed

See [SETUP.md](SETUP.md) for more troubleshooting tips.

## Technology Stack

- **Backend**: Express.js, TypeScript, Zod
- **Frontend**: React, TypeScript, Vite
- **AI**: Ollama (local LLM runtime)
- **Validation**: Zod schemas
- **Logging**: Structured JSON logs with correlation IDs
- **Styling**: Modern CSS with gradients and animations

## Security Features

Following the `.cursorrules` security requirements:

- ✅ Input validation with Zod schemas
- ✅ Request size limits (1MB max)
- ✅ Timeout protection (30s default)
- ✅ CORS configuration
- ✅ No sensitive data in logs
- ✅ Error messages sanitized for users
- ✅ Correlation IDs for request tracing
- ✅ TypeScript strict mode enabled
- ✅ Graceful error handling

## Next Steps

- [ ] Add user authentication
- [ ] Implement conversation persistence
- [ ] Add document upload for RAG
- [ ] Deploy to production
- [ ] Add streaming responses
- [ ] Implement rate limiting

## Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT License - Free to use for any purpose.
