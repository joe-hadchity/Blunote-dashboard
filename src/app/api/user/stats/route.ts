import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

    // Get total recordings count
    const { count: recordingsCount, error: countError } = await supabaseAdmin
      .from('recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get all recordings to calculate total duration and storage
    const { data: recordings, error: recordingsError } = await supabaseAdmin
      .from('recordings')
      .select('duration, file_size')
      .eq('user_id', user.id);

    if (recordingsError) {
      console.error('Error fetching recordings:', recordingsError);
    }

    // Calculate total hours (duration is in seconds)
    const totalSeconds = recordings?.reduce((sum, rec) => sum + (rec.duration || 0), 0) || 0;
    const totalHours = totalSeconds / 3600;

    // Calculate storage used (file_size is in bytes)
    const totalBytes = recordings?.reduce((sum, rec) => sum + (rec.file_size || 0), 0) || 0;
    const storageUsedMB = totalBytes / (1024 * 1024); // Convert to MB

    console.log('Storage calculation:', {
      totalRecordings: recordingsCount,
      totalBytes,
      storageUsedMB,
      recordings: recordings?.map(r => ({ duration: r.duration, file_size: r.file_size }))
    });

    return NextResponse.json({
      totalRecordings: recordingsCount || 0,
      totalHours: parseFloat(totalHours.toFixed(2)),
      storageUsedMB: parseFloat(storageUsedMB.toFixed(2)), // in MB
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

