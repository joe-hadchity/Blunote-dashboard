import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { chatAboutMeeting, isAzureOpenAIConfigured } from '@/lib/azure-openai';

// POST - Chat with AI about the recording
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check Azure OpenAI configuration
    if (!isAzureOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'Azure OpenAI not configured' },
        { status: 503 }
      );
    }

    // Get user from token
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question, conversationHistory = [] } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('AI chat question for recording:', id, '- Question:', question.slice(0, 50));

    // Get transcript
    const { data: transcript, error: transcriptError } = await supabaseAdmin
      .from('transcripts')
      .select('text')
      .eq('recording_id', id)
      .eq('user_id', user.id)
      .single();

    if (transcriptError || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found. Please transcribe the recording first.' },
        { status: 404 }
      );
    }

    // Validate transcript is not empty
    if (!transcript.text || transcript.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is empty. Cannot chat about a recording with no transcribed content.' },
        { status: 400 }
      );
    }

    // Get AI response
    const answer = await chatAboutMeeting(
      transcript.text,
      question,
      conversationHistory
    );

    console.log('✅ AI response generated');

    return NextResponse.json({
      success: true,
      answer,
      question
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', message: error.message },
      { status: 500 }
    );
  }
}




