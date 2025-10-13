-- =====================================================
-- INSERT AUDIO MEETING INTO DATABASE
-- Quick template for testing audio uploads
-- =====================================================

-- Step 1: Get your user ID
SELECT id, email FROM auth.users LIMIT 1;
-- Copy the 'id' value from the result

-- Step 2: Upload audio to Supabase Storage
-- Go to: Supabase Dashboard → Storage → meeting-audios
-- Create folder: {your-user-id}
-- Upload your audio file
-- Copy the public URL

-- Step 3: Insert the meeting (replace the placeholders below)
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
  audio_url,
  recording_url,
  has_video,
  has_transcript,
  has_summary,
  participants,
  topics,
  is_favorite,
  is_archived,
  created_at,
  updated_at
) VALUES (
  'e8403df0-339a-4879-95bb-169bca9564d8',  -- ← Replace with your user ID from Step 1
  'Audio Meeting - Team Standup',
  'Audio recording of daily standup meeting',
  NOW() - INTERVAL '2 hours',  -- Meeting started 2 hours ago
  NOW() - INTERVAL '1 hour',   -- Meeting ended 1 hour ago
  60,  -- Duration in minutes
  'AUDIO',  -- ← Important: Set to AUDIO for audio-only meetings
  'ZOOM',
  'COMPLETED',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/sign/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audnoise.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wM2IyMTI3Ny1lYTJjLTRjNWItYjc5Ni00YTllNzVlMWM0ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWV0aW5nLWF1ZGlvcy9lODQwM2RmMC0zMzlhLTQ4NzktOTViYi0xNjliY2E5NTY0ZDgvYXVkbm9pc2Uud2F2IiwiaWF0IjoxNzU5OTIxNDI0LCJleHAiOjE3NjI1MTM0MjR9.PXwGTT3DP0MLTFBZ-Puv5vqKb5kAPkhqDkk9tGYZdBk

',  -- ← Replace with audio URL from Step 2
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/sign/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audnoise.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wM2IyMTI3Ny1lYTJjLTRjNWItYjc5Ni00YTllNzVlMWM0ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWV0aW5nLWF1ZGlvcy9lODQwM2RmMC0zMzlhLTQ4NzktOTViYi0xNjliY2E5NTY0ZDgvYXVkbm9pc2Uud2F2IiwiaWF0IjoxNzU5OTIxNDI0LCJleHAiOjE3NjI1MTM0MjR9.PXwGTT3DP0MLTFBZ-Puv5vqKb5kAPkhqDkk9tGYZdBk

',  -- ← Same URL for compatibility
  false,  -- ← Important: has_video = FALSE for audio-only
  false,
  false,
  ARRAY['john@company.com', 'sarah@company.com'],
  ARRAY['standup', 'team-sync'],
  false,
  false,
  NOW(),
  NOW()
) RETURNING id, title, audio_url, has_video;

-- =====================================================
-- EXAMPLE WITH REAL VALUES (replace these):
-- =====================================================

/*
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
  audio_url,
  recording_url,
  has_video,
  has_transcript,
  participants,
  topics,
  is_favorite,
  is_archived
) VALUES (
  '12345678-1234-1234-1234-123456789abc',  -- Your actual user ID
  'Morning Standup - Oct 8',
  'Daily team standup audio recording',
  '2025-10-08 09:00:00+00',
  '2025-10-08 09:15:00+00',
  15,
  'AUDIO',
  'ZOOM',
  'COMPLETED',
  'https://abcdefgh.supabase.co/storage/v1/object/public/meeting-audios/12345678-1234-1234-1234-123456789abc/standup.mp3',
  'https://abcdefgh.supabase.co/storage/v1/object/public/meeting-audios/12345678-1234-1234-1234-123456789abc/standup.mp3',
  false,
  false,
  ARRAY['john@team.com', 'sarah@team.com'],
  ARRAY['standup', 'updates'],
  false,
  false
) RETURNING id;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if meeting was created
SELECT id, title, type, has_video, audio_url 
FROM meetings 
WHERE type = 'AUDIO' 
ORDER BY created_at DESC 
LIMIT 5;

-- View the meeting URL
SELECT 
  id,
  title,
  type,
  has_video,
  audio_url,
  CONCAT('http://localhost:3000/meeting/', id) as view_url
FROM meetings 
WHERE type = 'AUDIO' 
ORDER BY created_at DESC 
LIMIT 1;

