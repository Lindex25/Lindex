/**
 * LINDEX - Case Management API Routes
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
 * POST /api/cases
 *
 * Creates a new case for the authenticated user.
 *
 * Request body:
 * {
 *   title: string (required, non-empty)
 *   description?: string | null (optional)
 * }
 *
 * Response: 201 Created with case object
 * Error responses: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Parse and validate request body
    let body: { title?: string; description?: string | null };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { title, description } = body;

    // 3. Validate title (required, non-empty string)
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // 4. Insert new case into database
    const { data: newCase, error: insertError } = await supabaseServer
      .from('cases')
      .insert({
        user_id: user.userId,
        title: title.trim(),
        description: description ?? null,
      })
      .select('*')
      .single();

    if (insertError || !newCase) {
      console.error('Error creating case:', insertError);
      return NextResponse.json(
        { error: 'Failed to create case' },
        { status: 500 }
      );
    }

    // 5. Log audit event
    await logAuditEvent({
      userId: user.userId,
      action: AuditActions.CASE_CREATED,
      entityType: EntityTypes.CASE,
      entityId: newCase.id,
      metadata: {
        title: newCase.title,
        description: newCase.description,
        status: newCase.status,
      },
    });

    // 6. Map to DTO and return created case
    const caseDto = mapCaseToDto(newCase);
    return NextResponse.json(caseDto, { status: 201 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cases
 *
 * Retrieves all cases for the authenticated user.
 *
 * Query parameters: None
 *
 * Response: 200 OK with array of case objects
 * Error responses: 401 Unauthorized, 500 Internal Server Error
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();

    // 2. Fetch all cases for this user, ordered by most recent first
    const { data: cases, error: fetchError } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching cases:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // 3. Map to DTOs and return cases array (may be empty)
    const caseDtos = (cases ?? []).map(mapCaseToDto);
    return NextResponse.json(caseDtos, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in GET /api/cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
