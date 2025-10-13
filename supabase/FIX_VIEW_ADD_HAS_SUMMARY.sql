-- =====================================================
-- FIX: Add has_summary to meetings_with_recordings view
-- =====================================================

-- Drop and recreate the view with all necessary fields
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
  m.has_summary,  -- ✅ ADDED THIS!
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

-- Verify it worked
SELECT 
  COUNT(*) as total_recordings,
  COUNT(ai_summary) as recordings_with_summary,
  COUNT(has_summary) as has_summary_count
FROM meetings_with_recordings;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ View updated with has_summary field!';
  RAISE NOTICE 'Run this query to verify: SELECT recording_id, title, ai_summary, has_summary FROM meetings_with_recordings LIMIT 5;';
END $$;




