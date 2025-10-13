-- =====================================================
-- CREATE RECORDINGS TABLE (Fresh and Clean)
-- Stores video/audio files linked to meetings
-- =====================================================

CREATE TABLE recordings (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NULL REFERENCES meetings(id) ON DELETE SET NULL,  -- NULL = standalone recording
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recording info (for standalone recordings)
  title VARCHAR(255),      -- Title (optional, for standalone recordings)
  description TEXT,        -- Description (optional)
  
  -- File URLs (from Supabase Storage)
  recording_url TEXT,      -- Main recording file (video or audio)
  audio_url TEXT,          -- Separate audio file (optional)
  transcript_url TEXT,     -- Transcript file (optional)
  
  -- File metadata
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('VIDEO', 'AUDIO')),
  file_size BIGINT,        -- File size in bytes
  duration INTEGER,        -- Duration in seconds
  format VARCHAR(20),      -- File format (mp4, wav, webm, etc.)
  
  -- Processing status
  status VARCHAR(20) DEFAULT 'READY' CHECK (status IN ('UPLOADING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
  processing_progress INTEGER DEFAULT 100, -- 0-100 percentage
  error_message TEXT,      -- Error message if status is FAILED
  
  -- Features
  has_video BOOLEAN DEFAULT false,
  has_audio BOOLEAN DEFAULT true,
  has_transcript BOOLEAN DEFAULT false,
  
  -- AI Processing
  transcription_status VARCHAR(20) DEFAULT 'PENDING' CHECK (transcription_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  
  -- Storage paths (for internal management)
  storage_bucket VARCHAR(50),
  storage_path TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT recording_has_file CHECK (recording_url IS NOT NULL OR audio_url IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX idx_recordings_meeting_id ON recordings(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX idx_recordings_standalone ON recordings(user_id) WHERE meeting_id IS NULL;
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_file_type ON recordings(file_type);
CREATE INDEX idx_recordings_has_video ON recordings(has_video);
CREATE INDEX idx_recordings_has_transcript ON recordings(has_transcript);
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

-- Add comments
COMMENT ON TABLE recordings IS 'Stores recorded video/audio files. Can be linked to meetings or standalone.';
COMMENT ON COLUMN recordings.meeting_id IS 'Foreign key to meetings table. NULL = standalone recording.';
COMMENT ON COLUMN recordings.title IS 'Title for standalone recordings (uses meeting title if linked)';
COMMENT ON COLUMN recordings.status IS 'Upload and processing status';
COMMENT ON COLUMN recordings.transcription_status IS 'AI transcription processing status';
COMMENT ON COLUMN recordings.file_size IS 'File size in bytes';
COMMENT ON COLUMN recordings.duration IS 'Recording duration in seconds';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Recordings table created successfully';
END $$;

