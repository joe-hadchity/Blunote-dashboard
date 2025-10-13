import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncGoogleCalendarMeetings, getAuthenticatedClient } from '@/lib/google-calendar';

/**
 * POST /api/google-calendar/sync
 * Syncs meetings from Google Calendar to database
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if user has connected Google Calendar
    const oauth2Client = await getAuthenticatedClient(user.id);
    
    if (!oauth2Client) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Perform sync
    const result = await syncGoogleCalendarMeetings(user.id);

    return NextResponse.json({
      message: 'Sync completed successfully',
      result,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Google Calendar', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/google-calendar/sync
 * Get sync status
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if user has connected Google Calendar
    const oauth2Client = await getAuthenticatedClient(user.id);
    
    return NextResponse.json({
      connected: !!oauth2Client,
      userId: user.id,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}





