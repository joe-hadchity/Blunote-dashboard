import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Resend verification email
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/callback`,
      },
    })

    if (error) {
      console.error('Resend verification error:', error)
      
      // Don't reveal if email exists or not for security
      if (error.message.includes('not found') || error.message.includes('already verified')) {
        return NextResponse.json(
          { message: 'If an account with this email exists and is unverified, a verification email has been sent.' },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully. Please check your inbox.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

