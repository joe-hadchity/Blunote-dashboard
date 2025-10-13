import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
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

    // Get autoDeleteAfter setting from request body
    const { autoDeleteAfter } = await request.json();

    // If never, don't delete anything
    if (!autoDeleteAfter || autoDeleteAfter === 'never') {
      return NextResponse.json({
        message: 'Auto-delete is disabled',
        deletedCount: 0,
      }, { status: 200 });
    }

    // Convert autoDeleteAfter to days
    const daysToKeep = parseInt(autoDeleteAfter);
    if (isNaN(daysToKeep) || daysToKeep <= 0) {
      return NextResponse.json(
        { error: 'Invalid autoDeleteAfter value' },
        { status: 400 }
      );
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    console.log(`Auto-deleting recordings for user ${user.id} older than ${daysToKeep} days (before ${cutoffDate.toISOString()})`);

    // Find recordings older than cutoffDate
    const { data: oldRecordings, error: fetchError } = await supabaseAdmin
      .from('recordings')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Error fetching old recordings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      );
    }

    if (!oldRecordings || oldRecordings.length === 0) {
      return NextResponse.json({
        message: 'No old recordings to delete',
        deletedCount: 0,
      }, { status: 200 });
    }

    // Delete old recordings
    const { error: deleteError, count } = await supabaseAdmin
      .from('recordings')
      .delete()
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      console.error('Error deleting old recordings:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete recordings' },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted ${count || oldRecordings.length} old recordings for user ${user.id}`);

    return NextResponse.json({
      message: `Successfully deleted ${count || oldRecordings.length} recordings older than ${daysToKeep} days`,
      deletedCount: count || oldRecordings.length,
      recordings: oldRecordings.map(r => ({ id: r.id, title: r.title, created_at: r.created_at })),
    }, { status: 200 });
  } catch (error) {
    console.error('Auto-delete recordings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


