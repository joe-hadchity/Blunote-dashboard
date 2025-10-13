-- =====================================================
-- QUICK FIX: Add Transcript Fields to View
-- =====================================================
-- Run this in Supabase SQL Editor to fix the 404 error
-- =====================================================

-- Step 1: Add columns to recordings table (if not exists)
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_words JSONB;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_segments JSONB;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS speaker_count INTEGER DEFAULT 0;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Step 2: Recreate the view to include transcript fields
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
  
  -- Transcript fields (NEW - this is what was missing!)
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
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recordings' 
  AND column_name LIKE 'transcript%'
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Transcript fields added to view!';
  RAISE NOTICE 'You can now click on recordings without 404 errors.';
END $$;




