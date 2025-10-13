-- =====================================================
-- INSERT YOUR ACTUAL DATA
-- User ID: e8403df0-339a-4879-95bb-169bca9564d8
-- =====================================================

-- =====================================================
-- OPTION 1: Recordings with Meetings
-- =====================================================

-- Meeting 1: Video Recording
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
  is_favorite,
  is_archived
) VALUES (
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Team Sync - Product Demo',
  'Discussion about the new product features and Q4 roadmap',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '45 minutes',
  45,
  'VIDEO',
  'ZOOM',
  'COMPLETED',
  ARRAY['john@company.com', 'sarah@company.com'],
  ARRAY['product-demo', 'Q4-roadmap'],
  false,
  false
) RETURNING id;
-- Copy the returned ID and use it below

-- Recording 1: Video (replace MEETING-ID-HERE with the ID from above)
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
  has_transcript,
  status
) VALUES (
  'MEETING-ID-HERE',  -- ← Replace with meeting ID from above
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-videos/e8403df0-339a-4879-95bb-169bca9564d8/meeting_video_2025-10-07T12-41-12-218Z.webm',
  'VIDEO',
  'webm',
  25000000,  -- Estimate: 25MB
  2700,      -- 45 minutes in seconds
  true,
  true,
  false,
  'READY'
) RETURNING id, recording_url;

-- =====================================================
-- Meeting 2: Audio Recording
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
  is_favorite,
  is_archived
) VALUES (
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Daily Standup - Engineering Team',
  'Quick sync on progress and blockers',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours' + INTERVAL '15 minutes',
  15,
  'AUDIO',
  'GOOGLE_MEET',
  'COMPLETED',
  ARRAY['alex@company.com', 'emma@company.com'],
  ARRAY['standup', 'engineering'],
  false,
  false
) RETURNING id;
-- Copy the returned ID

-- Recording 2: Audio (replace MEETING-ID-HERE with the ID from above)
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
  has_transcript,
  status
) VALUES (
  'MEETING-ID-HERE',  -- ← Replace with meeting ID from above
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audnoise.wav',
  'AUDIO',
  'wav',
  15000000,  -- Estimate: 15MB
  900,       -- 15 minutes in seconds
  false,
  true,
  false,
  'READY'
) RETURNING id, audio_url;

-- =====================================================
-- OPTION 2: Standalone Recordings (No Meeting Required)
-- =====================================================

-- Standalone Recording 1: Video (no meeting)
INSERT INTO recordings (
  meeting_id,  -- NULL = standalone
  user_id,
  title,
  description,
  recording_url,
  file_type,
  format,
  file_size,
  duration,
  has_video,
  has_audio,
  has_transcript,
  status
) VALUES (
  NULL,  -- No meeting linked
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Test Video Recording',
  'Uploaded video for testing noise cancellation',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-videos/e8403df0-339a-4879-95bb-169bca9564d8/meeting_video_2025-10-07T12-41-12-218Z.webm',
  'VIDEO',
  'webm',
  25000000,
  2700,
  true,
  true,
  false,
  'READY'
) RETURNING id, title, recording_url;

-- Standalone Recording 2: Audio (no meeting)
INSERT INTO recordings (
  meeting_id,  -- NULL = standalone
  user_id,
  title,
  description,
  audio_url,
  file_type,
  format,
  file_size,
  duration,
  has_video,
  has_audio,
  has_transcript,
  status
) VALUES (
  NULL,  -- No meeting linked
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Audio Test - Noise Sample',
  'WAV file for testing audio noise cancellation',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audnoise.wav',
  'AUDIO',
  'wav',
  15000000,
  900,
  false,
  true,
  false,
  'READY'
) RETURNING id, title, audio_url;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- View all recordings (with or without meetings)
SELECT 
  r.id,
  r.title as recording_title,
  m.title as meeting_title,
  r.file_type,
  r.meeting_id IS NOT NULL as has_meeting,
  r.status,
  r.recording_url IS NOT NULL as has_video_url,
  r.audio_url IS NOT NULL as has_audio_url
FROM recordings r
LEFT JOIN meetings m ON r.meeting_id = m.id
WHERE r.user_id = 'e8403df0-339a-4879-95bb-169bca9564d8'
ORDER BY r.created_at DESC;

-- View using the view
SELECT 
  recording_id,
  title,
  type,
  id as meeting_id,
  recording_status,
  has_video,
  has_audio
FROM meetings_with_recordings
WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8'
ORDER BY created_at DESC;

-- Count breakdown
SELECT 
  CASE 
    WHEN meeting_id IS NOT NULL THEN 'With Meeting'
    ELSE 'Standalone'
  END as recording_type,
  COUNT(*) as count
FROM recordings
WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8'
GROUP BY recording_type;




