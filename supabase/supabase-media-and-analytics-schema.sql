-- =====================================================
-- Media Files and AI Analytics Tables for Meetings
-- =====================================================
-- Run this in Supabase SQL Editor after creating meetings table

-- =====================================================
-- 1. VIDEO FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Video metadata
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- Size in bytes
  file_type VARCHAR(50), -- e.g., 'video/mp4', 'video/webm'
  duration_seconds INTEGER, -- Video duration in seconds
  
  -- Video details
  resolution VARCHAR(20), -- e.g., '1920x1080', '1280x720'
  fps INTEGER, -- Frames per second
  codec VARCHAR(50), -- e.g., 'h264', 'vp9'
  bitrate INTEGER, -- Bitrate in kbps
  
  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  thumbnail_url TEXT,
  
  -- Storage info
  storage_provider VARCHAR(50), -- 'vercel_blob', 's3', 'cloudinary', etc.
  storage_key TEXT, -- Storage-specific identifier
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for videos
CREATE INDEX idx_meeting_videos_meeting_id ON meeting_videos(meeting_id);
CREATE INDEX idx_meeting_videos_user_id ON meeting_videos(user_id);
CREATE INDEX idx_meeting_videos_status ON meeting_videos(processing_status);

-- =====================================================
-- 2. AUDIO FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Audio metadata
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- Size in bytes
  file_type VARCHAR(50), -- e.g., 'audio/mp3', 'audio/wav', 'audio/m4a'
  duration_seconds INTEGER, -- Audio duration in seconds
  
  -- Audio details
  sample_rate INTEGER, -- e.g., 44100, 48000
  channels INTEGER, -- 1 = mono, 2 = stereo
  bitrate INTEGER, -- Bitrate in kbps
  codec VARCHAR(50), -- e.g., 'mp3', 'aac', 'opus'
  
  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Storage info
  storage_provider VARCHAR(50),
  storage_key TEXT,
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audios
CREATE INDEX idx_meeting_audios_meeting_id ON meeting_audios(meeting_id);
CREATE INDEX idx_meeting_audios_user_id ON meeting_audios(user_id);
CREATE INDEX idx_meeting_audios_status ON meeting_audios(processing_status);

-- =====================================================
-- 3. TRANSCRIPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transcript content
  full_transcript TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en', -- Language code (en, es, fr, etc.)
  
  -- Processing info
  transcription_service VARCHAR(50), -- 'openai_whisper', 'assemblyai', 'deepgram', 'manual'
  confidence_score DECIMAL(3, 2), -- Average confidence (0.00 to 1.00)
  processing_status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Transcript file
  file_url TEXT, -- If stored as separate file
  file_format VARCHAR(20), -- 'txt', 'srt', 'vtt', 'json'
  
  -- Timestamps
  transcribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transcripts
CREATE INDEX idx_meeting_transcripts_meeting_id ON meeting_transcripts(meeting_id);
CREATE INDEX idx_meeting_transcripts_user_id ON meeting_transcripts(user_id);
CREATE INDEX idx_meeting_transcripts_language ON meeting_transcripts(language);

-- =====================================================
-- 4. TRANSCRIPT SEGMENTS TABLE (for timestamped transcript)
-- =====================================================
CREATE TABLE IF NOT EXISTS transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES meeting_transcripts(id) ON DELETE CASCADE,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Segment details
  speaker_name VARCHAR(100), -- Speaker identification
  speaker_id VARCHAR(50), -- Speaker ID (if diarization is used)
  text TEXT NOT NULL,
  
  -- Timing
  start_time DECIMAL(10, 3) NOT NULL, -- Start time in seconds (with milliseconds)
  end_time DECIMAL(10, 3) NOT NULL, -- End time in seconds (with milliseconds)
  
  -- Confidence and metadata
  confidence DECIMAL(3, 2), -- Confidence score (0.00 to 1.00)
  words_count INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transcript segments
CREATE INDEX idx_transcript_segments_transcript_id ON transcript_segments(transcript_id);
CREATE INDEX idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
CREATE INDEX idx_transcript_segments_start_time ON transcript_segments(start_time);
CREATE INDEX idx_transcript_segments_speaker ON transcript_segments(speaker_name);

-- =====================================================
-- 5. AI ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI Summary
  summary TEXT,
  summary_short TEXT, -- Short version (1-2 sentences)
  
  -- Analysis
  sentiment VARCHAR(50), -- 'positive', 'neutral', 'negative', 'mixed'
  sentiment_score DECIMAL(3, 2), -- Sentiment score (-1.00 to 1.00)
  engagement_level VARCHAR(50), -- 'high', 'medium', 'low'
  
  -- Key Points (stored as JSONB for rich data)
  key_points JSONB, -- [{text: "...", importance: 0.95, timestamp: 120}]
  
  -- Action Items (stored as JSONB)
  action_items JSONB, -- [{task: "...", assignee: "...", priority: "high", due_date: "..."}]
  
  -- Topics and Categories
  topics TEXT[], -- Array of identified topics
  categories TEXT[], -- Array of categories
  keywords TEXT[], -- Important keywords extracted
  
  -- Speakers Analysis
  speakers JSONB, -- [{name: "John", speaking_time: 180, words: 450}]
  dominant_speaker VARCHAR(100),
  
  -- Meeting Quality Metrics
  clarity_score DECIMAL(3, 2), -- How clear the discussion was (0.00 to 1.00)
  productivity_score DECIMAL(3, 2), -- How productive (0.00 to 1.00)
  
  -- Questions and Decisions
  questions_asked JSONB, -- [{question: "...", asker: "...", answered: true}]
  decisions_made JSONB, -- [{decision: "...", impact: "high"}]
  
  -- Follow-ups
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_steps TEXT[],
  
  -- AI Service Info
  ai_model VARCHAR(100), -- 'gpt-4', 'claude-3', etc.
  ai_provider VARCHAR(50), -- 'openai', 'anthropic', etc.
  processing_cost DECIMAL(10, 4), -- Cost in USD
  
  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI analytics
CREATE INDEX idx_ai_analytics_meeting_id ON meeting_ai_analytics(meeting_id);
CREATE INDEX idx_ai_analytics_user_id ON meeting_ai_analytics(user_id);
CREATE INDEX idx_ai_analytics_sentiment ON meeting_ai_analytics(sentiment);
CREATE INDEX idx_ai_analytics_status ON meeting_ai_analytics(processing_status);

-- =====================================================
-- 6. AI CHAT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Chat message
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  message TEXT NOT NULL,
  
  -- Context and metadata
  context JSONB, -- Conversation context, referenced data
  ai_model VARCHAR(100),
  tokens_used INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat history
CREATE INDEX idx_ai_chats_meeting_id ON meeting_ai_chats(meeting_id);
CREATE INDEX idx_ai_chats_user_id ON meeting_ai_chats(user_id);
CREATE INDEX idx_ai_chats_created_at ON meeting_ai_chats(created_at DESC);

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

-- Trigger for meeting_videos
CREATE TRIGGER update_meeting_videos_updated_at
  BEFORE UPDATE ON meeting_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meeting_audios
CREATE TRIGGER update_meeting_audios_updated_at
  BEFORE UPDATE ON meeting_audios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meeting_transcripts
CREATE TRIGGER update_meeting_transcripts_updated_at
  BEFORE UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meeting_ai_analytics
CREATE TRIGGER update_meeting_ai_analytics_updated_at
  BEFORE UPDATE ON meeting_ai_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE meeting_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_ai_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meeting_videos
CREATE POLICY "Users can view their own meeting videos"
  ON meeting_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meeting videos"
  ON meeting_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting videos"
  ON meeting_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting videos"
  ON meeting_videos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meeting_audios
CREATE POLICY "Users can view their own meeting audios"
  ON meeting_audios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meeting audios"
  ON meeting_audios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting audios"
  ON meeting_audios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting audios"
  ON meeting_audios FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meeting_transcripts
CREATE POLICY "Users can view their own meeting transcripts"
  ON meeting_transcripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meeting transcripts"
  ON meeting_transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting transcripts"
  ON meeting_transcripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting transcripts"
  ON meeting_transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transcript_segments
CREATE POLICY "Users can view their own transcript segments"
  ON transcript_segments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meeting_transcripts
    WHERE meeting_transcripts.id = transcript_segments.transcript_id
    AND meeting_transcripts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own transcript segments"
  ON transcript_segments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM meeting_transcripts
    WHERE meeting_transcripts.id = transcript_id
    AND meeting_transcripts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own transcript segments"
  ON transcript_segments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM meeting_transcripts
    WHERE meeting_transcripts.id = transcript_segments.transcript_id
    AND meeting_transcripts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own transcript segments"
  ON transcript_segments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM meeting_transcripts
    WHERE meeting_transcripts.id = transcript_segments.transcript_id
    AND meeting_transcripts.user_id = auth.uid()
  ));

-- RLS Policies for meeting_ai_analytics
CREATE POLICY "Users can view their own ai analytics"
  ON meeting_ai_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai analytics"
  ON meeting_ai_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai analytics"
  ON meeting_ai_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai analytics"
  ON meeting_ai_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meeting_ai_chats
CREATE POLICY "Users can view their own ai chats"
  ON meeting_ai_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai chats"
  ON meeting_ai_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai chats"
  ON meeting_ai_chats FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON meeting_videos TO authenticated;
GRANT ALL ON meeting_videos TO service_role;
GRANT ALL ON meeting_audios TO authenticated;
GRANT ALL ON meeting_audios TO service_role;
GRANT ALL ON meeting_transcripts TO authenticated;
GRANT ALL ON meeting_transcripts TO service_role;
GRANT ALL ON transcript_segments TO authenticated;
GRANT ALL ON transcript_segments TO service_role;
GRANT ALL ON meeting_ai_analytics TO authenticated;
GRANT ALL ON meeting_ai_analytics TO service_role;
GRANT ALL ON meeting_ai_chats TO authenticated;
GRANT ALL ON meeting_ai_chats TO service_role;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get full meeting data with media and analytics
CREATE OR REPLACE FUNCTION get_meeting_full_details(meeting_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'meeting', (SELECT row_to_json(m) FROM meetings m WHERE m.id = meeting_uuid AND m.user_id = user_uuid),
    'videos', (SELECT json_agg(v) FROM meeting_videos v WHERE v.meeting_id = meeting_uuid AND v.user_id = user_uuid),
    'audios', (SELECT json_agg(a) FROM meeting_audios a WHERE a.meeting_id = meeting_uuid AND a.user_id = user_uuid),
    'transcript', (SELECT row_to_json(t) FROM meeting_transcripts t WHERE t.meeting_id = meeting_uuid AND t.user_id = user_uuid LIMIT 1),
    'transcript_segments', (
      SELECT json_agg(s ORDER BY s.start_time) 
      FROM transcript_segments s 
      INNER JOIN meeting_transcripts t ON s.transcript_id = t.id
      WHERE s.meeting_id = meeting_uuid AND t.user_id = user_uuid
    ),
    'ai_analytics', (SELECT row_to_json(ai) FROM meeting_ai_analytics ai WHERE ai.meeting_id = meeting_uuid AND ai.user_id = user_uuid LIMIT 1),
    'chat_history', (
      SELECT json_agg(c ORDER BY c.created_at) 
      FROM meeting_ai_chats c 
      WHERE c.meeting_id = meeting_uuid AND c.user_id = user_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update meeting flags when media/analytics are added
CREATE OR REPLACE FUNCTION update_meeting_content_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Update meetings table flags based on related data
  IF TG_TABLE_NAME = 'meeting_videos' THEN
    UPDATE meetings 
    SET has_video = EXISTS (
      SELECT 1 FROM meeting_videos 
      WHERE meeting_id = NEW.meeting_id 
      AND processing_status = 'completed'
    ),
    recording_url = COALESCE(
      (SELECT file_url FROM meeting_videos 
       WHERE meeting_id = NEW.meeting_id 
       AND processing_status = 'completed' 
       ORDER BY created_at DESC LIMIT 1),
      recording_url
    )
    WHERE id = NEW.meeting_id;
    
  ELSIF TG_TABLE_NAME = 'meeting_audios' THEN
    UPDATE meetings 
    SET audio_url = COALESCE(
      (SELECT file_url FROM meeting_audios 
       WHERE meeting_id = NEW.meeting_id 
       AND processing_status = 'completed' 
       ORDER BY created_at DESC LIMIT 1),
      audio_url
    )
    WHERE id = NEW.meeting_id;
    
  ELSIF TG_TABLE_NAME = 'meeting_transcripts' THEN
    UPDATE meetings 
    SET has_transcript = TRUE,
    transcript_url = COALESCE(NEW.file_url, transcript_url)
    WHERE id = NEW.meeting_id;
    
  ELSIF TG_TABLE_NAME = 'meeting_ai_analytics' THEN
    UPDATE meetings 
    SET has_summary = TRUE,
    ai_summary = COALESCE(NEW.summary, ai_summary),
    key_points = COALESCE(
      (SELECT array_agg(value->>'text') FROM jsonb_array_elements(NEW.key_points)),
      key_points
    ),
    action_items = COALESCE(
      (SELECT array_agg(value->>'task') FROM jsonb_array_elements(NEW.action_items)),
      action_items
    ),
    sentiment = COALESCE(NEW.sentiment, sentiment),
    topics = COALESCE(NEW.topics, topics)
    WHERE id = NEW.meeting_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update meeting flags
CREATE TRIGGER update_meeting_on_video_insert
  AFTER INSERT OR UPDATE ON meeting_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_content_flags();

CREATE TRIGGER update_meeting_on_audio_insert
  AFTER INSERT OR UPDATE ON meeting_audios
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_content_flags();

CREATE TRIGGER update_meeting_on_transcript_insert
  AFTER INSERT OR UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_content_flags();

CREATE TRIGGER update_meeting_on_analytics_insert
  AFTER INSERT OR UPDATE ON meeting_ai_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_content_flags();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Media and analytics tables created successfully!';
  RAISE NOTICE '✅ Created tables:';
  RAISE NOTICE '   - meeting_videos (video files storage)';
  RAISE NOTICE '   - meeting_audios (audio files storage)';
  RAISE NOTICE '   - meeting_transcripts (full transcripts)';
  RAISE NOTICE '   - transcript_segments (timestamped segments)';
  RAISE NOTICE '   - meeting_ai_analytics (AI analysis data)';
  RAISE NOTICE '   - meeting_ai_chats (chat history)';
  RAISE NOTICE '✅ RLS policies enabled for all tables';
  RAISE NOTICE '✅ Auto-update triggers configured';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '🚀 Ready for media upload and AI processing!';
END $$;

