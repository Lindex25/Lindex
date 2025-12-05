/**
 * RAG (Retrieval-Augmented Generation) Query Module
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE & ETHICAL AI NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * EVIDENCE-ONLY ANSWERING:
 * • This module only answers questions about the user's uploaded evidence
 * • It never calls external legal databases, case law repositories, or statute APIs
 * • It does not perform legal research beyond what exists in the user's case space
 * • All retrieved context comes exclusively from evidence_text_chunks for the given case
 * • NO EXTERNAL LEGAL RESEARCH - only user's documents are searched
 *
 * NO LEGAL ADVICE:
 * • This module does not give legal advice or recommend legal strategies
 * • It helps users understand their own evidence, not what they should argue
 * • All responses include a disclaimer that output is not legal advice
 * • Users are always directed to consult qualified legal professionals for advice
 * • NOT A SUBSTITUTE FOR LEGAL ADVICE from qualified attorneys
 *
 * SYSTEM PROMPT CONSTRAINTS:
 * • The AI is instructed to refuse to answer if evidence is insufficient
 * • The AI cannot invent facts, cases, laws, or outcomes not present in evidence
 * • The AI must cite only what appears in the provided evidence snippets
 * • If asked for legal advice, the AI responds with a warning and referral
 * • NO CASE LAW OR LEGISLATION NAMES unless they appear in the user's evidence
 * • Cannot cite legal precedents, statutes, or authorities not in uploaded documents
 *
 * DATA FLOW:
 * 1. User question → embeddings API (vector only)
 * 2. Vector search against user's own case evidence (Postgres pgvector)
 * 3. Retrieved snippets + question → OpenAI chat completion
 * 4. Response → user with limitation notice
 *
 * CRITICAL BEHAVIORAL CONSTRAINTS:
 * • Refuses to predict case outcomes or judge decisions
 * • Refuses to recommend legal arguments or strategies
 * • Refuses to interpret laws unless the law text is in user's evidence
 * • Responds "I cannot answer this question based on the evidence available
 *   in this case space" when evidence is insufficient
 * • Always includes mandatory limitation notice with every answer
 *
 * PROVIDER DATA-USAGE CONSTRAINTS (REQUIRED):
 * • The OpenAI account MUST be configured so API inputs/outputs are NOT used
 *   to train models, and logging is minimal (30-day retention for abuse monitoring only)
 * • This configuration is enforced in the provider's dashboard at:
 *   https://platform.openai.com/account/data-usage
 * • Verify "Data usage for training" is set to OFF before using this module
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';
import { supabaseServer } from './supabase-server';
import { embedTextChunk } from './embeddings';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  temperature: 0.1, // Low temperature to reduce hallucination
  maxTokens: 1000, // Reasonable response length
  maxRetries: 3,
  timeout: 60000, // 60 seconds for chat completions
};

// Validate configuration
function validateConfig(): void {
  if (!config.openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for RAG queries'
    );
  }
}

// Initialize OpenAI client for chat completions (separate from embeddings client)
let openaiChatClient: OpenAI | null = null;

function getOpenAIChatClient(): OpenAI {
  if (!openaiChatClient) {
    validateConfig();
    openaiChatClient = new OpenAI({
      apiKey: config.openaiApiKey,
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    });
  }
  return openaiChatClient;
}

// ============================================================================
// System Prompt
// ============================================================================

export const LINDEX_SYSTEM_PROMPT = `You are LINDEX, an AI assistant that only answers using the provided evidence snippets.

If the evidence does not contain enough information, you must reply:
'I cannot answer this question based on the evidence available in this case space.'

Do not invent facts, cases, laws, or outcomes.
Do not provide legal advice, only help the user understand their own evidence.

Do not cite case law or legislation titles unless they are present in the provided evidence.

If asked for legal advice or about what they should argue in court, respond with a warning and suggest consulting a qualified legal professional.

Always base your answer only on the evidence snippets provided in this conversation. If something is not in the snippets, treat it as unknown.`;

// ============================================================================
// Types
// ============================================================================

export interface RagSource {
  /** UUID of the evidence document this snippet came from */
  evidenceId: string;

  /** Short text snippet (truncated for display) */
  snippet: string;
}

export interface RagAnswer {
  /** The AI-generated answer text */
  answerText: string;

  /** Array of evidence sources used to generate the answer */
  sources: RagSource[];

  /** Standard limitation/disclaimer notice */
  limitationNotice: string;
}

interface VectorSearchResult {
  evidence_id: string;
  chunk_content: string;
  distance: number;
}

// ============================================================================
// Main RAG Query Function
// ============================================================================

/**
 * Run a RAG query against a user's case evidence
 *
 * This function:
 * 1. Embeds the user's question
 * 2. Performs vector similarity search over case evidence
 * 3. Builds context from retrieved snippets
 * 4. Calls OpenAI chat completion with strict system prompt
 * 5. Returns answer with sources and limitation notice
 *
 * PRIVACY & SECURITY:
 * - Only searches evidence belonging to the specified user + case
 * - Only returns evidence marked as processing_status = 'READY'
 * - Enforces RLS policies via supabaseServer
 *
 * @param params - Query parameters
 * @param params.userId - Internal UUID from users table (enforces ownership)
 * @param params.caseId - Case UUID to search within
 * @param params.question - User's natural language question
 * @param params.maxSources - Maximum evidence snippets to retrieve (default: 5)
 * @returns RAG answer with sources and disclaimer
 * @throws Error if question is empty or database/API calls fail
 */
export async function runCaseRagQuery(params: {
  userId: string;
  caseId: string;
  question: string;
  maxSources?: number;
}): Promise<RagAnswer> {
  const { userId, caseId, question, maxSources = 5 } = params;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Validate Input
  // ──────────────────────────────────────────────────────────────────────────

  if (!question || question.trim().length === 0) {
    throw new Error('Question cannot be empty');
  }

  if (!userId || !caseId) {
    throw new Error('userId and caseId are required');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Embed the Question
  // ──────────────────────────────────────────────────────────────────────────

  const { embedding: questionEmbedding } = await embedTextChunk(question);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Vector Search Against Case Evidence
  // ──────────────────────────────────────────────────────────────────────────

  // Convert embedding array to pgvector format string: '[0.1, 0.2, ...]'
  const embeddingString = `[${questionEmbedding.join(',')}]`;

  // Raw SQL query for pgvector similarity search
  // Joins: evidence_embeddings → evidence_text_chunks → evidence → cases
  // Filters:
  // - cases.user_id = userId (ownership)
  // - cases.id = caseId (case isolation)
  // - evidence.processing_status = 'READY' (only processed evidence)
  // Ordering: by vector distance (cosine similarity via <-> operator)
  const { data: searchResults, error: searchError } = await supabaseServer
    .rpc('search_case_evidence_embeddings', {
      p_user_id: userId,
      p_case_id: caseId,
      p_query_embedding: embeddingString,
      p_limit: maxSources,
    })
    .returns<VectorSearchResult[]>();

  if (searchError) {
    throw new Error(`Vector search failed: ${searchError.message}`);
  }

  if (!searchResults || searchResults.length === 0) {
    // No evidence found - return a standard "no evidence" response
    return {
      answerText:
        'I cannot answer this question based on the evidence available in this case space.',
      sources: [],
      limitationNotice:
        'This answer is based only on the evidence you uploaded. It may be incomplete or inaccurate and is not legal advice.',
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Build Context and Sources
  // ──────────────────────────────────────────────────────────────────────────

  const sources: RagSource[] = [];
  const contextParts: string[] = [];

  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i];
    const fullContent = result.chunk_content;

    // Truncate snippet for source display (first 400 chars)
    const snippet =
      fullContent.length > 400
        ? fullContent.substring(0, 400).trim() + '...'
        : fullContent;

    sources.push({
      evidenceId: result.evidence_id,
      snippet,
    });

    // Add full content to context (for AI processing)
    contextParts.push(
      `Evidence snippet ${i + 1} (Evidence ID: ${result.evidence_id}):\n${fullContent}\n`
    );
  }

  const contextString = contextParts.join('\n---\n\n');

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Call OpenAI Chat Completion
  // ──────────────────────────────────────────────────────────────────────────

  const client = getOpenAIChatClient();

  const userPrompt = `Question: ${question}

Evidence snippets:

${contextString}`;

  try {
    const completion = await client.chat.completions.create({
      model: config.chatModel,
      messages: [
        {
          role: 'system',
          content: LINDEX_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const answerText =
      completion.choices[0]?.message?.content?.trim() ||
      'I cannot answer this question based on the evidence available in this case space.';

    // ────────────────────────────────────────────────────────────────────────
    // 6. Return Structured Answer
    // ────────────────────────────────────────────────────────────────────────

    return {
      answerText,
      sources,
      limitationNotice:
        'This answer is based only on the evidence you uploaded. It may be incomplete or inaccurate and is not legal advice.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenAI chat completion failed: ${message}`);
  }
}

