import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Public Supabase client - uses anon key
 * Use for public operations that don't require elevated permissions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin Supabase client - uses service role key
 * Use for server-side operations that need to bypass RLS
 * NEVER expose this client to the frontend
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Creates a Supabase client with the user's context
 * This allows RLS policies to work based on the authenticated user
 *
 * @param userId - The Clerk user ID to associate with Supabase requests
 * @returns SupabaseClient configured with user context
 */
export function createSupabaseClientWithUser(userId: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-clerk-user-id': userId,
      },
    },
  });
}


