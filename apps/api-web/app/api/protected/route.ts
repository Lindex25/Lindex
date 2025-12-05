import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be signed in to access this resource' },
      { status: 401 }
    );
  }

  // Get full user details from Clerk
  const user = await currentUser();

  // Example: Use Supabase with the authenticated user context
  // This demonstrates that Clerk auth works with Supabase operations
  // You can use supabaseAdmin for operations that need service role access

  // Example query (will work once you have tables set up)
  // const { data, error } = await supabaseAdmin
  //   .from('profiles')
  //   .select('*')
  //   .eq('clerk_user_id', userId)
  //   .single();

  return NextResponse.json({
    ok: true,
    message: 'You are authenticated via Clerk',
    user: {
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
    },
    supabaseConnected: true,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Example POST endpoint showing how to save data to Supabase
 * with Clerk authentication
 */
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be signed in to access this resource' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Example: Insert data into Supabase with the user's ID
    // Uncomment and modify once you have your tables set up:
    // const { data, error } = await supabaseAdmin
    //   .from('your_table')
    //   .insert({
    //     clerk_user_id: userId,
    //     ...body,
    //   })
    //   .select()
    //   .single();
    //
    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }

    return NextResponse.json({
      ok: true,
      message: 'Data received successfully',
      userId,
      receivedData: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}
