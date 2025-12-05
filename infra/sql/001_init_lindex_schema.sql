-- ============================================================================
-- LINDEX Personal - Initial Schema Migration
-- ============================================================================
-- Description: Core database schema for LINDEX legal-tech SaaS platform
-- Version: 001
-- Date: 2025-12-05
--
-- This migration creates the foundational tables for:
--   - User management (with Clerk integration)
--   - Case management
--   - Evidence storage and processing
--   - Text extraction and embeddings (pgvector)
--   - Processing job tracking
--   - Audit logging
--   - AI query traceability
-- ============================================================================

-- Ensure required extensions are available (Supabase typically has these enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "vector";      -- for embeddings (pgvector)

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Stores user accounts integrated with Clerk authentication
CREATE TABLE users (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id   text            NOT NULL UNIQUE,
    email           text            NOT NULL,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Index for faster lookups by Clerk user ID
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);

-- ============================================================================
-- TABLE: cases
-- ============================================================================
-- Represents legal cases created by users
CREATE TABLE cases (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           text            NOT NULL,
    description     text            NULL,
    status          text            NOT NULL DEFAULT 'OPEN',
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Index for faster queries by user
CREATE INDEX idx_cases_user_id ON cases(user_id);
-- Index for filtering by status
CREATE INDEX idx_cases_status ON cases(status);

-- ============================================================================
-- TABLE: evidence
-- ============================================================================
-- Stores metadata for evidence files (documents, images, etc.)
CREATE TABLE evidence (
    id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id             uuid            NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id             uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_path        text            NOT NULL,
    media_type          text            NOT NULL,
    original_filename   text            NOT NULL,
    mime_type           text            NULL,
    size_bytes          bigint          NULL,
    processing_status   text            NOT NULL DEFAULT 'PENDING',
    created_at          timestamptz     NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_evidence_processing_status ON evidence(processing_status);

-- ============================================================================
-- TABLE: evidence_text_chunks
-- ============================================================================
-- Stores extracted text content split into chunks for embedding
CREATE TABLE evidence_text_chunks (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id     uuid            NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    chunk_index     int             NOT NULL,
    content         text            NOT NULL,
    token_count     int             NULL,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Index for retrieving chunks by evidence
CREATE INDEX idx_evidence_text_chunks_evidence_id ON evidence_text_chunks(evidence_id);
-- Composite index for ordered chunk retrieval
CREATE INDEX idx_evidence_text_chunks_evidence_index ON evidence_text_chunks(evidence_id, chunk_index);

-- ============================================================================
-- TABLE: evidence_embeddings
-- ============================================================================
-- Stores vector embeddings for semantic search using pgvector
CREATE TABLE evidence_embeddings (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id        uuid            NOT NULL REFERENCES evidence_text_chunks(id) ON DELETE CASCADE,
    embedding       vector          NOT NULL,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Index for chunk lookup
CREATE INDEX idx_evidence_embeddings_chunk_id ON evidence_embeddings(chunk_id);
-- Index for vector similarity search (using HNSW for performance)
-- Note: Adjust dimensions based on your embedding model (e.g., 1536 for OpenAI ada-002)
-- CREATE INDEX idx_evidence_embeddings_vector ON evidence_embeddings
--   USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- TABLE: processing_jobs
-- ============================================================================
-- Tracks background processing jobs for evidence (OCR, embedding generation, etc.)
CREATE TABLE processing_jobs (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id     uuid            NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    job_type        text            NOT NULL,
    status          text            NOT NULL DEFAULT 'PENDING',
    last_error      text            NULL,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    updated_at      timestamptz     NOT NULL DEFAULT now()
);

-- Indexes for job management and monitoring
CREATE INDEX idx_processing_jobs_evidence_id ON processing_jobs(evidence_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_type_status ON processing_jobs(job_type, status);

-- ============================================================================
-- TABLE: audit_log
-- ============================================================================
-- Comprehensive audit trail for compliance and debugging
CREATE TABLE audit_log (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action          text            NOT NULL,
    entity_type     text            NULL,
    entity_id       uuid            NULL,
    metadata        jsonb           NOT NULL DEFAULT '{}'::jsonb,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
-- GIN index for JSONB metadata queries
CREATE INDEX idx_audit_log_metadata ON audit_log USING gin(metadata);

-- ============================================================================
-- TABLE: ai_queries
-- ============================================================================
-- Tracks AI-powered queries for compliance, traceability, and future analysis
CREATE TABLE ai_queries (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id         uuid            NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    question        text            NOT NULL,
    answer_summary  text            NULL,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

-- Indexes for query history and analysis
CREATE INDEX idx_ai_queries_user_id ON ai_queries(user_id);
CREATE INDEX idx_ai_queries_case_id ON ai_queries(case_id);
CREATE INDEX idx_ai_queries_created_at ON ai_queries(created_at);

-- ============================================================================
-- FUNCTION: search_case_evidence_embeddings
-- ============================================================================
-- Performs vector similarity search over a user's case evidence
-- Used by the RAG query engine to find relevant evidence snippets
--
-- Security: Enforces user_id and case_id ownership
-- Performance: Uses pgvector's <-> operator for cosine similarity
--
-- Parameters:
--   p_user_id: User UUID (ownership check)
--   p_case_id: Case UUID (scope limit)
--   p_query_embedding: Query vector as string '[0.1, 0.2, ...]'
--   p_limit: Maximum number of results to return
--
-- Returns: Table with evidence_id, chunk_content, distance
-- ============================================================================
CREATE OR REPLACE FUNCTION search_case_evidence_embeddings(
    p_user_id uuid,
    p_case_id uuid,
    p_query_embedding text,
    p_limit int DEFAULT 5
)
RETURNS TABLE (
    evidence_id uuid,
    chunk_content text,
    distance float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS evidence_id,
        etc.content AS chunk_content,
        (ee.embedding <-> p_query_embedding::vector) AS distance
    FROM evidence_embeddings ee
    INNER JOIN evidence_text_chunks etc ON ee.chunk_id = etc.id
    INNER JOIN evidence e ON etc.evidence_id = e.id
    INNER JOIN cases c ON e.case_id = c.id
    WHERE
        c.user_id = p_user_id
        AND c.id = p_case_id
        AND e.processing_status = 'READY'
    ORDER BY distance ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users (adjust based on your RLS setup)
-- GRANT EXECUTE ON FUNCTION search_case_evidence_embeddings(uuid, uuid, text, int) TO authenticated;

-- ============================================================================
-- COMPLETED: Initial LINDEX Schema
-- ============================================================================
-- Next steps:
--   1. Enable Row Level Security (RLS) policies for multi-tenant isolation
--   2. Create appropriate roles and permissions
--   3. Add triggers for updated_at timestamp maintenance
--   4. Configure vector index dimensions based on embedding model
-- ============================================================================

