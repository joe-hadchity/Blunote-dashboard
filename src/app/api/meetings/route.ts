import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Normalize meeting links for duplicate detection
 * Extracts the core meeting ID from various meeting platforms
 */
function normalizeMeetingLink(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Google Meet: meet.google.com/abc-defg-hij
    if (hostname.includes('meet.google.com')) {
      // Extract meeting code (e.g., abc-defg-hij)
      const meetingCode = urlObj.pathname.replace(/^\//, '').split('?')[0];
      return `googlemeet:${meetingCode}`;
    }
    
    // Zoom: zoom.us/j/123456789 or zoom.us/my/username
    if (hostname.includes('zoom.us') || hostname.includes('zoom.com')) {
      // Extract meeting ID or room name
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts[0] === 'j' && pathParts[1]) {
        return `zoom:${pathParts[1]}`; // Meeting ID
      } else if (pathParts[0] === 'my' && pathParts[1]) {
        return `zoom:my:${pathParts[1]}`; // Personal room
      }
      return `zoom:${urlObj.pathname}`;
    }
    
    // Microsoft Teams: teams.microsoft.com/l/meetup-join/...
    if (hostname.includes('teams.microsoft.com')) {
      // Use the full path as identifier
      return `teams:${urlObj.pathname}${urlObj.search}`;
    }
    
    // For other platforms, use the full URL
    return url.toLowerCase().trim();
  } catch (e) {
    // If URL parsing fails, return the original string
    return url.toLowerCase().trim();
  }
}

// GET all meetings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value

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

    // Get query parameters for filtering and sorting
    const searchParams = request.nextUrl.searchParams
    const platforms = searchParams.getAll('platform') // Get all platform filters
    const type = searchParams.get('type')
    const hasTranscript = searchParams.get('hasTranscript')
    const hasVideo = searchParams.get('hasVideo')
    const hasRecording = searchParams.get('hasRecording') // Filter for meetings with video OR audio
    const isFavorite = searchParams.get('isFavorite')
    const sortBy = searchParams.get('sortBy') || 'startTime'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    const maxLimit = 1000 // Maximum items (high limit for calendar view)
    const defaultPageLimit = 5 // Default for table view
    
    // Use requested limit but cap it at maxLimit
    const actualLimit = Math.min(limit, maxLimit)
    const offset = (page - 1) * actualLimit

    // Build Supabase query using admin client
    // For calendar view (high limit), show ALL meetings
    // For recordings view, filter is done at component level
    let query = supabaseAdmin
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)

    // Apply filters
    if (platforms.length > 0) {
      query = query.in('platform', platforms)
    }
    if (type) {
      query = query.eq('type', type)
    }
    // Note: hasTranscript and hasVideo are now in recordings table
    // For meetings API (used by calendar), we return all meetings
    if (isFavorite) {
      query = query.eq('is_favorite', isFavorite === 'true')
    }
    // Enhanced search across multiple fields
    if (search) {
      const searchTerm = search.trim()
      
      // Search across: title, description, and ai_summary using ILIKE
      // Also search in participants and topics arrays
      query = query.or(
        `title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `ai_summary.ilike.%${searchTerm}%`
      )
    }
    
    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate: Date | null = null
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          query = query.gte('start_time', startDate.toISOString())
          query = query.lt('start_time', new Date(now.setHours(23, 59, 59, 999)).toISOString())
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          yesterday.setHours(0, 0, 0, 0)
          const yesterdayEnd = new Date(yesterday)
          yesterdayEnd.setHours(23, 59, 59, 999)
          query = query.gte('start_time', yesterday.toISOString())
          query = query.lt('start_time', yesterdayEnd.toISOString())
          break
        case 'last_7_days':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          query = query.gte('start_time', weekAgo.toISOString())
          break
        case 'last_month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          query = query.gte('start_time', monthAgo.toISOString())
          break
      }
    }

    // Apply sorting
    const orderColumn = sortBy === 'startTime' ? 'start_time' :
                       sortBy === 'updatedAt' ? 'updated_at' :
                       sortBy === 'duration' ? 'duration' : 'title'
    
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' })

    // First, get the total count for pagination
    const countQuery = supabaseAdmin
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false)

    // Apply same filters to count query
    if (platforms.length > 0) {
      countQuery.in('platform', platforms)
    }
    if (type) {
      countQuery.eq('type', type)
    }
    // Note: hasTranscript and hasVideo are now in recordings table
    // For meetings API, count all meetings
    if (isFavorite) {
      countQuery.eq('is_favorite', isFavorite === 'true')
    }
    // Apply search to count query (same as main query)
    if (search) {
      const searchTerm = search.trim()
      
      countQuery.or(
        `title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `ai_summary.ilike.%${searchTerm}%`
      )
    }
    
    // Apply date range filter to count query
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      
      switch (dateRange) {
        case 'today':
          const todayStart = new Date(now.setHours(0, 0, 0, 0))
          countQuery.gte('start_time', todayStart.toISOString())
          countQuery.lt('start_time', new Date(now.setHours(23, 59, 59, 999)).toISOString())
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          yesterday.setHours(0, 0, 0, 0)
          const yesterdayEnd = new Date(yesterday)
          yesterdayEnd.setHours(23, 59, 59, 999)
          countQuery.gte('start_time', yesterday.toISOString())
          countQuery.lt('start_time', yesterdayEnd.toISOString())
          break
        case 'last_7_days':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          countQuery.gte('start_time', weekAgo.toISOString())
          break
        case 'last_month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          countQuery.gte('start_time', monthAgo.toISOString())
          break
      }
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json(
        { error: 'Failed to count meetings' },
        { status: 500 }
      )
    }

    // Apply pagination
    query = query.range(offset, offset + actualLimit - 1)

    // Execute query
    const { data: meetingsData, error: queryError } = await query

    if (queryError) {
      console.error('Query error:', queryError)
      console.error('Query error details:', JSON.stringify(queryError, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch meetings', details: queryError.message },
        { status: 500 }
      )
    }

    if (!meetingsData) {
      console.log('No meetings data returned')
      return NextResponse.json({
        meetings: [],
        pagination: {
          page,
          limit: actualLimit,
          totalCount: totalCount || 0,
          totalPages: 0,
        },
      })
    }

    console.log(`Found ${meetingsData.length} meetings for user ${user.id} (page ${page})`)

    // Fetch recording IDs for these meetings
    const meetingIds = meetingsData.map(m => m.id)
    let recordingsMap: Record<string, string> = {}
    
    if (meetingIds.length > 0) {
      const { data: recordingsData, error: recordingsError } = await supabaseAdmin
        .from('recordings')
        .select('id, meeting_id')
        .in('meeting_id', meetingIds)

      if (!recordingsError && recordingsData) {
        // Create a map of meeting_id -> recording_id
        recordingsMap = recordingsData.reduce((acc, r) => {
          if (r.meeting_id) {
            acc[r.meeting_id] = r.id
          }
          return acc
        }, {} as Record<string, string>)
      }
    }

    // Transform snake_case to camelCase for frontend
    const meetings = meetingsData.map((meeting: any) => {
      // Get recording ID from our map
      const recordingId = recordingsMap[meeting.id] || null
      
      return {
        id: meeting.id,
        recordingId: recordingId, // Include recording ID for routing to /recording/[id]
        title: meeting.title,
        description: meeting.description,
        meetingLink: meeting.meeting_link, // Google Meet/Zoom link for joining
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        duration: meeting.duration,
        type: meeting.type,
        platform: meeting.platform,
        status: meeting.status,
        aiSummary: meeting.ai_summary,
        keyPoints: meeting.key_points,
        actionItems: meeting.action_items,
        participants: meeting.participants,
        sentiment: meeting.sentiment,
        topics: meeting.topics,
        isFavorite: meeting.is_favorite,
        isArchived: meeting.is_archived,
        syncedFromGoogle: meeting.synced_from_google,
        googleEventId: meeting.google_event_id,
        createdAt: meeting.created_at,
        updatedAt: meeting.updated_at,
        // Recording fields - check if recording exists
        hasVideo: recordingId ? true : false,
        hasTranscript: recordingId ? true : false, // Assume recorded meetings have transcripts
        hasSummary: meeting.ai_summary ? true : false,
        recordingUrl: null, // Not needed for calendar
        audioUrl: null,
        transcriptUrl: null,
      };
    })

    // Calculate pagination metadata
    const total = totalCount || 0
    const totalPages = Math.ceil(total / actualLimit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      meetings,
      pagination: {
        page,
        limit: actualLimit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Get meetings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new meeting
export async function POST(request: NextRequest) {
  try {
    // Get user from token (support both cookie and custom header for extension)
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.headers.get('x-auth-token')

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
    
    // Support extension format (simpler) and full format
    // Extension sends: { title, meeting_date, duration_minutes, platform, status }
    // Full format sends: { title, startTime, endTime, ... }
    
    let startTime: Date
    let endTime: Date
    let duration: number

    if (body.meeting_date && body.duration_minutes) {
      // Extension format
      startTime = new Date(body.meeting_date)
      duration = body.duration_minutes || 0
      endTime = new Date(startTime.getTime() + duration * 60 * 1000)
    } else if (body.startTime && body.endTime) {
      // Full format
      startTime = new Date(body.startTime)
      endTime = new Date(body.endTime)
      duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    } else {
      return NextResponse.json(
        { error: 'Either (meeting_date + duration_minutes) or (startTime + endTime) are required' },
        { status: 400 }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Note: Duplicate detection for recording URLs moved to recordings table
    // Meetings table only stores meeting metadata now

    // Insert meeting into Supabase using admin client
    const { data: meetingData, error: insertError } = await supabaseAdmin
      .from('meetings')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
        type: body.type || 'VIDEO',
        platform: body.platform || 'OTHER',
        status: body.status || 'SCHEDULED',
        ai_summary: body.aiSummary || null,
        key_points: body.keyPoints || [],
        action_items: body.actionItems || [],
        participants: body.participants || [],
        sentiment: body.sentiment || null,
        topics: body.topics || [],
        is_favorite: body.isFavorite || false,
        is_archived: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create meeting' },
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

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

