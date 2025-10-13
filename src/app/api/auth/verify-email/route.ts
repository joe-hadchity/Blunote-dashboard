import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'Missing verification parameters' },
        { status: 400 }
      )
    }

    // Create a Supabase client with the provided tokens to verify they're valid
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxdegqsladfaczeixnmh.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })

    // Set the session with the provided tokens
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (error || !user) {
      console.error('Email verification error:', error)
      return NextResponse.json(
        { error: error?.message || 'Invalid verification tokens' },
        { status: 400 }
      )
    }

    // Tokens are valid - set session cookies
    const response = NextResponse.json(
      {
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        },
      },
      { status: 200 }
    )

    response.cookies.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    response.cookies.set('sb-refresh-token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

