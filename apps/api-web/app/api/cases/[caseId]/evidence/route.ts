/**
 * LINDEX - Case Evidence List API
 *
 * COMPLIANCE NOTES:
 * - This endpoint is strictly per-user, using user_id and case_id for complete isolation.
 * - It only handles CRUD operations on user-owned cases and evidence metadata (lists evidence).
 * - It does NOT query public law databases or generate legal advice.
 * - Future AI features will be limited to answering questions about the user's uploaded evidence only, not general legal research.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import type { LindexEvidence } from '@lindex/shared-types';

/**
 * Maps a database evidence row to the LindexEvidence DTO
 * Converts snake_case DB fields to camelCase for API responses
 */
function mapEvidenceToDto(dbEvidence: any): LindexEvidence {
  return {
    id: dbEvidence.id,
    caseId: dbEvidence.case_id,
    userId: dbEvidence.user_id,
    mediaType: dbEvidence.media_type,
    originalFilename: dbEvidence.original_filename,
    mimeType: dbEvidence.mime_type,
    sizeBytes: dbEvidence.size_bytes,
    processingStatus: dbEvidence.processing_status,
    extractedText: dbEvidence.extracted_text,
    createdAt: dbEvidence.created_at,
    updatedAt: dbEvidence.updated_at,
  };
}

/**
 * GET /api/cases/:caseId/evidence
 *
 * Retrieves all evidence for a specific case owned by the authenticated user.
 *
 * Path parameters:
 * - caseId: UUID of the case
 *
 * Response: 200 OK with array of evidence objects
 * [
 *   {
 *     id: string (UUID)
 *     caseId: string (UUID)
 *     userId: string (UUID)
 *     mediaType: "DOCUMENT" | "IMAGE"
 *     originalFilename: string
 *     mimeType: string | null
 *     sizeBytes: number | null
 *     processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
 *     extractedText: string | null (only if processing completed)
 *     createdAt: string (ISO 8601)
 *     updatedAt: string (ISO 8601)
 *   }
 * ]
 *
 * Error responses: 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Extract caseId from route params
    const { caseId } = params;

    // 3. Verify case exists and belongs to user
    const { data: caseData, error: caseError } = await supabaseServer
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .eq('user_id', user.userId)
      .single();

    if (caseError || !caseData) {
      // Return 404 without revealing whether case exists for another user
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 4. Fetch all evidence for this case, ordered by most recent first
    // Note: We explicitly filter by both case_id AND user_id for defense in depth
    const { data: evidenceList, error: evidenceError } = await supabaseServer
      .from('evidence')
      .select(
        `
        id,
        case_id,
        user_id,
        media_type,
        original_filename,
        mime_type,
        size_bytes,
        processing_status,
        extracted_text,
        created_at,
        updated_at
      `
      )
      .eq('case_id', caseId)
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (evidenceError) {
      console.error('Error fetching evidence list:', evidenceError);
      return NextResponse.json(
        { error: 'Failed to fetch evidence' },
        { status: 500 }
      );
    }

    // 5. Map to DTOs and return evidence list (may be empty)
    const evidenceDtos = (evidenceList ?? []).map(mapEvidenceToDto);
    return NextResponse.json(evidenceDtos, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/cases/:caseId/evidence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

