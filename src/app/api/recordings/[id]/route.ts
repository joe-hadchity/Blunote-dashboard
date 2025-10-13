import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch single recording
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user from token (same as list endpoint)
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    console.log('Fetching recording with ID:', id, 'for user:', user.id);

    // Fetch recording from view
    const { data: recording, error } = await supabaseAdmin
      .from('meetings_with_recordings')
      .select('*')
      .eq('recording_id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching recording:', error);
      console.log('Attempted to fetch recording_id:', id, 'for user_id:', user.id);
    }

    if (error || !recording) {
      console.log('Recording not found with ID:', id);
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    console.log('Found recording:', recording.recording_id, recording.title);

    // Fetch transcript separately (if exists)
    let transcriptData = null;
    if (recording.has_transcript) {
      const { data: transcript } = await supabaseAdmin
        .from('transcripts')
        .select('*')
        .eq('recording_id', id)
        .eq('user_id', user.id)
        .single();
      
      transcriptData = transcript;
      console.log('Transcript found:', transcript ? 'Yes' : 'No');
    }

    // Generate fresh signed URLs for private files
    let freshAudioUrl = recording.audio_url;
    let freshRecordingUrl = recording.recording_url;

    // If there's a storage path, generate a new signed URL
    if (recording.storage_path) {
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from('meeting-audios')
        .createSignedUrl(recording.storage_path, 3600); // 1 hour

      if (!signedError && signedData) {
        freshAudioUrl = signedData.signedUrl;
        freshRecordingUrl = signedData.signedUrl;
      }
    }

    // Transform to camelCase
    const transformedRecording = {
      id: recording.recording_id,
      meetingId: recording.meeting_id,
      title: recording.title,
      description: recording.description,
      platform: recording.platform,
      startTime: recording.start_time,
      endTime: recording.end_time,
      duration: recording.duration,
      recordingUrl: freshRecordingUrl,
      audioUrl: freshAudioUrl,
      transcriptUrl: recording.transcript_url,
      hasVideo: recording.has_video,
      hasAudio: recording.has_audio,
      hasTranscript: recording.has_transcript,
      hasSummary: recording.has_summary || recording.ai_summary,
      participants: recording.participants,
      topics: recording.topics,
      status: recording.status,
      createdAt: recording.created_at,
      type: recording.file_type || (recording.has_video ? 'VIDEO' : 'AUDIO'),
      meetingLink: recording.meeting_link,
      isStandalone: !recording.meeting_id,
      isFavorite: recording.is_favorite,
      // AI-generated content
      aiSummary: recording.ai_summary,
      keyPoints: recording.key_points,
      actionItems: recording.action_items,
      sentiment: recording.sentiment,
      // Transcript data from separate table (better performance)
      transcriptText: transcriptData?.text || null,
      transcriptPlainText: transcriptData?.plain_text || null,
      transcriptSegments: transcriptData?.segments || null,
      transcriptWords: transcriptData?.words || null,
      speakerCount: transcriptData?.speaker_count || 0,
      transcriptionStatus: recording.transcription_status,
      transcriptionLanguage: transcriptData?.language || null,
      transcriptionConfidence: transcriptData?.confidence || null,
    };

    return NextResponse.json({
      meeting: transformedRecording, // Keep as 'meeting' for compatibility
    });
  } catch (error: any) {
    console.error('Error fetching recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete recording and associated files
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('DELETE request for recording:', id);
    
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // Get recording details first
    const { data: recording, error: fetchError } = await supabaseAdmin
      .from('recordings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching recording:', fetchError);
    }

    if (fetchError || !recording) {
      console.log('Recording not found:', id);
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    console.log('Found recording:', recording.id, recording.title);

    // Delete files from storage
    const filesToDelete: string[] = [];

    // Add storage paths to delete
    if (recording.storage_path) {
      filesToDelete.push(recording.storage_path);
      console.log('Will delete file:', recording.storage_path);
    }

    // Delete files from storage
    if (filesToDelete.length > 0) {
      const buckets = ['meeting-videos', 'meeting-audios', 'meeting-transcripts'];
      
      for (const bucket of buckets) {
        for (const path of filesToDelete) {
          try {
            console.log(`Attempting to delete from ${bucket}:`, path);
            const { error: storageError } = await supabaseAdmin.storage
              .from(bucket)
              .remove([path]);
            
            if (storageError) {
              console.log(`Storage delete error in ${bucket}:`, storageError.message);
            } else {
              console.log(`File deleted from ${bucket}`);
            }
          } catch (err: any) {
            // Ignore errors (file might not exist in this bucket)
            console.log(`File not in ${bucket}:`, path);
          }
        }
      }
    } else {
      console.log('No files to delete from storage');
    }

    // Delete recording from database
    console.log('Deleting recording from database:', id);
    const { error: deleteError } = await supabaseAdmin
      .from('recordings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting recording from database:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete recording', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('Recording deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Recording deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update recording
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Only allow updating certain fields
    const allowedUpdates: any = {};
    
    if (body.title !== undefined) allowedUpdates.title = body.title;
    if (body.description !== undefined) allowedUpdates.description = body.description;
    
    // Handle favorite - need to update in meetings table if linked
    if (body.isFavorite !== undefined) {
      // First, get the recording to find the meeting_id
      const { data: recordingData } = await supabaseAdmin
        .from('recordings')
        .select('meeting_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (recordingData?.meeting_id) {
        // Update the linked meeting's favorite status
        await supabaseAdmin
          .from('meetings')
          .update({ is_favorite: body.isFavorite })
          .eq('id', recordingData.meeting_id)
          .eq('user_id', user.id);
      }
      // Note: Favorite is stored in meetings table, not recordings
    }

    // Update recording (title/description)
    if (Object.keys(allowedUpdates).length > 0) {
      const { data: recording, error } = await supabaseAdmin
        .from('recordings')
        .update(allowedUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating recording:', error);
        return NextResponse.json(
          { error: 'Failed to update recording' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recording updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
