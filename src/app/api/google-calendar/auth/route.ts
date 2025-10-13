import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

/**
 * GET /api/google-calendar/auth
 * Initiates Google OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    // Generate Google OAuth URL
    const authUrl = getGoogleAuthUrl();
    
    // Return the URL (frontend will redirect to it)
    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}





