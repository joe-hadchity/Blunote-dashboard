import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// PUT toggle favorite status for a recording's meeting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Get user from token (support both cookie and Authorization header for extension)
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get the recording to find its meeting_id
    const { data: recording, error: recordingError } = await supabaseAdmin
      .from('recordings')
      .select('meeting_id, user_id')
      .eq('id', id)
      .single()

    if (recordingError || !recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (recording.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // If there's no meeting (standalone recording), we can't toggle favorite
    if (!recording.meeting_id) {
      return NextResponse.json(
        { error: 'This recording is not associated with a meeting' },
        { status: 400 }
      )
    }

    // Get the current meeting to toggle its favorite status
    const { data: currentMeeting, error: fetchError } = await supabaseAdmin
      .from('meetings')
      .select('is_favorite')
      .eq('id', recording.meeting_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Toggle the favorite status
    const newFavoriteStatus = !currentMeeting.is_favorite

    const { data: meetingData, error: updateError } = await supabaseAdmin
      .from('meetings')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', recording.meeting_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !meetingData) {
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        isFavorite: newFavoriteStatus,
        message: newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


