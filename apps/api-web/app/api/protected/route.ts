import { getAuthenticatedUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/protected
 *
 * Protected endpoint demonstrating authentication with Clerk + Supabase integration.
 * This endpoint verifies the user's Clerk session and ensures they exist in the
 * Supabase users table (auto-creating on first access).
 */
export async function GET() {
  try {
    // Authenticate user via Clerk and get/create Supabase user record
    const user = await getAuthenticatedUser();

    return NextResponse.json({
      ok: true,
      message: 'You are authenticated',
      userId: user.userId,           // Supabase UUID
      clerkUserId: user.clerkUserId, // Clerk user ID
      email: user.email,             // User's email
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
          message: 'You must be signed in to access this resource'
        },
        { status: 401 }
      );
    }

    // Handle unexpected errors
    console.error('Error in GET /api/protected:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/protected
 *
 * Example POST endpoint demonstrating how to handle authenticated requests
 * with the getAuthenticatedUser() helper.
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser();

    // Parse request body
    const body = await request.json();

    // Example: You can now use user.userId for database operations
    // const { data, error } = await supabaseServer
    //   .from('your_table')
    //   .insert({
    //     user_id: user.userId,  // Use Supabase UUID
    //     ...body,
    //   })
    //   .select()
    //   .single();

    return NextResponse.json({
      ok: true,
      message: 'Data received successfully',
      userId: user.userId,
      clerkUserId: user.clerkUserId,
      receivedData: body,
    });

  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthenticated')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
          message: 'You must be signed in to access this resource'
        },
        { status: 401 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid JSON body'
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Error in POST /api/protected:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
