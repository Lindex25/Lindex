/**
 * LINDEX - Authentication Helper
 *
 * This module bridges Clerk authentication with the Supabase users table.
 *
 * Key responsibilities:
 * 1. Verifies the Clerk session (throws if not authenticated)
 * 2. Ensures a corresponding Supabase users row exists (creates if needed)
 * 3. Returns the internal Supabase user ID for attaching to cases, evidence, etc.
 *
 * Usage in API routes:
 * ```typescript
 * import { getAuthenticatedUser } from '@/lib/auth';
 *
 * export async function POST(request: NextRequest) {
 *   try {
 *     const user = await getAuthenticatedUser();
 *     // user.userId is the Supabase UUID
 *     // user.clerkUserId is the Clerk user ID
 *     // user.email is the user's email
 *   } catch (error) {
 *     return NextResponse.json({ error: error.message }, { status: 401 });
 *   }
 * }
 * ```
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseServer } from './supabase-server';
import { logAuditEvent, AuditActions, EntityTypes } from './audit';

/**
 * Authenticated user object returned by getAuthenticatedUser()
 */
export interface AuthenticatedUser {
  /** Supabase UUID (from users.id) - use this for database relations */
  userId: string;
  /** Clerk user ID - use this for Clerk API calls */
  clerkUserId: string;
  /** User's email address */
  email: string;
}

/**
 * Get or create authenticated user
 *
 * This function:
 * 1. Validates the Clerk session
 * 2. Looks up the user in Supabase by clerk_user_id
 * 3. Creates the user record if it doesn't exist (first login)
 * 4. Returns the user object with Supabase UUID
 *
 * @throws {Error} If user is not authenticated via Clerk
 * @throws {Error} If database operation fails
 * @returns {Promise<AuthenticatedUser>} User object with Supabase UUID
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  // 1. Verify Clerk session
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error('Unauthenticated: No Clerk session found');
  }

  // 2. Get full Clerk user details (for email)
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('Unauthenticated: Clerk user not found');
  }

  // Extract primary email address from Clerk user
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );
  const email = primaryEmail?.emailAddress || '';

  // 3. Look up user in Supabase
  const { data: existingUser, error: lookupError } = await supabaseServer
    .from('users')
    .select('id, clerk_user_id, email')
    .eq('clerk_user_id', clerkUserId)
    .single();

  // If user exists, return it
  if (existingUser) {
    return {
      userId: existingUser.id,
      clerkUserId: existingUser.clerk_user_id,
      email: existingUser.email,
    };
  }

  // If lookup failed for a reason other than "not found", throw error
  if (lookupError && lookupError.code !== 'PGRST116') {
    console.error('Error looking up user in Supabase:', lookupError);
    throw new Error(`Database error: Failed to look up user (${lookupError.message})`);
  }

  // 4. User doesn't exist - create new user record (first login)
  console.log(`Creating new user record for Clerk user: ${clerkUserId}`);

  const { data: newUser, error: insertError } = await supabaseServer
    .from('users')
    .insert({
      clerk_user_id: clerkUserId,
      email: email,
    })
    .select('id, clerk_user_id, email')
    .single();

  if (insertError || !newUser) {
    console.error('Error creating user in Supabase:', insertError);
    throw new Error(
      `Database error: Failed to create user record (${insertError?.message || 'unknown error'})`
    );
  }

  // Log the new user creation to audit log
  await logAuditEvent({
    userId: newUser.id,
    action: AuditActions.USER_CREATED,
    entityType: EntityTypes.USER,
    entityId: newUser.id,
    metadata: {
      clerk_user_id: clerkUserId,
      email: email,
      source: 'first_login',
    },
  });

  return {
    userId: newUser.id,
    clerkUserId: newUser.clerk_user_id,
    email: newUser.email,
  };
}

/**
 * Optional: Get authenticated user ID only (lighter than full object)
 *
 * Useful when you only need the Supabase UUID and don't need email.
 * This still ensures the user exists in the database.
 *
 * @throws {Error} If user is not authenticated
 * @returns {Promise<string>} Supabase user UUID
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser();
  return user.userId;
}

/**
 * Optional: Require authentication in API routes (middleware-style)
 *
 * Example usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const user = await requireAuth();
 *   // If we reach here, user is authenticated
 *   // ...rest of your handler
 * }
 * ```
 *
 * @throws {Error} If user is not authenticated
 * @returns {Promise<AuthenticatedUser>} Authenticated user object
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  return await getAuthenticatedUser();
}

