-- =====================================================
-- ADD AI ANALYTICS FIELDS TO RECORDINGS TABLE
-- =====================================================

-- Add AI analytics columns to recordings table
ALTER TABLE recordings
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20),
ADD COLUMN IF NOT EXISTS has_summary BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recordings_has_summary ON recordings(has_summary) WHERE has_summary = true;

-- Update the view to pull AI fields from recordings instead of meetings
DROP VIEW IF EXISTS meetings_with_recordings CASCADE;

CREATE OR REPLACE VIEW meetings_with_recordings AS
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
  m.is_favorite,
  m.is_archived,
  m.synced_from_google,
  m.google_event_id,
  m.google_calendar_id,
  m.last_synced_at,
  m.meeting_link,
  
  -- AI Analytics from RECORDINGS table (not meetings)
  r.ai_summary,
  r.key_points,
  r.action_items,
  r.sentiment,
  r.has_summary,
  
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

-- Add comment
COMMENT ON VIEW meetings_with_recordings IS 'Combined view - AI analytics stored in recordings table';

-- Verify the columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'recordings' 
AND column_name IN ('ai_summary', 'key_points', 'action_items', 'sentiment', 'has_summary')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AI analytics fields added to recordings table!';
  RAISE NOTICE '✅ View updated to use recordings.ai_summary instead of meetings.ai_summary';
  RAISE NOTICE 'Now AI insights are stored in recordings, not meetings!';
END $$;




