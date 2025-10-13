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
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log('Starting account deletion for user:', userId);

    // Step 1: Delete all files from Supabase Storage
    try {
      // Get all recordings to find file paths
      const { data: recordings, error: recordingsError } = await supabaseAdmin
        .from('recordings')
        .select('file_path')
        .eq('user_id', userId);

      if (!recordingsError && recordings && recordings.length > 0) {
        // Extract file paths and remove the bucket prefix
        const filePaths = recordings
          .map(r => r.file_path)
          .filter(Boolean)
          .map(path => {
            // Remove "recordings/" prefix if present
            if (path.startsWith('recordings/')) {
              return path.substring('recordings/'.length);
            }
            return path;
          });

        if (filePaths.length > 0) {
          // Delete all files from storage
          const { error: storageError } = await supabaseAdmin
            .storage
            .from('recordings')
            .remove(filePaths);

          if (storageError) {
            console.error('Error deleting files from storage:', storageError);
            // Continue even if storage deletion fails
          } else {
            console.log(`Deleted ${filePaths.length} files from storage`);
          }
        }
      }
    } catch (storageError) {
      console.error('Storage cleanup error:', storageError);
      // Continue with account deletion even if storage cleanup fails
    }

    // Step 2: Delete transcripts (must be before recordings due to foreign key)
    const { error: transcriptsError } = await supabaseAdmin
      .from('transcripts')
      .delete()
      .eq('user_id', userId);

    if (transcriptsError) {
      console.error('Error deleting transcripts:', transcriptsError);
      // Continue anyway
    } else {
      console.log('Deleted transcripts for user:', userId);
    }

    // Step 3: Delete recordings
    const { error: recordingsDeleteError } = await supabaseAdmin
      .from('recordings')
      .delete()
      .eq('user_id', userId);

    if (recordingsDeleteError) {
      console.error('Error deleting recordings:', recordingsDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete recordings' },
        { status: 500 }
      );
    }
    console.log('Deleted recordings for user:', userId);

    // Step 4: Delete meetings
    const { error: meetingsError } = await supabaseAdmin
      .from('meetings')
      .delete()
      .eq('user_id', userId);

    if (meetingsError) {
      console.error('Error deleting meetings:', meetingsError);
      // Continue anyway
    } else {
      console.log('Deleted meetings for user:', userId);
    }

    // Step 5: Delete Google Calendar tokens (if they exist)
    try {
      const { error: tokensError } = await supabaseAdmin
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', userId);

      if (tokensError) {
        console.error('Error deleting Google Calendar tokens:', tokensError);
        // Continue anyway
      } else {
        console.log('Deleted Google Calendar tokens for user:', userId);
      }
    } catch (tokenError) {
      console.error('Google Calendar token cleanup error:', tokenError);
      // Continue anyway
    }

    // Step 6: Delete the user account from Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      );
    }

    console.log('Successfully deleted user account:', userId);

    // Clear all cookies
    const response = NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    );

    // Clear auth cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('sb-remember-me', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


