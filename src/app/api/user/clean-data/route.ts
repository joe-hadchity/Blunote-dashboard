import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
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

    console.log('Cleaning recordings data for user:', user.id);

    // Delete all recordings (this will cascade delete transcripts due to foreign key)
    // BUT keep the meeting entries (especially synced calendar meetings)
    const { error: recordingsError, count: recordingsCount } = await supabaseAdmin
      .from('recordings')
      .delete()
      .eq('user_id', user.id)
      .select('id', { count: 'exact', head: false });

    if (recordingsError) {
      console.error('Error deleting recordings:', recordingsError);
      return NextResponse.json(
        { error: 'Failed to clean recordings' },
        { status: 500 }
      );
    }

    // Note: We keep meetings intact (synced calendar meetings, scheduled meetings, etc.)
    // Only the recording files and their associated data (transcripts, summaries) are deleted
    console.log(`Successfully cleaned ${recordingsCount || 0} recordings for user:`, user.id);

    return NextResponse.json(
      { 
        message: `Successfully deleted ${recordingsCount || 0} recordings`,
        deletedRecordings: recordingsCount || 0,
        keptMeetings: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Clean data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

