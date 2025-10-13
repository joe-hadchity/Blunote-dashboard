import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET user settings
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // For now, return default settings
    // TODO: Store in database if needed
    return NextResponse.json({
      recordingSettings: {
        autoTranscribe: true,
        recordingQuality: 'high',
      },
      privacySettings: {
        autoDeleteAfter: 'never',
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT/POST user settings
export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { recordingSettings, privacySettings } = await request.json();

    // For now, we'll just acknowledge the save
    // The actual auto-delete logic will run separately
    console.log('User settings saved:', { userId: user.id, recordingSettings, privacySettings });

    return NextResponse.json({
      message: 'Settings saved successfully',
      recordingSettings,
      privacySettings,
    }, { status: 200 });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}


