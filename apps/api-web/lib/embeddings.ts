/**
 * Text Embeddings Generation Module
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE & PRIVACY NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * EMBEDDINGS-ONLY EXTERNAL CALLS:
 * • This module sends ONLY short, pre-chunked text segments to embeddings endpoints
 * • Input: Pre-extracted text chunks (typically 500-1500 characters each)
 * • Output: Vector embeddings (1536 or 3072 dimensions) for semantic search
 * • This module NEVER sends full document contents to external services
 * • This module NEVER uses chat/completion endpoints in the ingestion phase
 *
 * NO LEGAL RESEARCH OR ADVICE:
 * • This module does not perform legal research or generate legal advice
 * • Its sole purpose is to convert text chunks into searchable vector embeddings
 * • Legal analysis happens separately in user-facing RAG query APIs
 *
 * PROVIDER DATA-USAGE CONSTRAINTS (REQUIRED):
 * • The OpenAI account MUST be configured so API inputs/outputs are NOT used
 *   to train models, and logging is minimal (30-day retention for abuse monitoring only)
 * • This configuration is enforced in the provider's dashboard at:
 *   https://platform.openai.com/account/data-usage
 * • Verify "Data usage for training" is set to OFF before using this module
 * • Document this verification in your compliance/security audit logs
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  dimensions: parseInt(process.env.OPENAI_EMBEDDING_DIMENSIONS || '1536'),
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// Validate configuration
function validateConfig(): void {
  if (!config.apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for embeddings generation'
    );
  }
}

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    validateConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    });
  }
  return openaiClient;
}

// ============================================================================
// Types
// ============================================================================

export interface EmbeddingResult {
  /** The vector embedding */
  embedding: number[];

  /** Number of tokens consumed */
  tokens: number;
}

export interface BatchEmbeddingResult {
  /** Array of embeddings (same order as input) */
  embeddings: number[][];

  /** Total tokens consumed for the batch */
  totalTokens: number;
}

// ============================================================================
// Embedding Functions
// ============================================================================

/**
 * Generate embedding for a single text chunk
 *
 * PRIVACY: Only sends the text chunk to OpenAI embeddings API.
 * No full documents, no PII beyond what's in the chunk itself.
 *
 * @param text - Text chunk to embed (max ~8000 tokens for text-embedding-3-small)
 * @returns Embedding vector and token count
 * @throws Error if API call fails or text is empty
 */
export async function embedTextChunk(text: string): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text');
  }

  const client = getOpenAIClient();

  try {
    const response = await client.embeddings.create({
      model: config.model,
      input: text,
      dimensions: config.dimensions,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No embedding returned from API');
    }

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Embedding generation failed: ${message}`);
  }
}

/**
 * Generate embeddings for multiple text chunks in a single API call
 *
 * More efficient than calling embedTextChunk multiple times.
 * OpenAI API supports batching up to ~2048 inputs per request.
 *
 * PRIVACY: Only sends text chunks to OpenAI embeddings API.
 *
 * @param texts - Array of text chunks to embed
 * @param batchSize - Max chunks per API call (default: 100)
 * @returns Embeddings in the same order as input texts
 * @throws Error if any text is empty or API call fails
 */
export async function embedManyChunks(
  texts: string[],
  batchSize: number = 100
): Promise<BatchEmbeddingResult> {
  if (!texts || texts.length === 0) {
    throw new Error('Cannot embed empty array of texts');
  }

  // Validate all texts are non-empty
  const emptyIndices = texts
    .map((text, idx) => (text?.trim().length ? null : idx))
    .filter((idx) => idx !== null);

  if (emptyIndices.length > 0) {
    throw new Error(
      `Cannot embed empty text at indices: ${emptyIndices.join(', ')}`
    );
  }

  const client = getOpenAIClient();
  const allEmbeddings: number[][] = [];
  let totalTokens = 0;

  // Process in batches to respect API limits
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const response = await client.embeddings.create({
        model: config.model,
        input: batch,
        dimensions: config.dimensions,
      });

      if (!response.data || response.data.length !== batch.length) {
        throw new Error(
          `Expected ${batch.length} embeddings, got ${response.data?.length || 0}`
        );
      }

      // Sort by index to ensure correct order
      const sortedData = response.data.sort((a, b) => a.index - b.index);
      allEmbeddings.push(...sortedData.map((d) => d.embedding));

      totalTokens += response.usage?.total_tokens || 0;

      // Small delay between batches to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Batch embedding failed at index ${i}-${i + batch.length}: ${message}`
      );
    }
  }

  return {
    embeddings: allEmbeddings,
    totalTokens,
  };
}

/**
 * Estimate token count for a text string
 * Rough approximation: ~4 characters per token for English
 *
 * For precise counting, use tiktoken library.
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if text is within token limits for embedding model
 *
 * @param text - Text to check
 * @param maxTokens - Maximum allowed tokens (default: 8191 for text-embedding-3-small)
 * @returns true if within limits
 */
export function isWithinTokenLimit(
  text: string,
  maxTokens: number = 8191
): boolean {
  const estimatedTokens = estimateTokenCount(text);
  return estimatedTokens <= maxTokens;
}

/**
 * Truncate text to fit within token limits
 *
 * @param text - Text to truncate
 * @param maxTokens - Maximum allowed tokens
 * @returns Truncated text that should fit within token limit
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number = 8191
): string {
  const estimatedTokens = estimateTokenCount(text);

  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Truncate to approximately maxTokens * 4 characters
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars) + '...';
}

