import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// PUT toggle favorite status
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

    // First, get the current meeting to toggle its favorite status using admin client
    const { data: currentMeeting, error: fetchError } = await supabaseAdmin
      .from('meetings')
      .select('is_favorite')
      .eq('id', id)
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
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !meetingData) {
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      )
    }

    // Transform to camelCase
    const meeting = {
      id: meetingData.id,
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.start_time,
      endTime: meetingData.end_time,
      duration: meetingData.duration,
      type: meetingData.type,
      platform: meetingData.platform,
      status: meetingData.status,
      recordingUrl: meetingData.recording_url,
      transcriptUrl: meetingData.transcript_url,
      audioUrl: meetingData.audio_url,
      hasTranscript: meetingData.has_transcript,
      hasSummary: meetingData.has_summary,
      hasVideo: meetingData.has_video,
      aiSummary: meetingData.ai_summary,
      keyPoints: meetingData.key_points,
      actionItems: meetingData.action_items,
      participants: meetingData.participants,
      sentiment: meetingData.sentiment,
      topics: meetingData.topics,
      isFavorite: meetingData.is_favorite,
      isArchived: meetingData.is_archived,
      createdAt: meetingData.created_at,
      updatedAt: meetingData.updated_at,
    }

    return NextResponse.json(
      { 
        meeting,
        message: meeting.isFavorite ? 'Added to favorites' : 'Removed from favorites'
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

