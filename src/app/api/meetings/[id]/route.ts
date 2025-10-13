import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET a single meeting
export async function GET(
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

    // Fetch meeting from Supabase using admin client
    const { data: meetingData, error: queryError } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (queryError || !meetingData) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Transform to camelCase
    const meeting = {
      id: meetingData.id,
      title: meetingData.title,
      description: meetingData.description,
      meetingLink: meetingData.meeting_link,
      startTime: meetingData.start_time,
      endTime: meetingData.end_time,
      duration: meetingData.duration,
      type: meetingData.type,
      platform: meetingData.platform,
      status: meetingData.status,
      aiSummary: meetingData.ai_summary,
      keyPoints: meetingData.key_points,
      actionItems: meetingData.action_items,
      participants: meetingData.participants,
      sentiment: meetingData.sentiment,
      topics: meetingData.topics,
      isFavorite: meetingData.is_favorite,
      isArchived: meetingData.is_archived,
      syncedFromGoogle: meetingData.synced_from_google,
      googleEventId: meetingData.google_event_id,
      createdAt: meetingData.created_at,
      updatedAt: meetingData.updated_at,
    }

    return NextResponse.json({ meeting }, { status: 200 })
  } catch (error) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update a meeting
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

    const body = await request.json()

    // Calculate duration if times are provided
    let duration
    if (body.startTime && body.endTime) {
      const startTime = new Date(body.startTime)
      const endTime = new Date(body.endTime)
      duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    }

    // Build update object (only include fields that are provided)
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.startTime !== undefined) updateData.start_time = body.startTime
    if (body.endTime !== undefined) updateData.end_time = body.endTime
    if (duration !== undefined) updateData.duration = duration
    if (body.type !== undefined) updateData.type = body.type
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.status !== undefined) updateData.status = body.status
    if (body.aiSummary !== undefined) updateData.ai_summary = body.aiSummary
    if (body.keyPoints !== undefined) updateData.key_points = body.keyPoints
    if (body.actionItems !== undefined) updateData.action_items = body.actionItems
    if (body.participants !== undefined) updateData.participants = body.participants
    if (body.sentiment !== undefined) updateData.sentiment = body.sentiment
    if (body.topics !== undefined) updateData.topics = body.topics
    if (body.isFavorite !== undefined) updateData.is_favorite = body.isFavorite
    if (body.isArchived !== undefined) updateData.is_archived = body.isArchived

    // Update meeting in Supabase using admin client
    const { data: meetingData, error: updateError } = await supabaseAdmin
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !meetingData) {
      return NextResponse.json(
        { error: 'Failed to update meeting or meeting not found' },
        { status: 404 }
      )
    }

    // Transform to camelCase
    const meeting = {
      id: meetingData.id,
      title: meetingData.title,
      description: meetingData.description,
      meetingLink: meetingData.meeting_link,
      startTime: meetingData.start_time,
      endTime: meetingData.end_time,
      duration: meetingData.duration,
      type: meetingData.type,
      platform: meetingData.platform,
      status: meetingData.status,
      aiSummary: meetingData.ai_summary,
      keyPoints: meetingData.key_points,
      actionItems: meetingData.action_items,
      participants: meetingData.participants,
      sentiment: meetingData.sentiment,
      topics: meetingData.topics,
      isFavorite: meetingData.is_favorite,
      isArchived: meetingData.is_archived,
      syncedFromGoogle: meetingData.synced_from_google,
      googleEventId: meetingData.google_event_id,
      createdAt: meetingData.created_at,
      updatedAt: meetingData.updated_at,
    }

    return NextResponse.json({ meeting }, { status: 200 })
  } catch (error) {
    console.error('Update meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a meeting
export async function DELETE(
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

    // Delete meeting from Supabase using admin client
    const { error: deleteError } = await supabaseAdmin
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete meeting' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Meeting deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

