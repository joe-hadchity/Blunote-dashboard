import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { disconnectGoogleCalendar } from '@/lib/google-calendar';

/**
 * DELETE /api/google-calendar/disconnect
 * Disconnects user's Google Calendar
 */
export async function DELETE(request: NextRequest) {
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

    // Disconnect Google Calendar and remove synced meetings
    const result = await disconnectGoogleCalendar(user.id, true);

    return NextResponse.json({
      message: 'Google Calendar disconnected and synced meetings removed',
      result,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}

