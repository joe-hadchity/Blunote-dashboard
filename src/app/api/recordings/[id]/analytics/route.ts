import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAnalytics, isAzureOpenAIConfigured } from '@/lib/azure-openai';

// POST - Generate AI analytics for recording
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

    console.log('Generating analytics for recording:', id);

    // Get transcript from transcripts table
    const { data: transcript, error: transcriptError } = await supabaseAdmin
      .from('transcripts')
      .select('text, plain_text')
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
        { error: 'Transcript is empty. Please ensure the recording has been transcribed with valid content.' },
        { status: 400 }
      );
    }

    // Generate analytics using Azure OpenAI
    console.log('Generating analytics with Azure OpenAI...');
    const analytics = await generateAnalytics(transcript.text);
    console.log('Analytics generated:', {
      summaryLength: analytics.summary.length,
      keyPointsCount: analytics.keyPoints.length,
      actionItemsCount: analytics.actionItems.length,
      sentiment: analytics.sentiment
    });

    // Save analytics directly to recordings table
    const { error: updateError } = await supabaseAdmin
      .from('recordings')
      .update({
        ai_summary: analytics.summary,
        key_points: analytics.keyPoints,
        action_items: analytics.actionItems,
        sentiment: analytics.sentiment,
        has_summary: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error saving analytics to recording:', updateError);
      throw new Error('Failed to save analytics');
    }

    console.log('✅ Analytics saved to recording:', id);

    return NextResponse.json({
      success: true,
      analytics: {
        summary: analytics.summary,
        keyPoints: analytics.keyPoints,
        actionItems: analytics.actionItems,
        sentiment: analytics.sentiment
      }
    });

  } catch (error: any) {
    console.error('Analytics generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics', message: error.message },
      { status: 500 }
    );
  }
}

