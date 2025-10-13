import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTokensFromCode, saveUserTokens } from '@/lib/google-calendar';
import { google } from 'googleapis';

/**
 * GET /api/google-calendar/callback
 * Handles Google OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/integrations?error=oauth_failed&message=${error}`, request.url)
      );
    }
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/integrations?error=missing_code', request.url)
      );
    }
    
    // Get user from session
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/signin?error=not_authenticated', request.url)
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/signin?error=invalid_session', request.url)
      );
    }
    
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/calendar?error=token_exchange_failed', request.url)
      );
    }
    
    // Try to get user's Google account info (optional)
    let googleEmail: string | undefined;
    let googleAccountId: string | undefined;
    
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();
      
      googleEmail = userInfo.email || undefined;
      googleAccountId = userInfo.id || undefined;
    } catch (error) {
      // User info not available, continue without it
      console.log('Could not fetch Google user info, continuing without it');
    }
    
    // Save tokens to database
    await saveUserTokens(
      user.id,
      tokens,
      googleEmail,
      googleAccountId
    );
    
    // Redirect back to integrations page with success message
    return NextResponse.redirect(
      new URL('/integrations?google_connected=true', request.url)
    );
  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/integrations?error=callback_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

