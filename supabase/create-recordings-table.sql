-- =====================================================
-- CREATE RECORDINGS TABLE
-- Separate table for recorded assets linked to meetings
-- =====================================================

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File URLs
  recording_url TEXT,  -- Main recording (video or audio)
  audio_url TEXT,      -- Separate audio file
  transcript_url TEXT, -- Transcript file
  
  -- File metadata
  file_type VARCHAR(10) CHECK (file_type IN ('VIDEO', 'AUDIO')),
  file_size BIGINT,    -- File size in bytes
  duration INTEGER,    -- Duration in seconds
  format VARCHAR(20),  -- File format (mp4, wav, etc.)
  
  -- Processing status
  status VARCHAR(20) DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
  processing_progress INTEGER DEFAULT 0, -- 0-100
  
  -- Features
  has_video BOOLEAN DEFAULT false,
  has_audio BOOLEAN DEFAULT true,
  has_transcript BOOLEAN DEFAULT false,
  
  -- AI Processing
  transcription_status VARCHAR(20) DEFAULT 'PENDING' CHECK (transcription_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  
  -- Storage paths (for internal use)
  storage_bucket VARCHAR(50),
  storage_path TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_recordings_meeting_id ON recordings(meeting_id);
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recordings
CREATE POLICY "Users can view their own recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
  ON recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
  ON recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
  ON recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_recordings_updated_at();

-- =====================================================
-- MIGRATION: Move existing recording data
-- =====================================================

-- Only run migration if old columns exist
DO $$ 
BEGIN
  -- Check if old columns exist and migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meetings' AND column_name = 'recording_url'
  ) THEN
    -- Insert existing recordings from meetings table
    INSERT INTO recordings (
      meeting_id,
      user_id,
      recording_url,
      audio_url,
      transcript_url,
      file_type,
      has_video,
      has_transcript,
      status,
      created_at,
      updated_at
    )
    SELECT 
      id as meeting_id,
      user_id,
      recording_url,
      audio_url,
      transcript_url,
      type as file_type,
      has_video,
      has_transcript,
      CASE 
        WHEN recording_url IS NOT NULL OR audio_url IS NOT NULL THEN 'READY'
        ELSE 'PENDING'
      END as status,
      created_at,
      updated_at
    FROM meetings
    WHERE recording_url IS NOT NULL OR audio_url IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Migration completed: existing recordings moved to recordings table';
  ELSE
    RAISE NOTICE 'No migration needed: starting fresh with recordings table';
  END IF;
END $$;

-- =====================================================
-- VIEWS for backward compatibility
-- =====================================================

-- Create a view that joins meetings with their recordings
CREATE OR REPLACE VIEW meetings_with_recordings AS
SELECT 
  -- Meeting fields
  m.id,
  m.user_id,
  m.title,
  m.description,
  m.start_time,
  m.end_time,
  m.duration,
  m.type,
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
  m.created_at,
  m.updated_at,
  -- Recording fields (with clear aliases)
  r.id as recording_id,
  r.recording_url,
  r.audio_url,
  r.transcript_url,
  r.file_type,
  r.file_size,
  r.duration as recording_duration_seconds,
  r.format as recording_format,
  r.status as recording_status,
  r.has_video,
  r.has_audio,
  r.has_transcript,
  r.transcription_status
FROM meetings m
LEFT JOIN recordings r ON m.id = r.meeting_id;

-- =====================================================
-- OPTIONAL: Clean up old columns from meetings table
-- (Run this after verifying everything works)
-- =====================================================

/*
-- Comment out these for now - run after testing

ALTER TABLE meetings DROP COLUMN IF EXISTS recording_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS audio_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS transcript_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS has_video;
ALTER TABLE meetings DROP COLUMN IF EXISTS has_transcript;

*/

COMMENT ON TABLE recordings IS 'Stores recorded assets (video/audio) linked to meetings';
COMMENT ON COLUMN recordings.meeting_id IS 'Foreign key to meetings table';
COMMENT ON COLUMN recordings.status IS 'Upload and processing status';
COMMENT ON COLUMN recordings.transcription_status IS 'AI transcription processing status';

