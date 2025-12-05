/**
 * LINDEX - Evidence Upload Initiation API
 *
 * COMPLIANCE NOTES:
 * - This endpoint is strictly per-user, using user_id and case_id for complete isolation.
 * - It only handles CRUD operations on user-owned cases and evidence metadata (registers uploads).
 * - It does NOT query public law databases or generate legal advice.
 * - Future AI features will be limited to answering questions about the user's uploaded evidence only, not general legal research.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import { randomUUID } from 'crypto';
import type { LindexEvidenceUploadInit } from '@lindex/shared-types';

/**
 * POST /api/cases/:caseId/evidence/initiate
 *
 * Initiates an evidence upload for a specific case.
 * This endpoint:
 * 1. Verifies user owns the case
 * 2. Creates an evidence record in the database
 * 3. Generates a signed upload URL for Supabase Storage
 * 4. Creates a processing job for text extraction
 * 5. Logs the initiation to audit log
 *
 * Request body:
 * {
 *   mediaType: "DOCUMENT" | "IMAGE" (required)
 *   originalFilename: string (required, non-empty)
 *   mimeType?: string (optional)
 *   sizeBytes?: number (optional)
 * }
 *
 * Response: 200 OK with upload details
 * {
 *   evidenceId: string (UUID)
 *   caseId: string (UUID)
 *   storagePath: string
 *   uploadUrl: string (signed URL for client to upload to)
 *   uploadToken: string (token for signed upload)
 * }
 *
 * Error responses: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */
export async function POST(
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

    // 4. Parse and validate request body
    let body: {
      mediaType?: string;
      originalFilename?: string;
      mimeType?: string;
      sizeBytes?: number;
    };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { mediaType, originalFilename, mimeType, sizeBytes } = body;

    // 5. Validate required fields
    if (!mediaType || (mediaType !== 'DOCUMENT' && mediaType !== 'IMAGE')) {
      return NextResponse.json(
        { error: 'mediaType is required and must be either "DOCUMENT" or "IMAGE"' },
        { status: 400 }
      );
    }

    if (
      !originalFilename ||
      typeof originalFilename !== 'string' ||
      originalFilename.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'originalFilename is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // 6. Generate evidence ID and construct storage path
    // Storage path format: {userId}/{caseId}/{evidenceId}
    // This ensures complete isolation at the storage layer
    const evidenceId = randomUUID();
    const storagePath = `${user.userId}/${caseId}/${evidenceId}`;

    // 7. Insert evidence record into database
    const { data: evidenceRecord, error: evidenceError } = await supabaseServer
      .from('evidence')
      .insert({
        id: evidenceId,
        case_id: caseId,
        user_id: user.userId,
        storage_path: storagePath,
        media_type: mediaType,
        original_filename: originalFilename.trim(),
        mime_type: mimeType?.trim() || null,
        size_bytes: sizeBytes || null,
        processing_status: 'PENDING',
      })
      .select('*')
      .single();

    if (evidenceError || !evidenceRecord) {
      console.error('Error creating evidence record:', evidenceError);
      return NextResponse.json(
        { error: 'Failed to create evidence record' },
        { status: 500 }
      );
    }

    // 8. Generate signed upload URL for Supabase Storage
    // Using createSignedUploadUrl which returns a token and path that the client
    // can use to upload the file directly to Supabase Storage
    let uploadUrl: string;
    let uploadToken: string;

    try {
      const { data: signedUrlData, error: signedUrlError } =
        await supabaseServer.storage
          .from('evidence')
          .createSignedUploadUrl(storagePath);

      if (signedUrlError || !signedUrlData) {
        console.error('Error creating signed upload URL:', signedUrlError);
        // Clean up the evidence record since we couldn't get upload URL
        await supabaseServer
          .from('evidence')
          .delete()
          .eq('id', evidenceId);

        return NextResponse.json(
          { error: 'Failed to generate upload URL' },
          { status: 500 }
        );
      }

      uploadUrl = signedUrlData.signedUrl;
      uploadToken = signedUrlData.token;
    } catch (error) {
      console.error('Unexpected error generating signed URL:', error);
      // Clean up the evidence record
      await supabaseServer
        .from('evidence')
        .delete()
        .eq('id', evidenceId);

      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    // 9. Create initial processing job for text extraction
    const { data: processingJob, error: jobError } = await supabaseServer
      .from('processing_jobs')
      .insert({
        evidence_id: evidenceId,
        job_type: 'TEXT_EXTRACTION',
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (jobError) {
      console.error('Error creating processing job:', jobError);
      // Don't fail the request if job creation fails - can be retried later
      // But log it for monitoring
      console.warn(
        `Processing job creation failed for evidence ${evidenceId}, will need manual retry`
      );
    }

    // 10. Log audit event
    await logAuditEvent({
      userId: user.userId,
      action: AuditActions.EVIDENCE_UPLOADED,
      entityType: EntityTypes.EVIDENCE,
      entityId: evidenceId,
      metadata: {
        caseId,
        mediaType,
        originalFilename: originalFilename.trim(),
        mimeType: mimeType?.trim() || null,
        sizeBytes: sizeBytes || null,
        storagePath,
        processingJobId: processingJob?.id || null,
      },
    });

    // 11. Return upload details to client as DTO
    const response: LindexEvidenceUploadInit = {
      evidenceId,
      caseId,
      storagePath,
      uploadUrl,
      uploadToken,
      expiresIn: 60, // Signed URLs typically expire in 60 seconds
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error(
      'Unexpected error in POST /api/cases/:caseId/evidence/initiate:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

