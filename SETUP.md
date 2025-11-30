# Setup Guide - AI Chat Application with Ollama

This guide will help you set up and run the AI chat application with Ollama integration.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Ollama** - Local LLM runtime

   - Download from: https://ollama.ai/
   - Follow installation instructions for your OS

3. **Git** (optional, for version control)

## Step 1: Install Ollama and Download a Model

### Install Ollama

#### Windows

1. Download the Ollama installer from https://ollama.ai/download/windows
2. Run the installer and follow the prompts
3. Ollama will start automatically as a service

#### macOS

```bash
brew install ollama
ollama serve  # Start the Ollama service
```

#### Linux

```bash
curl https://ollama.ai/install.sh | sh
```

### Download a Model

After installing Ollama, download a model (llama2 is the default):

```bash
# Download llama2 (recommended for this application)
ollama pull llama2

# Or try other models:
# ollama pull mistral
# ollama pull codellama
# ollama pull llama2:13b  # Larger model, better quality
```

### Verify Ollama is Running

```bash
# Check if Ollama is accessible
curl http://localhost:11434/api/tags
```

You should see a JSON response with available models.

## Step 2: Install Project Dependencies

Navigate to the project directory and install dependencies:

```bash
# Install all dependencies
npm install
```

## Step 3: Configure Environment Variables

The `.env` file has been created for you with default values. You can modify it if needed:

```bash
# Server Configuration
PORT=3000                          # Backend server port
NODE_ENV=development               # Environment (development/production)

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434  # Ollama API URL
OLLAMA_MODEL=llama2                     # Model to use (must match downloaded model)
OLLAMA_TIMEOUT=30000                    # Request timeout in milliseconds

# CORS Configuration
CORS_ORIGIN=http://localhost:5173  # Frontend URL for CORS
```

### Environment Variable Details

- **PORT**: The port where the backend API will run
- **OLLAMA_BASE_URL**: URL where Ollama is running (usually localhost:11434)
- **OLLAMA_MODEL**: Name of the Ollama model to use (must be pulled first)
- **OLLAMA_TIMEOUT**: Maximum time to wait for Ollama response (in ms)
- **CORS_ORIGIN**: Allowed origin for CORS (frontend URL)

## Step 4: Run the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

The browser should automatically open to http://localhost:5173.

### Run Frontend and Backend Separately

If you prefer to run them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Step 5: Test the Application

1. Open your browser to http://localhost:5173
2. You should see the chat interface
3. Type a message and press Enter or click Send
4. The assistant will respond based on the Ollama model

### Test Messages

Try these messages to test the guardrails:

**Known Information (from Ollama training):**

- "What is Python?"
- "Explain what a variable is in programming"
- "What is machine learning?"

**Unknown Information (should return fallback):**

- "What is my name?"
- "What did I eat for breakfast?"
- "What's the weather today?"

The assistant should respond with "Sorry I do not know this information" for questions outside its knowledge.

## Step 6: Build for Production

When you're ready to deploy:

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Ollama Connection Failed

**Error**: "Chat service is temporarily unavailable"

**Solutions**:

1. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```
2. Check that the model is downloaded:
   ```bash
   ollama list
   ```
3. Restart Ollama service:
   ```bash
   # Windows: Restart from Services
   # macOS/Linux:
   pkill ollama && ollama serve
   ```
4. Verify OLLAMA_BASE_URL in `.env` is correct

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solution**: Change PORT in `.env` to a different port (e.g., 3001)

### Model Not Found

**Error**: Ollama returns 404 for model

**Solution**:

```bash
# Pull the model specified in OLLAMA_MODEL
ollama pull llama2  # or your configured model
```

### TypeScript Errors

**Error**: Type errors during development

**Solution**:

```bash
# Run type checking
npm run type-check

# Check specific file for errors
npx tsc --noEmit src/server/index.ts
```

### Slow Responses

**Issue**: Chat responses take a long time

**Solutions**:

1. Use a smaller model: `ollama pull llama2:7b`
2. Update `.env`:
   ```
   OLLAMA_MODEL=llama2:7b
   ```
3. Increase timeout if needed:
   ```
   OLLAMA_TIMEOUT=60000  # 60 seconds
   ```

## Project Structure

```
lindex/
├── src/
│   ├── server/           # Backend (Express + TypeScript)
│   │   ├── index.ts      # Server entry point
│   │   ├── config.ts     # Configuration
│   │   ├── logger.ts     # Structured logging
│   │   ├── middleware.ts # Express middleware
│   │   ├── ollama-client.ts  # Ollama integration
│   │   ├── types.ts      # TypeScript types
│   │   └── routes/
│   │       └── chat.ts   # Chat API endpoints
│   └── client/           # Frontend (React + TypeScript)
│       ├── main.tsx      # React entry point
│       ├── App.tsx       # Root component
│       ├── types.ts      # TypeScript types
│       ├── api/
│       │   └── chat.ts   # API client
│       └── components/
│           ├── ChatBox.tsx    # Chat UI component
│           └── ChatBox.css    # Styles
├── .env                  # Environment variables
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config (base)
├── tsconfig.server.json  # Server TypeScript config
├── tsconfig.client.json  # Client TypeScript config
├── vite.config.ts        # Vite config
└── index.html            # HTML template
```

## API Endpoints

### POST /api/chat

Send a chat message and receive a response.

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
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

### GET /api/health

Check API and Ollama service health.

**Response:**

```json
{
  "status": "healthy",
  "ollama": "connected"
}
```

### GET /health/live

Liveness check (is the server running?).

**Response:**

```json
{
  "status": "ok"
}
```

## Customization

### Change the Ollama Model

1. Pull the desired model:

   ```bash
   ollama pull mistral
   ```

2. Update `.env`:

   ```
   OLLAMA_MODEL=mistral
   ```

3. Restart the server

### Modify System Prompt

Edit `src/server/ollama-client.ts` and change the `SYSTEM_PROMPT` constant to customize the AI's behavior.

### Adjust Guardrails

The guardrails are enforced in two ways:

1. **System prompt**: Instructs the model to only answer known information
2. **Response filtering**: `isUncertainResponse()` checks for uncertainty phrases

Modify these in `src/server/ollama-client.ts` to adjust behavior.

## Next Steps

- Add authentication for multi-user support
- Implement conversation persistence (database)
- Add support for document upload and RAG (Retrieval Augmented Generation)
- Deploy to production (Fly.io, Vercel, etc.)

## Support

For issues or questions:

- Check the Ollama documentation: https://ollama.ai/docs
- Review the .cursorrules file for coding standards
- Check application logs for detailed error messages
