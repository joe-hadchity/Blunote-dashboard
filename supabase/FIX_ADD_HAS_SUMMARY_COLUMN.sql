-- =====================================================
-- FIX: Add has_summary column to meetings table
-- =====================================================

-- Step 1: Add the column
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS has_summary BOOLEAN DEFAULT FALSE;

-- Step 2: Update existing meetings that have ai_summary
UPDATE meetings 
SET has_summary = TRUE 
WHERE ai_summary IS NOT NULL AND ai_summary != '';

-- Step 3: Recreate the view with has_summary
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
  m.sentiment,
  m.ai_summary,
  m.key_points,
  m.action_items,
  m.has_summary,  -- ✅ NOW IT EXISTS!
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

-- Add comment
COMMENT ON VIEW meetings_with_recordings IS 'Combined view of recordings with meetings, including AI insights';

-- Verify the fix
SELECT 
  COUNT(*) as total_recordings,
  COUNT(ai_summary) as with_ai_summary,
  COUNT(CASE WHEN has_summary = true THEN 1 END) as with_has_summary_flag
FROM meetings_with_recordings;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Column has_summary added to meetings table!';
  RAISE NOTICE '✅ View recreated with has_summary field!';
  RAISE NOTICE 'Verify: SELECT recording_id, title, has_summary, ai_summary IS NOT NULL as has_ai FROM meetings_with_recordings LIMIT 5;';
END $$;




