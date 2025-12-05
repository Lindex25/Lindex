/**
 * LINDEX - Server-Side Supabase Client
 *
 * ⚠️ SERVER-ONLY - DO NOT IMPORT IN CLIENT COMPONENTS ⚠️
 *
 * This client uses the SUPABASE_SERVICE_ROLE_KEY which:
 * - Bypasses Row Level Security (RLS) policies
 * - Has full admin access to the database
 * - Must NEVER be exposed to the browser/client
 *
 * Usage:
 * - API routes (app/api/*)
 * - Server Components (app/*/page.tsx, layout.tsx with no 'use client')
 * - Server Actions
 * - Middleware (with caution)
 *
 * Current Architecture:
 * - Authentication: Clerk (manages users, sessions, JWT)
 * - Database: Supabase (with service_role key from backend)
 * - Authorization: Application layer (enforce user_id checks in code)
 *
 * Security Notes:
 * - RLS is enabled on all tables but bypassed by service_role key
 * - Always validate Clerk user authentication before database operations
 * - Enforce per-user data isolation in application logic
 * - Never pass raw user input directly to queries
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
    'Please add it to your .env.local file. ' +
    'Get this from: Supabase Dashboard → Settings → API → service_role key'
  );
}

/**
 * Server-side Supabase client with service_role privileges
 *
 * This client:
 * - Has full database access (bypasses RLS)
 * - Does not persist sessions (server-side only)
 * - Should only be used in secure server contexts
 *
 * Example usage in API route:
 * ```typescript
 * import { supabaseServer } from '@/lib/supabase-server';
 * import { auth } from '@clerk/nextjs/server';
 *
 * export async function GET() {
 *   const { userId } = await auth();
 *   if (!userId) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   // Get user's cases - enforce user_id check in application logic
 *   const { data, error } = await supabaseServer
 *     .from('cases')
 *     .select('*')
 *     .eq('user_id', userId);
 *
 *   return Response.json({ data, error });
 * }
 * ```
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Type helper: Database types will be auto-generated from Supabase
 *
 * To generate types, run:
 * npx supabase gen types typescript --project-id <your-project-ref> > lib/database.types.ts
 *
 * Then import and use:
 * import { Database } from '@/lib/database.types';
 * export const supabaseServer = createClient<Database>(...);
 */

