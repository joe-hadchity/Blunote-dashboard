import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch user's meetings with recordings
    const { data: meetings, error: meetingsError } = await supabaseAdmin
      .from('meetings')
      .select(`
        *,
        recordings!meeting_id (
          id,
          recording_url,
          audio_url,
          transcript_url,
          file_size,
          duration,
          has_transcript
        )
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Get current date for filenames
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).replace(/,/g, '');

    // 1. Create README.txt
    const readme = `BLUENOTE DATA EXPORT
====================
Exported on: ${now.toLocaleString('en-US', { 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})}
Account: ${user.email}
Name: ${user.user_metadata?.full_name || user.email}

This archive contains:
- All your meeting summaries and details
- Full transcripts of your recordings (where available)
- Your usage statistics
- Meeting metadata (participants, topics, timestamps)

HOW TO USE
----------
1. Extract this ZIP file to a folder
2. Open "my-meetings.csv" in Excel or Google Sheets to see all meetings
3. Open transcript files in Notepad/Word to read full conversations
4. Keep "my-statistics.txt" for your records

FILE STRUCTURE
--------------
📄 README.txt              - This file (instructions)
📄 my-statistics.txt       - Your usage statistics
📄 my-meetings.csv         - All meetings in spreadsheet format (open in Excel!)
📁 Transcripts/            - Full transcripts (where available)

PRIVACY NOTE
------------
This export does NOT include the actual audio/video files (only links).
To download recordings, visit: https://localhost:3000/recordings

Questions? Visit: https://localhost:3000/support
`;

    zip.file('README.txt', readme);

    // 2. Create statistics file
    const totalRecordings = meetings?.length || 0;
    const totalSeconds = meetings?.reduce((sum, m) => sum + (m.duration || 0), 0) || 0;
    const totalHours = (totalSeconds / 60).toFixed(1);
    
    const statistics = `YOUR BLUENOTE STATISTICS
========================

Account Information
-------------------
Name: ${user.user_metadata?.full_name || user.email}
Email: ${user.email}
Member Since: ${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}

Usage Statistics
----------------
Total Meetings: ${totalRecordings}
Total Time Recorded: ${totalHours} hours
Export Date: ${dateStr}

Recording Breakdown
-------------------
`;

    // Add platform breakdown
    const platformCounts: Record<string, number> = {};
    meetings?.forEach(m => {
      const platform = m.platform || 'OTHER';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    let platformStats = '';
    Object.entries(platformCounts).forEach(([platform, count]) => {
      const platformName = platform.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      platformStats += `${platformName}: ${count} meetings\n`;
    });

    zip.file('my-statistics.txt', statistics + platformStats);

    // 3. Create Meetings CSV file
    if (meetings && meetings.length > 0) {
      // CSV Header
      const csvHeaders = [
        'Date',
        'Title',
        'Duration (min)',
        'Platform',
        'Status',
        'Participants',
        'Topics',
        'Summary',
        'Key Points',
        'Action Items',
        'Sentiment',
        'Has Recording',
        'Recording Link'
      ];

      // Helper function to escape CSV fields
      const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Build CSV rows
      const csvRows = meetings.map((meeting: any) => {
        const date = new Date(meeting.start_time).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const participants = meeting.participants?.join(', ') || '';
        const topics = meeting.topics?.join(', ') || '';
        const keyPoints = meeting.key_points?.join('; ') || '';
        const actionItems = meeting.action_items?.join('; ') || '';
        const platform = meeting.platform?.replace(/_/g, ' ') || '';
        const hasRecording = meeting.recordings && meeting.recordings.length > 0 ? 'Yes' : 'No';
        const recordingLink = meeting.recordings?.[0]?.recording_url || '';

        return [
          escapeCsvField(date),
          escapeCsvField(meeting.title),
          escapeCsvField(meeting.duration),
          escapeCsvField(platform),
          escapeCsvField(meeting.status),
          escapeCsvField(participants),
          escapeCsvField(topics),
          escapeCsvField(meeting.ai_summary),
          escapeCsvField(keyPoints),
          escapeCsvField(actionItems),
          escapeCsvField(meeting.sentiment),
          escapeCsvField(hasRecording),
          escapeCsvField(recordingLink)
        ].join(',');
      });

      // Combine header and rows
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      zip.file('my-meetings.csv', csvContent);
    } else {
      zip.file('my-meetings.csv', 'Date,Title,Duration,Platform,Status\nNo meetings yet');
    }

    // 4. Create Transcripts folder (if transcripts exist)
    const transcriptsFolder = zip.folder('Transcripts');
    let transcriptCount = 0;

    if (meetings && meetings.length > 0) {
      for (const meeting of meetings) {
        // Check if meeting has a recording with transcript
        if (meeting.recordings && meeting.recordings.length > 0) {
          const recording = meeting.recordings[0];
          
          // Fetch transcript if available
          if (recording.has_transcript) {
            try {
              const { data: transcript } = await supabaseAdmin
                .from('transcripts')
                .select('content, speakers')
                .eq('recording_id', recording.id)
                .single();

              if (transcript && transcript.content) {
                const meetingDate = new Date(meeting.start_time).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '-');
                
                const safeTitle = (meeting.title || 'Untitled').replace(/[<>:"/\\|?*]/g, '-');
                const filename = `${meetingDate} - ${safeTitle} - Transcript.txt`;

                const transcriptContent = `TRANSCRIPT: ${meeting.title || 'Untitled Meeting'}
${'='.repeat(50)}

Date: ${new Date(meeting.start_time).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric'
})}

FULL TRANSCRIPT
---------------

${transcript.content}

${transcript.speakers && transcript.speakers.length > 0 ? `
SPEAKERS DETECTED
-----------------
${transcript.speakers.map((s: string) => `• ${s}`).join('\n')}
` : ''}
---
Recording Duration: ${recording.duration} seconds
`;

                transcriptsFolder?.file(filename, transcriptContent);
                transcriptCount++;
              }
            } catch (error) {
              console.error('Error fetching transcript:', error);
            }
          }
        }
      }
    }

    if (transcriptCount === 0) {
      transcriptsFolder?.file('no-transcripts-yet.txt', 'No transcripts available yet. Transcripts are generated when you record meetings with the Auto-Transcribe feature enabled.');
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9 // Maximum compression
      }
    });

    // Return ZIP file
    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="bluenote-export-${dateStr.replace(/ /g, '-')}.zip"`,
      },
    });

  } catch (error) {
    console.error('Download data error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

