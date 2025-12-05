/**
 * LINDEX - Individual Case API Routes
 *
 * COMPLIANCE NOTES:
 * - These endpoints are strictly per-user, using user_id and case_id for complete isolation.
 * - They only handle CRUD operations on user-owned cases and evidence metadata.
 * - They do NOT query public law databases or generate legal advice.
 * - Future AI features will be limited to answering questions about the user's uploaded evidence only, not general legal research.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import type { LindexCase } from '@lindex/shared-types';

/**
 * Maps a database case row to the LindexCase DTO
 * Converts snake_case DB fields to camelCase for API responses
 */
function mapCaseToDto(dbCase: any): LindexCase {
  return {
    id: dbCase.id,
    userId: dbCase.user_id,
    title: dbCase.title,
    description: dbCase.description,
    status: dbCase.status,
    createdAt: dbCase.created_at,
    updatedAt: dbCase.updated_at,
  };
}

/**
 * GET /api/cases/:caseId
 *
 * Retrieves a specific case for the authenticated user.
 *
 * Path parameters:
 * - caseId: UUID of the case
 *
 * Response: 200 OK with case object
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

    // 3. Fetch case with user_id isolation
    const { data: caseData, error: fetchError } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.userId)
      .single();

    // 4. Handle not found (either doesn't exist or belongs to another user)
    if (fetchError || !caseData) {
      // Return 404 without revealing whether case exists for another user
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 5. Map to DTO and return case
    const caseDto = mapCaseToDto(caseData);
    return NextResponse.json(caseDto, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/cases/:caseId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cases/:caseId
 *
 * Updates a specific case for the authenticated user.
 *
 * Path parameters:
 * - caseId: UUID of the case
 *
 * Request body (all fields optional):
 * {
 *   title?: string
 *   description?: string | null
 *   status?: string
 * }
 *
 * Response: 200 OK with updated case object
 * Error responses: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Extract caseId from route params
    const { caseId } = params;

    // 3. Parse and validate request body
    let body: {
      title?: string;
      description?: string | null;
      status?: string;
    };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 4. Verify case exists and belongs to user
    const { data: existingCase, error: fetchError } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !existingCase) {
      // Return 404 without revealing whether case exists for another user
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 5. Build update object with only provided fields
    const updates: Record<string, any> = {};
    const changedFields: Record<string, any> = {};

    if (body.title !== undefined) {
      // Validate title if provided
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
      changedFields.title = { from: existingCase.title, to: updates.title };
    }

    if (body.description !== undefined) {
      updates.description = body.description;
      changedFields.description = {
        from: existingCase.description,
        to: body.description,
      };
    }

    if (body.status !== undefined) {
      // Validate status if provided
      if (typeof body.status !== 'string' || body.status.trim().length === 0) {
        return NextResponse.json(
          { error: 'Status must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.status = body.status.trim();
      changedFields.status = { from: existingCase.status, to: updates.status };
    }

    // 6. If no fields to update, return existing case
    if (Object.keys(updates).length === 0) {
      const caseDto = mapCaseToDto(existingCase);
      return NextResponse.json(caseDto, { status: 200 });
    }

    // 7. Perform update
    const { data: updatedCase, error: updateError } = await supabaseServer
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .eq('user_id', user.userId) // Double-check ownership
      .select('*')
      .single();

    if (updateError || !updatedCase) {
      console.error('Error updating case:', updateError);
      return NextResponse.json(
        { error: 'Failed to update case' },
        { status: 500 }
      );
    }

    // 8. Log audit event with changed fields
    await logAuditEvent({
      userId: user.userId,
      action: AuditActions.CASE_UPDATED,
      entityType: EntityTypes.CASE,
      entityId: caseId,
      metadata: {
        changes: changedFields,
        updatedFields: Object.keys(updates),
      },
    });

    // 9. Map to DTO and return updated case
    const caseDto = mapCaseToDto(updatedCase);
    return NextResponse.json(caseDto, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in PATCH /api/cases/:caseId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

