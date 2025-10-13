import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { transcribeAudio, isAzureSpeechConfigured } from '@/lib/azure-speech';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header or cookie
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || 
                       request.cookies.get('sb-access-token')?.value;

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

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const title = formData.get('title') as string;
    const platform = formData.get('platform') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const meetingUrl = formData.get('meetingUrl') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Extension upload:', {
      title,
      platform,
      duration,
      fileSize: audioFile.size,
      fileName: audioFile.name
    });

    // Upload file to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${timestamp}-${audioFile.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('meeting-audios')
      .upload(filePath, audioFile, {
        contentType: audioFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get signed URL (private, expires in 1 year)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('meeting-audios')
      .createSignedUrl(filePath, 31536000); // 1 year = 365 days * 24 hours * 60 minutes * 60 seconds

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      throw new Error('Failed to create signed URL');
    }

    const audioUrl = urlData.signedUrl;

    // Normalize platform name
    const normalizedPlatform = platform?.toUpperCase() || 'GOOGLE_MEET';
    
    // Check if meeting with this URL already exists
    let meetingId = null;
    if (meetingUrl) {
      const { data: existingMeeting } = await supabaseAdmin
        .from('meetings')
        .select('id')
        .eq('user_id', user.id)
        .eq('meeting_link', meetingUrl)
        .single();
      
      meetingId = existingMeeting?.id || null;
    }

    // If no existing meeting, create one
    if (!meetingId) {
      const now = new Date();
      const startTime = new Date(now.getTime() - (duration * 1000)); // Subtract duration
      
      const { data: newMeeting, error: meetingError } = await supabaseAdmin
        .from('meetings')
        .insert({
          user_id: user.id,
          title: title || 'Recorded Meeting',
          description: `Recorded from ${normalizedPlatform.replace('_', ' ')} at ${now.toLocaleString()}`,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration: Math.ceil(duration / 60), // Convert seconds to minutes
          type: 'AUDIO',
          platform: normalizedPlatform,
          status: 'COMPLETED',
          meeting_link: meetingUrl || null,
        })
        .select('id')
        .single();
      
      if (meetingError) {
        console.error('Error creating meeting:', meetingError);
        // Continue anyway, recording can be standalone
      } else {
        meetingId = newMeeting.id;
        console.log('Created new meeting:', meetingId);
      }
    }
    
    console.log('Creating recording with data:', {
      title,
      platform: normalizedPlatform,
      duration,
      fileSize: audioFile.size,
      meetingId
    });

    // Create recording in database
    const { data: recording, error: recordingError } = await supabaseAdmin
      .from('recordings')
      .insert({
        meeting_id: meetingId,  // Linked to meeting (which has platform)
        user_id: user.id,
        title: title || 'Recorded Meeting',
        description: `Recorded from ${normalizedPlatform.replace('_', ' ')} at ${new Date().toLocaleString()}`,
        audio_url: audioUrl,
        recording_url: audioUrl,  // Same as audio for audio-only
        file_type: 'AUDIO',
        format: 'webm',  // Correct field name
        file_size: audioFile.size,
        duration: duration,  // Duration in seconds (correct field name)
        has_video: false,
        has_audio: true,
        has_transcript: false,
        status: 'READY',  // Correct field name
        storage_bucket: 'meeting-audios',
        storage_path: filePath,
      })
      .select()
      .single();

    if (recordingError) {
      console.error('Database insert error:', recordingError);
      
      // Clean up uploaded file
      await supabaseAdmin.storage
        .from('meeting-audios')
        .remove([filePath]);
      
      return NextResponse.json(
        { error: 'Failed to save recording', details: recordingError.message },
        { status: 500 }
      );
    }

    console.log('Recording saved successfully:', recording.id);
    console.log('Recording details:', {
      id: recording.id,
      title: recording.title,
      duration: recording.duration,
      platform: normalizedPlatform,
      meetingId: meetingId,
      has_audio: recording.has_audio,
      has_video: recording.has_video
    });

    // Trigger transcription in background (don't wait)
    if (isAzureSpeechConfigured()) {
      console.log('Triggering transcription for recording:', recording.id);
      
      // Run transcription asynchronously (don't block response)
      transcribeAudio(audioUrl, recording.id)
        .then(() => {
          console.log('✅ Transcription completed for:', recording.id);
        })
        .catch((err) => {
          console.error('❌ Transcription failed for:', recording.id, err.message);
        });
    } else {
      console.warn('⚠️ Transcription skipped: Azure Speech not configured');
    }

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        meetingId: meetingId,
        title: recording.title,
        audioUrl: recording.audio_url,
        duration: recording.duration,
        platform: normalizedPlatform,
        hasAudio: recording.has_audio,
        hasVideo: recording.has_video,
        createdAt: recording.created_at,
      },
      message: 'Recording uploaded successfully. Transcription started.',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Extension upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Configure for larger file uploads (up to 100MB)
export const config = {
  api: {
    bodyParser: false,
  },
};

