-- =====================================================
-- CREATE VIEW AND INSERT SAMPLE DATA
-- =====================================================

-- Create a view that joins recordings with meetings (supports standalone recordings)
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
  
  -- Timestamps
  r.created_at,
  r.updated_at
FROM recordings r
LEFT JOIN meetings m ON r.meeting_id = m.id;

-- Add comment
COMMENT ON VIEW meetings_with_recordings IS 'Combined view of recordings (with or without meetings). Supports standalone recordings where meeting_id is NULL.';

-- =====================================================
-- INSERT SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Get the current user ID
DO $$ 
DECLARE
  v_user_id UUID;
  v_meeting_id_1 UUID;
  v_meeting_id_2 UUID;
  v_meeting_id_3 UUID;
BEGIN
  -- Get first user (or replace with your specific user ID)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user first.';
  END IF;
  
  RAISE NOTICE 'Creating sample data for user: %', v_user_id;
  
  -- =====================================================
  -- Sample Meeting 1: Video Recording
  -- =====================================================
  
  INSERT INTO meetings (
    user_id,
    title,
    description,
    start_time,
    end_time,
    duration,
    type,
    platform,
    status,
    participants,
    topics
  ) VALUES (
    v_user_id,
    'Q4 Planning Session',
    'Quarterly planning and goal setting for the product team',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '90 minutes',
    90,
    'VIDEO',
    'ZOOM',
    'COMPLETED',
    ARRAY['john@company.com', 'sarah@company.com', 'mike@company.com'],
    ARRAY['planning', 'Q4-goals', 'product-roadmap']
  ) RETURNING id INTO v_meeting_id_1;
  
  -- Sample Recording 1 (Video)
  -- NOTE: Replace this URL with your actual Supabase Storage URL after uploading
  INSERT INTO recordings (
    meeting_id,
    user_id,
    recording_url,
    file_type,
    format,
    file_size,
    duration,
    has_video,
    has_audio,
    status
  ) VALUES (
    v_meeting_id_1,
    v_user_id,
    'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/meeting-videos/' || v_user_id || '/sample-video.mp4',
    'VIDEO',
    'mp4',
    52428800, -- 50MB
    5400,     -- 90 minutes in seconds
    true,
    true,
    'READY'
  );
  
  -- =====================================================
  -- Sample Meeting 2: Audio Recording
  -- =====================================================
  
  INSERT INTO meetings (
    user_id,
    title,
    description,
    start_time,
    end_time,
    duration,
    type,
    platform,
    status,
    participants,
    topics
  ) VALUES (
    v_user_id,
    'Daily Standup - Team Alpha',
    'Quick sync on project progress and blockers',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '15 minutes',
    15,
    'AUDIO',
    'GOOGLE_MEET',
    'COMPLETED',
    ARRAY['alex@company.com', 'emma@company.com'],
    ARRAY['standup', 'team-alpha', 'daily-sync']
  ) RETURNING id INTO v_meeting_id_2;
  
  -- Sample Recording 2 (Audio)
  INSERT INTO recordings (
    meeting_id,
    user_id,
    audio_url,
    file_type,
    format,
    file_size,
    duration,
    has_video,
    has_audio,
    status
  ) VALUES (
    v_meeting_id_2,
    v_user_id,
    'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/meeting-audios/' || v_user_id || '/sample-audio.mp3',
    'AUDIO',
    'mp3',
    10485760, -- 10MB
    900,      -- 15 minutes in seconds
    false,
    true,
    'READY'
  );
  
  -- =====================================================
  -- Sample Meeting 3: Scheduled (No Recording Yet)
  -- =====================================================
  
  INSERT INTO meetings (
    user_id,
    title,
    description,
    start_time,
    end_time,
    duration,
    type,
    platform,
    status,
    participants,
    topics,
    synced_from_google
  ) VALUES (
    v_user_id,
    'Client Presentation',
    'Product demo for new client',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '60 minutes',
    60,
    'VIDEO',
    'MICROSOFT_TEAMS',
    'SCHEDULED',
    ARRAY['client@customer.com', 'sales@company.com'],
    ARRAY['demo', 'client-meeting'],
    false
  ) RETURNING id INTO v_meeting_id_3;
  
  -- No recording for this one (it's in the future)
  
  RAISE NOTICE '✅ Sample data created:';
  RAISE NOTICE '   - Meeting 1 (Video): %', v_meeting_id_1;
  RAISE NOTICE '   - Meeting 2 (Audio): %', v_meeting_id_2;
  RAISE NOTICE '   - Meeting 3 (Scheduled, no recording): %', v_meeting_id_3;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTE: Update the recording URLs with your actual Supabase Storage URLs!';
  RAISE NOTICE '   Go to: Supabase Dashboard → Storage → Upload files → Copy URLs';
  
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- View all meetings
SELECT 
  id, 
  title, 
  type, 
  platform, 
  status,
  duration,
  start_time
FROM meetings 
ORDER BY start_time DESC;

-- View all recordings
SELECT 
  r.id,
  m.title as meeting_title,
  r.file_type,
  r.format,
  r.status,
  r.has_video,
  r.has_audio,
  r.recording_url IS NOT NULL as has_recording_url,
  r.audio_url IS NOT NULL as has_audio_url
FROM recordings r
JOIN meetings m ON r.meeting_id = m.id
ORDER BY r.created_at DESC;

-- View meetings with recordings (the view)
SELECT 
  title,
  type,
  platform,
  status,
  recording_id IS NOT NULL as has_recording,
  has_video,
  recording_status
FROM meetings_with_recordings
ORDER BY start_time DESC;

