-- =====================================================
-- CREATE TRANSCRIPTS TABLE
-- Separate table for better performance
-- =====================================================

-- Drop and recreate view first to fix column order issue
DROP VIEW IF EXISTS meetings_with_recordings CASCADE;

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transcript content
  text TEXT NOT NULL,  -- Full transcript with speaker labels
  plain_text TEXT,     -- Plain text without speaker labels (for search)
  
  -- Speaker diarization
  segments JSONB,      -- Array of speaker segments
  words JSONB,         -- Word-level data with timestamps
  speaker_count INTEGER DEFAULT 0,
  
  -- Metadata
  language VARCHAR(10) DEFAULT 'en-US',
  confidence DECIMAL(3,2),  -- Average confidence score (0.00 - 1.00)
  duration_seconds INTEGER,  -- Audio duration
  
  -- Processing
  status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transcripts_recording_id ON transcripts(recording_id);
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_status ON transcripts(status);

-- Full-text search index
CREATE INDEX idx_transcripts_text_search ON transcripts USING GIN (to_tsvector('english', plain_text));

-- Enable RLS
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transcripts"
  ON transcripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcripts"
  ON transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcripts"
  ON transcripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcripts"
  ON transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated trigger
CREATE OR REPLACE FUNCTION update_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transcripts_updated_at
  BEFORE UPDATE ON transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_transcripts_updated_at();

-- =====================================================
-- Recreate meetings_with_recordings view (clean)
-- =====================================================

CREATE VIEW meetings_with_recordings AS
SELECT 
  -- Recording identification
  r.id as recording_id,
  r.user_id,
  
  -- Title/description (prefer recording over meeting for standalone)
  COALESCE(r.title, m.title, 'Untitled Recording') as title,
  COALESCE(r.description, m.description) as description,
  
  -- Meeting fields (NULL for standalone recordings)
  m.id as id,
  m.start_time,
  m.end_time,
  m.duration,
  m.platform,
  m.status,
  m.participants,
  m.topics,
  m.sentiment,
  m.ai_summary,
  m.key_points,
  m.action_items,
  m.is_favorite,
  m.is_archived,
  m.synced_from_google,
  m.google_event_id,
  m.google_calendar_id,
  m.last_synced_at,
  m.meeting_link,
  
  -- Recording fields
  r.recording_url,
  r.audio_url,
  r.transcript_url,
  r.file_type as type,
  r.file_size,
  r.duration as recording_duration_seconds,
  r.format as recording_format,
  r.status as recording_status,
  r.has_video,
  r.has_audio,
  r.has_transcript,
  r.transcription_status,
  r.storage_path,
  
  -- Timestamps
  r.created_at,
  r.updated_at
FROM recordings r
LEFT JOIN meetings m ON r.meeting_id = m.id;

-- Verification
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'transcripts'
ORDER BY ordinal_position;

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Transcripts table created!';
  RAISE NOTICE '✅ View recreated without transcript fields (will fetch separately)';
END $$;




