-- ============================================================================
-- LINDEX Personal - Row Level Security (RLS) Policies
-- ============================================================================
-- Description: Enable RLS and create per-user access policies
-- Version: 002
-- Date: 2025-12-05
--
-- IMPORTANT NOTES:
-- ================
-- 1. RLS is ENABLED on all core tables for defense in depth
-- 2. These policies are BYPASSED when using the Supabase service_role key
-- 3. Current architecture: Clerk auth + service_role key from Next.js backend
-- 4. Real authorization enforcement: Application layer using Clerk user_id
-- 5. Purpose of these policies: Scaffolding for future direct-client access
--    or migration to Supabase Auth / custom JWT claims
--
-- If you later want these policies to be enforced:
-- - Use anon/authenticated keys instead of service_role
-- - OR implement custom JWT with Supabase auth.uid() mapping to Clerk user
-- - OR use direct Supabase client from frontend with proper auth setup
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL CORE TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_text_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- NOTE: When using the Supabase service_role key from the backend (as we do
-- with Clerk), these policies are bypassed. Application-level checks must
-- enforce per-user isolation. This exists as scaffolding for a future
-- direct-client / user-scoped auth model.

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING ( id = auth.uid() );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING ( id = auth.uid() );

-- Only authenticated users can insert (typically handled by backend on signup)
CREATE POLICY "Authenticated users can create their profile"
  ON public.users
  FOR INSERT
  WITH CHECK ( id = auth.uid() );

-- ============================================================================
-- TABLE: cases
-- ============================================================================
-- NOTE: When using the Supabase service_role key from the backend (as we do
-- with Clerk), these policies are bypassed. Application-level checks must
-- enforce per-user isolation.

-- Cases are only visible to their owner
CREATE POLICY "Cases are only visible to their owner"
  ON public.cases
  FOR SELECT
  USING ( user_id = auth.uid() );

-- Users can only create cases for themselves
CREATE POLICY "Users can create their own cases"
  ON public.cases
  FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

-- Users can only update their own cases
CREATE POLICY "Users can update their own cases"
  ON public.cases
  FOR UPDATE
  USING ( user_id = auth.uid() );

-- Users can only delete their own cases
CREATE POLICY "Users can delete their own cases"
  ON public.cases
  FOR DELETE
  USING ( user_id = auth.uid() );

-- ============================================================================
-- TABLE: evidence
-- ============================================================================
-- NOTE: When using the Supabase service_role key from the backend (as we do
-- with Clerk), these policies are bypassed. Application-level checks must
-- enforce per-user isolation.

-- Evidence is only visible to the owner
CREATE POLICY "Evidence is only visible to its owner"
  ON public.evidence
  FOR SELECT
  USING ( user_id = auth.uid() );

-- Users can only upload evidence for their own cases
CREATE POLICY "Users can upload evidence to their own cases"
  ON public.evidence
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = evidence.case_id
      AND cases.user_id = auth.uid()
    )
  );

-- Users can only update their own evidence
CREATE POLICY "Users can update their own evidence"
  ON public.evidence
  FOR UPDATE
  USING ( user_id = auth.uid() );

-- Users can only delete their own evidence
CREATE POLICY "Users can delete their own evidence"
  ON public.evidence
  FOR DELETE
  USING ( user_id = auth.uid() );

-- ============================================================================
-- TABLE: evidence_text_chunks
-- ============================================================================
-- NOTE: These chunks are derived from evidence owned by a user.
-- Access is controlled by checking the parent evidence record.

-- Users can view chunks from their own evidence
CREATE POLICY "Users can view chunks from their own evidence"
  ON public.evidence_text_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = evidence_text_chunks.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can insert chunks for their own evidence (typically via backend processing)
CREATE POLICY "Users can create chunks for their own evidence"
  ON public.evidence_text_chunks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = evidence_text_chunks.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can update chunks from their own evidence
CREATE POLICY "Users can update chunks from their own evidence"
  ON public.evidence_text_chunks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = evidence_text_chunks.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can delete chunks from their own evidence
CREATE POLICY "Users can delete chunks from their own evidence"
  ON public.evidence_text_chunks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = evidence_text_chunks.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: evidence_embeddings
-- ============================================================================
-- NOTE: Embeddings are linked to chunks, which are linked to evidence.
-- Access is controlled by checking ownership through the chain.

-- Users can view embeddings from their own evidence chunks
CREATE POLICY "Users can view embeddings from their own evidence"
  ON public.evidence_embeddings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evidence_text_chunks
      JOIN evidence ON evidence.id = evidence_text_chunks.evidence_id
      WHERE evidence_text_chunks.id = evidence_embeddings.chunk_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can create embeddings for their own evidence chunks
CREATE POLICY "Users can create embeddings for their own evidence"
  ON public.evidence_embeddings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evidence_text_chunks
      JOIN evidence ON evidence.id = evidence_text_chunks.evidence_id
      WHERE evidence_text_chunks.id = evidence_embeddings.chunk_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can update embeddings from their own evidence
CREATE POLICY "Users can update embeddings from their own evidence"
  ON public.evidence_embeddings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM evidence_text_chunks
      JOIN evidence ON evidence.id = evidence_text_chunks.evidence_id
      WHERE evidence_text_chunks.id = evidence_embeddings.chunk_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can delete embeddings from their own evidence
CREATE POLICY "Users can delete embeddings from their own evidence"
  ON public.evidence_embeddings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM evidence_text_chunks
      JOIN evidence ON evidence.id = evidence_text_chunks.evidence_id
      WHERE evidence_text_chunks.id = evidence_embeddings.chunk_id
      AND evidence.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: processing_jobs
-- ============================================================================
-- NOTE: Processing jobs are linked to evidence owned by a user.

-- Users can view processing jobs for their own evidence
CREATE POLICY "Users can view processing jobs for their own evidence"
  ON public.processing_jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = processing_jobs.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can create processing jobs for their own evidence
CREATE POLICY "Users can create processing jobs for their own evidence"
  ON public.processing_jobs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = processing_jobs.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can update processing jobs for their own evidence
CREATE POLICY "Users can update processing jobs for their own evidence"
  ON public.processing_jobs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = processing_jobs.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- Users can delete processing jobs for their own evidence
CREATE POLICY "Users can delete processing jobs for their own evidence"
  ON public.processing_jobs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM evidence
      WHERE evidence.id = processing_jobs.evidence_id
      AND evidence.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: audit_log
-- ============================================================================
-- NOTE: Audit logs record user actions. Users can view their own audit trail.

-- Users can view their own audit log entries
CREATE POLICY "Users can view their own audit log"
  ON public.audit_log
  FOR SELECT
  USING ( user_id = auth.uid() );

-- Users can insert their own audit log entries (typically via backend)
CREATE POLICY "Users can create their own audit log entries"
  ON public.audit_log
  FOR INSERT
  WITH CHECK ( user_id = auth.uid() );

-- Audit logs should generally not be updated or deleted (immutable audit trail)
-- If you need these operations, add policies here with appropriate justification

-- ============================================================================
-- TABLE: ai_queries
-- ============================================================================
-- NOTE: AI queries are linked to cases and users for compliance tracking.

-- Users can view their own AI queries
CREATE POLICY "Users can view their own AI queries"
  ON public.ai_queries
  FOR SELECT
  USING ( user_id = auth.uid() );

-- Users can create AI queries for their own cases
CREATE POLICY "Users can create AI queries for their own cases"
  ON public.ai_queries
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = ai_queries.case_id
      AND cases.user_id = auth.uid()
    )
  );

-- Users can update their own AI queries (e.g., to add answer_summary)
CREATE POLICY "Users can update their own AI queries"
  ON public.ai_queries
  FOR UPDATE
  USING ( user_id = auth.uid() );

-- Users can delete their own AI queries if needed
CREATE POLICY "Users can delete their own AI queries"
  ON public.ai_queries
  FOR DELETE
  USING ( user_id = auth.uid() );

-- ============================================================================
-- COMPLETED: RLS Policies
-- ============================================================================
-- Summary:
-- - RLS is ENABLED on all 8 core tables
-- - Policies enforce per-user data isolation based on auth.uid()
-- - Currently BYPASSED due to service_role key usage with Clerk
-- - Application layer must continue to enforce authorization via Clerk user_id
-- - These policies provide defense in depth and future migration path
--
-- To activate these policies in the future:
-- 1. Switch from service_role to anon/authenticated keys
-- 2. Implement custom JWT claims mapping Clerk user_id to Supabase auth.uid()
-- 3. OR migrate to Supabase Auth for user management
-- 4. Update application code to use user-scoped Supabase client
--
-- Verification query (run as service_role to check policy definitions):
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
-- ============================================================================


