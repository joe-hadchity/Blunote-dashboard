import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET all recordings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('No access token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated - please log in' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Invalid session - please log in again' },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('No user found with token');
      return NextResponse.json(
        { error: 'User not found - please log in again' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id);

    // Get query parameters for filtering and sorting
    const searchParams = request.nextUrl.searchParams
    const platforms = searchParams.getAll('platform') // Get all platform filters
    const type = searchParams.get('type')
    const hasTranscript = searchParams.get('hasTranscript')
    const hasVideo = searchParams.get('hasVideo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')
    const status = searchParams.get('status') // UPLOADING, READY, etc.
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    const maxLimit = 1000
    const actualLimit = Math.min(limit, maxLimit)
    const offset = (page - 1) * actualLimit

    // Build Supabase query - use the view for easier querying
    let query = supabaseAdmin
      .from('meetings_with_recordings')
      .select('*')
      .eq('user_id', user.id)
      .not('recording_id', 'is', null) // Only show meetings with recordings

    // Apply filters
    if (platforms.length > 0) {
      query = query.in('platform', platforms)
    }
    
    if (type) {
      query = query.eq('file_type', type)
    }
    
    if (hasTranscript) {
      query = query.eq('has_transcript', hasTranscript === 'true')
    }
    
    if (hasVideo) {
      query = query.eq('has_video', hasVideo === 'true')
    }
    
    if (status) {
      query = query.eq('recording_status', status)
    } else {
      // Default: only show READY recordings
      query = query.eq('recording_status', 'READY')
    }

    // Enhanced search across recording and meeting data
    if (search) {
      const searchTerm = search.trim()
      query = query.or(
        `title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `ai_summary.ilike.%${searchTerm}%`
      )
    }

    // Apply sorting
    const orderColumn = sortBy === 'createdAt' ? 'created_at' :
                       sortBy === 'startTime' ? 'created_at' :
                       sortBy === 'duration' ? 'duration' : 'created_at'
    
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' })

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('meetings_with_recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('recording_id', 'is', null)

    // Apply same filters to count
    if (platforms.length > 0) {
      countQuery = countQuery.in('platform', platforms)
    }
    if (type) {
      countQuery = countQuery.eq('file_type', type)
    }
    if (hasTranscript) {
      countQuery = countQuery.eq('has_transcript', hasTranscript === 'true')
    }
    if (hasVideo) {
      countQuery = countQuery.eq('has_video', hasVideo === 'true')
    }
    if (status) {
      countQuery = countQuery.eq('recording_status', status)
    } else {
      countQuery = countQuery.eq('recording_status', 'READY')
    }
    if (search) {
      const searchTerm = search.trim()
      countQuery = countQuery.or(
        `title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `ai_summary.ilike.%${searchTerm}%`
      )
    }

    const { count } = await countQuery
    const totalCount = count || 0

    // Apply pagination
    query = query.range(offset, offset + actualLimit - 1)

    // Execute query
    const { data: recordings, error: queryError } = await query

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch recordings', details: queryError.message },
        { status: 500 }
      )
    }

    // Transform data to match expected format and generate signed URLs
    const transformedRecordings = await Promise.all(
      (recordings || []).map(async (rec: any) => {
        // Generate fresh signed URLs for private files (1 hour expiry for list view)
        let freshAudioUrl = rec.audio_url
        let freshRecordingUrl = rec.recording_url

        if (rec.storage_path) {
          try {
            const { data: signedData } = await supabaseAdmin.storage
              .from('meeting-audios')
              .createSignedUrl(rec.storage_path, 3600) // 1 hour

            if (signedData) {
              freshAudioUrl = signedData.signedUrl
              freshRecordingUrl = signedData.signedUrl
            }
          } catch (err) {
            console.error('Error generating signed URL:', err)
            // Keep original URLs as fallback
          }
        }

        return {
          // Use recording_id as primary for routing
          id: rec.recording_id,  // Always use recording ID
          recordingId: rec.recording_id,
          meetingId: rec.id,  // Meeting ID (can be NULL)
          
          // Meeting/Recording fields (COALESCE in view handles standalone)
          title: rec.title,
          description: rec.description,
          startTime: rec.start_time || rec.created_at,  // Use created_at for standalone
          endTime: rec.end_time || rec.created_at,
          duration: rec.duration || Math.floor((rec.recording_duration_seconds || 0) / 60),  // Convert seconds to minutes
          type: rec.type,
          platform: rec.platform || 'OTHER',
          status: rec.status || 'COMPLETED',
          participants: rec.participants || [],
          topics: rec.topics || [],
          sentiment: rec.sentiment,
          aiSummary: rec.ai_summary,
          keyPoints: rec.key_points || [],
          actionItems: rec.action_items || [],
          isFavorite: rec.is_favorite || false,
          syncedFromGoogle: rec.synced_from_google || false,
          googleEventId: rec.google_event_id,
          
          // Recording-specific fields (with fresh signed URLs)
          recordingUrl: freshRecordingUrl,
          audioUrl: freshAudioUrl,
          transcriptUrl: rec.transcript_url,
          fileType: rec.type,
          fileSize: rec.file_size,
          recordingFormat: rec.recording_format,
          recordingStatus: rec.recording_status,
          hasVideo: rec.has_video,
          hasAudio: rec.has_audio,
          hasTranscript: rec.has_transcript,
          transcriptionStatus: rec.transcription_status,
          
          // Metadata
          isStandalone: rec.id === null,  // NULL meeting_id = standalone
          
          // Timestamps
          createdAt: rec.created_at,
          updatedAt: rec.updated_at,
        }
      })
    )

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / actualLimit)
    const hasMore = page < totalPages

    return NextResponse.json({
      recordings: transformedRecordings,
      pagination: {
        page,
        limit: actualLimit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    })
  } catch (error: any) {
    console.error('Recordings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

