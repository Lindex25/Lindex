/**
 * LINDEX - Audit Logging Helpers
 *
 * Provides functions for logging user actions and AI queries to Supabase.
 *
 * Key features:
 * - Comprehensive audit trail for compliance
 * - AI query tracking for legal traceability
 * - Non-blocking: Errors are logged but don't throw
 * - JSONB metadata support for flexible logging
 *
 * Usage:
 * ```typescript
 * import { logAuditEvent, logAiQuery } from '@/lib/audit';
 *
 * // Log a user action
 * await logAuditEvent({
 *   userId: user.userId,
 *   action: 'CASE_CREATED',
 *   entityType: 'CASE',
 *   entityId: newCase.id,
 *   metadata: { title: newCase.title }
 * });
 *
 * // Log an AI query (also creates audit log entry)
 * await logAiQuery({
 *   userId: user.userId,
 *   caseId: case.id,
 *   question: 'What evidence supports claim X?',
 *   answerSummary: 'Based on documents A and B...'
 * });
 * ```
 */

import { supabaseServer } from './supabase-server';

/**
 * Arguments for logging an audit event
 */
export interface LogAuditEventArgs {
  /** Supabase user UUID */
  userId: string;
  /** Action performed (e.g., 'CASE_CREATED', 'EVIDENCE_UPLOADED', 'AI_QUERY') */
  action: string;
  /** Optional entity type (e.g., 'CASE', 'EVIDENCE', 'AI_QUERY') */
  entityType?: string | null;
  /** Optional entity UUID */
  entityId?: string | null;
  /** Optional metadata (stored as JSONB) */
  metadata?: Record<string, any>;
}

/**
 * Arguments for logging an AI query
 */
export interface LogAiQueryArgs {
  /** Supabase user UUID */
  userId: string;
  /** Case UUID the query relates to */
  caseId: string;
  /** The question asked by the user */
  question: string;
  /** Optional summary or truncated answer */
  answerSummary?: string | null;
}

/**
 * Log an audit event to the audit_log table
 *
 * This function records user actions for compliance, debugging, and analytics.
 * Failures are logged to console but do not throw errors to avoid breaking
 * the main request flow.
 *
 * @param args - Audit event details
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await logAuditEvent({
 *   userId: user.userId,
 *   action: 'CASE_CREATED',
 *   entityType: 'CASE',
 *   entityId: newCase.id,
 *   metadata: {
 *     title: newCase.title,
 *     status: newCase.status,
 *   }
 * });
 * ```
 */
export async function logAuditEvent(args: LogAuditEventArgs): Promise<void> {
  const { userId, action, entityType, entityId, metadata } = args;

  try {
    const { error } = await supabaseServer.from('audit_log').insert({
      user_id: userId,
      action: action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
    });

    if (error) {
      console.error('Failed to log audit event:', {
        error: error.message,
        userId,
        action,
        entityType,
        entityId,
      });
    }
  } catch (error) {
    // Catch any unexpected errors (network issues, etc.)
    console.error('Unexpected error logging audit event:', error, {
      userId,
      action,
      entityType,
      entityId,
    });
  }
}

/**
 * Log an AI query to the ai_queries table and audit_log
 *
 * This function:
 * 1. Inserts the query into ai_queries for AI-specific tracking
 * 2. Creates an audit log entry with action='AI_QUERY'
 *
 * Failures are logged to console but do not throw errors.
 *
 * @param args - AI query details
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await logAiQuery({
 *   userId: user.userId,
 *   caseId: caseId,
 *   question: 'What evidence supports the defendant's alibi?',
 *   answerSummary: 'Based on witness testimony and security footage...'
 * });
 * ```
 */
export async function logAiQuery(args: LogAiQueryArgs): Promise<void> {
  const { userId, caseId, question, answerSummary } = args;

  try {
    // 1. Insert into ai_queries table
    const { data: aiQuery, error: aiQueryError } = await supabaseServer
      .from('ai_queries')
      .insert({
        user_id: userId,
        case_id: caseId,
        question: question,
        answer_summary: answerSummary ?? null,
      })
      .select('id')
      .single();

    if (aiQueryError) {
      console.error('Failed to log AI query to ai_queries table:', {
        error: aiQueryError.message,
        userId,
        caseId,
        question: question.substring(0, 100), // Log first 100 chars only
      });
      // Continue to audit log even if ai_queries insert fails
    }

    // 2. Log to audit_log for comprehensive tracking
    await logAuditEvent({
      userId,
      action: 'AI_QUERY',
      entityType: 'CASE',
      entityId: caseId,
      metadata: {
        question,
        answerSummary: answerSummary ?? null,
        aiQueryId: aiQuery?.id ?? null,
        questionLength: question.length,
        answerLength: answerSummary?.length ?? 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error logging AI query:', error, {
      userId,
      caseId,
      question: question.substring(0, 100),
    });
  }
}

/**
 * Common audit actions for consistency
 *
 * Use these constants to ensure consistent action naming across the application.
 */
export const AuditActions = {
  // User actions
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',

  // Case actions
  CASE_CREATED: 'CASE_CREATED',
  CASE_UPDATED: 'CASE_UPDATED',
  CASE_DELETED: 'CASE_DELETED',
  CASE_CLOSED: 'CASE_CLOSED',
  CASE_REOPENED: 'CASE_REOPENED',

  // Evidence actions
  EVIDENCE_UPLOADED: 'EVIDENCE_UPLOADED',
  EVIDENCE_DELETED: 'EVIDENCE_DELETED',
  EVIDENCE_PROCESSED: 'EVIDENCE_PROCESSED',
  EVIDENCE_PROCESSING_FAILED: 'EVIDENCE_PROCESSING_FAILED',

  // AI actions
  AI_QUERY: 'AI_QUERY',
  AI_EMBEDDING_CREATED: 'AI_EMBEDDING_CREATED',
  AI_SEARCH_PERFORMED: 'AI_SEARCH_PERFORMED',

  // Authentication actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',

  // Admin actions (future)
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  ADMIN_USER_IMPERSONATION: 'ADMIN_USER_IMPERSONATION',
} as const;

/**
 * Common entity types for consistency
 */
export const EntityTypes = {
  USER: 'USER',
  CASE: 'CASE',
  EVIDENCE: 'EVIDENCE',
  AI_QUERY: 'AI_QUERY',
  PROCESSING_JOB: 'PROCESSING_JOB',
} as const;

