import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createGoogleCalendarEvent } from '@/lib/google-calendar';

/**
 * POST /api/google-calendar/create-event
 * Creates an event in Google Calendar
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

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Create event in Google Calendar
    const googleEvent = await createGoogleCalendarEvent(user.id, {
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      attendees: body.attendees,
      addGoogleMeet: body.addGoogleMeet,
    });

    return NextResponse.json({
      message: 'Event created successfully',
      event: googleEvent,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', message: error.message },
      { status: 500 }
    );
  }
}





