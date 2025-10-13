import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Helper function to check Google Calendar connection
async function checkGoogleCalendarConnection(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('google_calendar_tokens')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return !error && data !== null;
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    const rememberMe = request.cookies.get('sb-remember-me')?.value === 'true'

    if (!accessToken) {
      // Try to refresh the session if we have a refresh token
      if (refreshToken) {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        })

        if (error || !data.session) {
          return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
          )
        }

        // Check Google Calendar connection
        const googleCalendarConnected = await checkGoogleCalendarConnection(data.user.id);
        
        // Set the new tokens and return user info
        const response = NextResponse.json(
          {
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email,
              created_at: data.user.created_at,
              google_calendar_connected: googleCalendarConnected,
              app_metadata: data.user.app_metadata, // Include app_metadata for provider detection
            },
          },
          { status: 200 }
        )

        // Respect remember-me preference
        const accessTokenMaxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day
        const refreshTokenMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days

        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: accessTokenMaxAge,
          path: '/',
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: refreshTokenMaxAge,
          path: '/',
        })

        return response
      }

      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      // Token is invalid, try to refresh
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        })

        if (refreshError || !refreshData.session) {
          return NextResponse.json(
            { error: 'Invalid session' },
            { status: 401 }
          )
        }

        // Check Google Calendar connection
        const googleCalendarConnected2 = await checkGoogleCalendarConnection(refreshData.user.id);
        
        // Set the new tokens and return user info
        const response = NextResponse.json(
          {
            user: {
              id: refreshData.user.id,
              email: refreshData.user.email,
              name: refreshData.user.user_metadata?.full_name || refreshData.user.email,
              created_at: refreshData.user.created_at,
              google_calendar_connected: googleCalendarConnected2,
              app_metadata: refreshData.user.app_metadata, // Include app_metadata for provider detection
            },
          },
          { status: 200 }
        )

        // Respect remember-me preference
        const accessTokenMaxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day
        const refreshTokenMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days

        response.cookies.set('sb-access-token', refreshData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: accessTokenMaxAge,
          path: '/',
        })
        
        response.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: refreshTokenMaxAge,
          path: '/',
        })

        return response
      }

      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check Google Calendar connection
    const googleCalendarConnected3 = await checkGoogleCalendarConnection(user.id);
    
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          created_at: user.created_at,
          google_calendar_connected: googleCalendarConnected3,
          app_metadata: user.app_metadata, // Include app_metadata for provider detection
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
