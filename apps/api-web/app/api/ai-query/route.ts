/**
 * AI Query API Route
 *
 * Example endpoint demonstrating how to handle AI-powered legal queries
 * with proper authentication, validation, and audit logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { logAiQuery } from '@/lib/audit';

/**
 * POST /api/ai-query
 *
 * Process an AI-powered query against case evidence.
 * This endpoint demonstrates the full flow including audit logging.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Parse and validate request body
    const body = await request.json();
    const { caseId, question } = body;

    // Validate required fields
    if (!caseId || typeof caseId !== 'string') {
      return NextResponse.json(
        { error: 'caseId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'question is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Limit question length for safety
    if (question.length > 2000) {
      return NextResponse.json(
        { error: 'question must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // 3. Verify case exists and belongs to user
    const { data: caseData, error: caseError } = await supabaseServer
      .from('cases')
      .select('id, title, status')
      .eq('id', caseId)
      .eq('user_id', user.userId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found or you do not have access to it' },
        { status: 404 }
      );
    }

    // 4. Process AI query (placeholder - implement your AI logic here)
    // This is where you would:
    // - Retrieve relevant evidence embeddings
    // - Query your AI model (OpenAI, Anthropic, etc.)
    // - Generate a comprehensive answer

    const answerSummary = `AI-powered analysis of case "${caseData.title}" regarding: ${question.substring(0, 100)}...`;

    // Simulate processing time
    // await processAiQuery(caseId, question);

    // 5. Log the AI query (to both ai_queries and audit_log)
    await logAiQuery({
      userId: user.userId,
      caseId: caseId,
      question: question,
      answerSummary: answerSummary,
    });

    // 6. Return response
    return NextResponse.json({
      ok: true,
      data: {
        question: question,
        answer: answerSummary,
        caseTitle: caseData.title,
        timestamp: new Date().toISOString(),
      },
      meta: {
        caseId: caseId,
        questionLength: question.length,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/ai-query:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Handle validation errors from JSON parsing
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-query?caseId=<uuid>
 *
 * Retrieve AI query history for a specific case.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Get caseId from query params
    const searchParams = request.nextUrl.searchParams;
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId query parameter is required' },
        { status: 400 }
      );
    }

    // 3. Verify case exists and belongs to user
    const { data: caseData, error: caseError } = await supabaseServer
      .from('cases')
      .select('id, title')
      .eq('id', caseId)
      .eq('user_id', user.userId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found or you do not have access to it' },
        { status: 404 }
      );
    }

    // 4. Retrieve AI query history for this case
    const { data: queries, error: queriesError } = await supabaseServer
      .from('ai_queries')
      .select('id, question, answer_summary, created_at')
      .eq('case_id', caseId)
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 queries

    if (queriesError) {
      console.error('Error fetching AI queries:', queriesError);
      return NextResponse.json(
        { error: 'Failed to fetch AI query history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: queries,
      meta: {
        caseId: caseId,
        caseTitle: caseData.title,
        total: queries?.length || 0,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/ai-query:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

