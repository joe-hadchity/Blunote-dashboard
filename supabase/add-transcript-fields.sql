-- =====================================================
-- Add Transcript Fields to Recordings Table
-- =====================================================

-- Add transcript fields if they don't exist
DO $$ 
BEGIN
  -- Add transcript_text column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recordings' AND column_name = 'transcript_text'
  ) THEN
    ALTER TABLE recordings ADD COLUMN transcript_text TEXT;
    RAISE NOTICE 'Added transcript_text column';
  END IF;

  -- Add transcript_words column (JSON array of word-level data)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recordings' AND column_name = 'transcript_words'
  ) THEN
    ALTER TABLE recordings ADD COLUMN transcript_words JSONB;
    RAISE NOTICE 'Added transcript_words column';
  END IF;

  -- Add error_message column (for transcription errors)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recordings' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE recordings ADD COLUMN error_message TEXT;
    RAISE NOTICE 'Added error_message column';
  END IF;

  -- Add transcript_segments column (speaker-organized segments)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recordings' AND column_name = 'transcript_segments'
  ) THEN
    ALTER TABLE recordings ADD COLUMN transcript_segments JSONB;
    RAISE NOTICE 'Added transcript_segments column';
  END IF;

  -- Add speaker_count column (number of speakers detected)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recordings' AND column_name = 'speaker_count'
  ) THEN
    ALTER TABLE recordings ADD COLUMN speaker_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added speaker_count column';
  END IF;
END $$;

-- Create index for faster transcript searches
CREATE INDEX IF NOT EXISTS idx_recordings_transcript_text 
ON recordings USING GIN (to_tsvector('english', transcript_text));

-- Update view to include new fields
CREATE OR REPLACE VIEW meetings_with_recordings AS
SELECT 
  -- Use recording's user_id as primary (always present)
  r.id as recording_id,
  r.user_id,
  
  -- Prefer recording title/description over meeting (for standalone recordings)
  COALESCE(r.title, m.title, 'Untitled Recording') as title,
  COALESCE(r.description, m.description) as description,
  
  -- Meeting fields (NULL for standalone recordings)
  m.id as id,  -- Meeting ID (can be NULL)
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
  
  -- Recording fields (always present)
  r.recording_url,
  r.audio_url,
  r.transcript_url,
  r.file_type as type,  -- Use recording type as primary
  r.file_size,
  r.duration as recording_duration_seconds,
  r.format as recording_format,
  r.status as recording_status,
  r.has_video,
  r.has_audio,
  r.has_transcript,
  r.transcription_status,
  r.storage_path,
  
  -- Transcript fields (NEW)
  r.transcript_text,
  r.transcript_words,
  r.transcript_segments,
  r.speaker_count,
  r.error_message,
  
  -- Timestamps
  r.created_at,
  r.updated_at
FROM recordings r
LEFT JOIN meetings m ON r.meeting_id = m.id;

-- Verification
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'recordings' 
  AND column_name IN ('transcript_text', 'transcript_words', 'error_message')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Transcript fields added successfully!';
  RAISE NOTICE 'Fields: transcript_text, transcript_words, error_message';
END $$;

