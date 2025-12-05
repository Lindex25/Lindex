/**
 * RAG Query API Endpoint
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE & SECURITY NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * EVIDENCE-ONLY ANSWERING:
 * • This endpoint only answers questions about evidence in a single case
 *   belonging to the authenticated user
 * • It does not access external legal databases, case law repositories,
 *   or statute APIs
 * • It does not provide legal advice or legal strategy recommendations
 * • All answers are generated exclusively from the user's uploaded evidence
 *
 * LEGAL ADVICE GUARD (DEFENSE IN DEPTH):
 * • Obvious legal-advice-style questions are detected with a simple heuristic
 *   guard and answered with a fixed warning, without calling the AI model
 * • Examples: "What should I argue?", "How do I win?", "What is the law on X?"
 * • This is a first line of defense that short-circuits inappropriate questions
 * • The AI system prompt provides a second layer of defense for questions
 *   that pass the heuristic guard
 *
 * INSUFFICIENT EVIDENCE HANDLING:
 * • When the evidence is insufficient to answer a question, the model is
 *   instructed to respond:
 *   "I cannot answer this question based on the evidence available in this case space."
 * • The system will not invent facts, cases, laws, or outcomes
 *
 * ACCESS CONTROL:
 * • Strict per-user, per-case isolation enforced
 * • User authentication required (Clerk)
 * • Case ownership verified before processing query
 * • All queries logged to audit_log and ai_queries tables for compliance
 *
 * DATA FLOW:
 * 1. User authentication via Clerk session
 * 2. Case ownership verification via Postgres
 * 3. Legal advice heuristic check (new layer)
 * 4. Question embedding + vector search (user's case evidence only)
 * 5. RAG query processing with compliance-focused system prompt
 * 6. Response with limitation notice + audit logging
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { runCaseRagQuery } from '@/lib/rag';
import { logAuditEvent, logAiQuery } from '@/lib/audit';
import {
  isLegalAdviceLikeQuestion,
  buildLegalAdviceWarningAnswer,
} from '@/lib/legal-safety';

// ============================================================================
// Types
// ============================================================================

interface RouteContext {
  params: Promise<{
    caseId: string;
  }>;
}

interface RequestBody {
  question: string;
}

interface ResponseBody {
  answer_text: string;
  sources: Array<{
    evidence_id: string;
    snippet: string;
  }>;
  limitation_notice: string;
}

// ============================================================================
// POST /api/cases/:caseId/query
// ============================================================================

/**
 * Execute a RAG query against a user's case evidence
 *
 * SECURITY:
 * - Requires authentication (Clerk session)
 * - Verifies case ownership before processing
 * - Only searches evidence within the specified case
 *
 * COMPLIANCE:
 * - Logs all queries to ai_queries table
 * - Logs audit event with full metadata
 * - Returns limitation notice with every response
 *
 * @param request - Next.js request object
 * @param context - Route context with caseId parameter
 * @returns JSON response with answer, sources, and limitation notice
 */
export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ResponseBody | { error: string }>> {
  try {
    // ──────────────────────────────────────────────────────────────────────
    // 1. Authenticate User
    // ──────────────────────────────────────────────────────────────────────

    let userId: string;
    let clerkUserId: string;
    let email: string;

    try {
      const authUser = await getAuthenticatedUser();
      userId = authUser.userId;
      clerkUserId = authUser.clerkUserId;
      email = authUser.email;
    } catch (authError) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. Extract Route Parameters
    // ──────────────────────────────────────────────────────────────────────

    const { caseId } = await context.params;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Bad Request: caseId is required' },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. Parse and Validate Request Body
    // ──────────────────────────────────────────────────────────────────────

    let body: RequestBody;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON body' },
        { status: 400 }
      );
    }

    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: question is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. Verify Case Ownership
    // ──────────────────────────────────────────────────────────────────────

    const { data: caseData, error: caseError } = await supabaseServer
      .from('cases')
      .select('id, title, user_id')
      .eq('id', caseId)
      .eq('user_id', userId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Not Found: Case does not exist or you do not have access to it' },
        { status: 404 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. Legal Advice Heuristic Guard (Defense in Depth)
    // ──────────────────────────────────────────────────────────────────────

    if (isLegalAdviceLikeQuestion(question)) {
      const { answerText, limitationNotice } = buildLegalAdviceWarningAnswer();

      const answerSummary = answerText.slice(0, 400);

      // Log as an AI query, even though we did not call OpenAI,
      // so that the user's intent and our refusal are auditable.
      await logAiQuery({
        userId,
        caseId,
        question,
        answerSummary,
      });

      await logAuditEvent({
        userId,
        action: 'AI_QUERY_LEGAL_ADVICE_REFUSED',
        entityType: 'CASE',
        entityId: caseId,
        metadata: {
          question,
          reason: 'Server-side legal advice heuristic matched; no model call made.',
          clerkUserId,
          email,
          caseTitle: caseData.title,
        },
      });

      return NextResponse.json(
        {
          answer_text: answerText,
          sources: [], // No evidence snippets, because we didn't run RAG
          limitation_notice: limitationNotice,
        },
        { status: 200 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────
    // 6. Execute RAG Query (if legal advice guard passed)
    // ──────────────────────────────────────────────────────────────────────

    const ragResult = await runCaseRagQuery({
      userId,
      caseId,
      question,
      maxSources: 5, // Configurable: can be made an optional query param
    });

    const { answerText, sources, limitationNotice } = ragResult;

    // ──────────────────────────────────────────────────────────────────────
    // 7. Compliance Logging
    // ──────────────────────────────────────────────────────────────────────

    // Truncate answer for summary (first 350 characters)
    const answerSummary =
      answerText.length > 350
        ? answerText.substring(0, 350).trim() + '...'
        : answerText;

    // Log to ai_queries table for compliance tracking
    await logAiQuery({
      userId,
      caseId,
      question,
      answerSummary,
    });

    // Log to audit_log table with full metadata
    await logAuditEvent({
      userId,
      action: 'AI_QUERY',
      entityType: 'CASE',
      entityId: caseId,
      metadata: {
        question,
        answerSummary,
        sourceCount: sources.length,
        sources: sources.map((s) => ({
          evidence_id: s.evidenceId,
          snippet_preview: s.snippet.substring(0, 100), // Brief preview only
        })),
        clerkUserId,
        email,
        caseTitle: caseData.title,
      },
    });

    // ──────────────────────────────────────────────────────────────────────
    // 8. Return Structured Response
    // ──────────────────────────────────────────────────────────────────────

    const response: ResponseBody = {
      answer_text: answerText,
      sources: sources.map((source) => ({
        evidence_id: source.evidenceId,
        snippet: source.snippet,
      })),
      limitation_notice: limitationNotice,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // ────────────────────────────────────────────────────────────────────────
    // Error Handling
    // ────────────────────────────────────────────────────────────────────────

    console.error('RAG query endpoint error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // SECURITY: Never expose internal error details to users in production
    // Log the full error server-side, return generic message to client
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? `Internal Server Error: ${errorMessage}`
            : 'Internal Server Error: Unable to process query. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Method Not Allowed Handler
// ============================================================================

/**
 * Handle non-POST requests with 405 Method Not Allowed
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method Not Allowed: This endpoint only accepts POST requests' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method Not Allowed: This endpoint only accepts POST requests' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method Not Allowed: This endpoint only accepts POST requests' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method Not Allowed: This endpoint only accepts POST requests' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

