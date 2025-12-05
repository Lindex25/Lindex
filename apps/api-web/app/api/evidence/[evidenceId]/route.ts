/**
 * LINDEX - Individual Evidence API
 *
 * COMPLIANCE NOTES:
 * - This endpoint is strictly per-user, using user_id and case_id for complete isolation.
 * - It only handles CRUD operations on user-owned cases and evidence metadata (retrieves evidence with download URL).
 * - It does NOT query public law databases or generate legal advice.
 * - Future AI features will be limited to answering questions about the user's uploaded evidence only, not general legal research.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import type { LindexEvidenceWithDownload } from '@lindex/shared-types';

/**
 * Maps a database evidence row to the LindexEvidenceWithDownload DTO
 * Converts snake_case DB fields to camelCase for API responses
 */
function mapEvidenceWithDownloadToDto(
  dbEvidence: any,
  downloadUrl: string,
  expiresIn: number
): LindexEvidenceWithDownload {
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
    downloadUrl,
    expiresIn,
  };
}

/**
 * GET /api/evidence/:evidenceId
 *
 * Retrieves a specific evidence item with a signed download URL.
 *
 * Path parameters:
 * - evidenceId: UUID of the evidence
 *
 * Response: 200 OK with evidence object and download URL
 * {
 *   id: string (UUID)
 *   caseId: string (UUID)
 *   userId: string (UUID)
 *   mediaType: "DOCUMENT" | "IMAGE"
 *   originalFilename: string
 *   mimeType: string | null
 *   sizeBytes: number | null
 *   processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
 *   extractedText: string | null
 *   createdAt: string (ISO 8601)
 *   updatedAt: string (ISO 8601)
 *   downloadUrl: string (signed URL, expires in 60 seconds)
 *   expiresIn: number (seconds)
 * }
 *
 * Error responses: 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Extract evidenceId from route params
    const { evidenceId } = params;

    // 3. Fetch evidence and verify ownership
    // We select storage_path here because we need it to generate the download URL
    const { data: evidenceData, error: evidenceError } = await supabaseServer
      .from('evidence')
      .select(
        `
        id,
        case_id,
        user_id,
        storage_path,
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
      .eq('id', evidenceId)
      .eq('user_id', user.userId)
      .single();

    if (evidenceError || !evidenceData) {
      // Return 404 without revealing whether evidence exists for another user
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      );
    }

    // 4. Generate signed download URL from Supabase Storage
    // This URL will be valid for 60 seconds by default
    let downloadUrl: string;

    try {
      const { data: signedUrlData, error: signedUrlError } =
        await supabaseServer.storage
          .from('evidence')
          .createSignedUrl(evidenceData.storage_path, 60); // 60 seconds expiry

      if (signedUrlError || !signedUrlData) {
        console.error('Error creating signed download URL:', signedUrlError);
        return NextResponse.json(
          { error: 'Failed to generate download URL' },
          { status: 500 }
        );
      }

      downloadUrl = signedUrlData.signedUrl;
    } catch (error) {
      console.error('Unexpected error generating signed download URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // 5. Map to DTO and return evidence with download URL
    const evidenceDto = mapEvidenceWithDownloadToDto(evidenceData, downloadUrl, 60);
    return NextResponse.json(evidenceDto, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/evidence/:evidenceId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

