-- =====================================================
-- INSERT RECORDING - Quick Template
-- Link a recorded file to a meeting
-- =====================================================

-- Step 1: Get your user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Step 2: Create or find the meeting
-- Option A: Insert a new meeting first
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
  'YOUR-USER-ID',  -- ← Replace
  'Team Standup Meeting',
  'Weekly team sync',
  NOW() - INTERVAL '1 hour',
  NOW(),
  60,
  'VIDEO',  -- or 'AUDIO'
  'ZOOM',
  'COMPLETED',
  ARRAY['john@team.com'],
  ARRAY['standup'],
  false,
  false
) RETURNING id;
-- Copy the returned ID

-- Step 3: Upload file to Supabase Storage and copy URL

-- Step 4: Insert the recording
INSERT INTO recordings (
  meeting_id,
  user_id,
  recording_url,
  audio_url,
  transcript_url,
  file_type,
  file_size,
  format,
  has_video,
  has_audio,
  has_transcript,
  status
) VALUES (
  'MEETING-ID-FROM-STEP-2',  -- ← Replace with meeting ID
  'YOUR-USER-ID',             -- ← Replace with your user ID
  'https://xxx.supabase.co/storage/v1/object/public/meeting-videos/YOUR-USER-ID/video.mp4',  -- ← Replace
  NULL,  -- Separate audio URL (optional)
  NULL,  -- Transcript URL (optional)
  'VIDEO',  -- 'VIDEO' or 'AUDIO'
  52428800,  -- File size in bytes (50MB example)
  'mp4',     -- File format
  true,      -- has_video
  true,      -- has_audio
  false,     -- has_transcript
  'READY'    -- status
) RETURNING id, meeting_id, recording_url;

-- =====================================================
-- QUICK EXAMPLE - VIDEO RECORDING
-- =====================================================

-- 1. Create meeting
INSERT INTO meetings (
  user_id, title, start_time, end_time, duration, type, platform, status
) VALUES (
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Test Video Meeting',
  NOW() - INTERVAL '1 hour',
  NOW(),
  60,
  'VIDEO',
  'ZOOM',
  'COMPLETED'
) RETURNING id;
-- Let's say it returns: f47ac10b-58cc-4372-a567-0e02b2c3d479

-- 2. Insert recording
INSERT INTO recordings (
  meeting_id,
  user_id,
  recording_url,
  file_type,
  format,
  has_video,
  status
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',  -- Meeting ID from above
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-videos/e8403df0-339a-4879-95bb-169bca9564d8/video.mp4',
  'VIDEO',
  'mp4',
  true,
  'READY'
);

-- =====================================================
-- QUICK EXAMPLE - AUDIO RECORDING
-- =====================================================

-- 1. Create meeting
INSERT INTO meetings (
  user_id, title, start_time, end_time, duration, type, platform, status
) VALUES (
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Test Audio Meeting',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  60,
  'AUDIO',
  'ZOOM',
  'COMPLETED'
) RETURNING id;

-- 2. Insert recording
INSERT INTO recordings (
  meeting_id,
  user_id,
  audio_url,
  file_type,
  format,
  has_audio,
  status
) VALUES (
  'MEETING-ID-FROM-ABOVE',
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audio.wav',
  'AUDIO',
  'wav',
  true,
  'READY'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- View meetings with recordings
SELECT 
  m.id,
  m.title,
  m.type,
  r.recording_url,
  r.audio_url,
  r.has_video,
  r.status
FROM meetings m
LEFT JOIN recordings r ON m.id = r.meeting_id
WHERE m.user_id = 'YOUR-USER-ID'
ORDER BY m.created_at DESC
LIMIT 10;

-- Or use the view
SELECT * FROM meetings_with_recordings
WHERE user_id = 'YOUR-USER-ID'
ORDER BY start_time DESC
LIMIT 10;

-- Count recordings by status
SELECT status, COUNT(*) 
FROM recordings 
WHERE user_id = 'YOUR-USER-ID'
GROUP BY status;




