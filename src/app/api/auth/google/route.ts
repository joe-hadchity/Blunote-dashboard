import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the origin from the request (works in both dev and production)
    const origin = request.headers.get('origin') || request.nextUrl.origin
    
    console.log('Google OAuth - Origin:', origin)
    console.log('Google OAuth - Redirect URL:', `${origin}/callback`)
    
    // Initiate Google OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Return the OAuth URL for the client to redirect to
    return NextResponse.json(
      { url: data.url },
      { status: 200 }
    )
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

