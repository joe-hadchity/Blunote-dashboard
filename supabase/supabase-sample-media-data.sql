-- =====================================================
-- Sample Media and AI Analytics Data
-- =====================================================
-- IMPORTANT: Replace 'e8403df0-339a-4879-95bb-169bca9564d8' and 'YOUR_MEETING_ID_HERE'
-- with your actual UUIDs before running

-- To get your meeting IDs, run:
-- SELECT id, title FROM meetings ORDER BY created_at DESC LIMIT 5;

-- =====================================================
-- Sample Video File
-- =====================================================
INSERT INTO meeting_videos (
  meeting_id,
  user_id,
  file_url,
  file_name,
  file_size,
  file_type,
  duration_seconds,
  resolution,
  fps,
  codec,
  bitrate,
  processing_status,
  thumbnail_url,
  storage_provider,
  processed_at
) VALUES (
  'YOUR_MEETING_ID_HERE',
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://storage.example.com/videos/meeting-recording-001.mp4',
  'weekly-project-sync-oct-3-2025.mp4',
  125829120, -- ~120 MB
  'video/mp4',
  2700, -- 45 minutes
  '1920x1080',
  30,
  'h264',
  2500,
  'completed',
  'https://storage.example.com/thumbnails/meeting-001-thumb.jpg',
  'vercel_blob',
  NOW()
);

-- =====================================================
-- Sample Audio File
-- =====================================================
INSERT INTO meeting_audios (
  meeting_id,
  user_id,
  file_url,
  file_name,
  file_size,
  file_type,
  duration_seconds,
  sample_rate,
  channels,
  bitrate,
  codec,
  processing_status,
  storage_provider,
  processed_at
) VALUES (
  'YOUR_MEETING_ID_HERE',
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'https://storage.example.com/audio/meeting-audio-001.mp3',
  'weekly-project-sync-oct-3-2025.mp3',
  21495808, -- ~20 MB
  'audio/mp3',
  2700, -- 45 minutes
  44100,
  2, -- Stereo
  128,
  'mp3',
  'completed',
  'vercel_blob',
  NOW()
);

-- =====================================================
-- Sample Transcript
-- =====================================================
INSERT INTO meeting_transcripts (
  meeting_id,
  user_id,
  full_transcript,
  language,
  transcription_service,
  confidence_score,
  processing_status,
  file_url,
  file_format
) VALUES (
  'YOUR_MEETING_ID_HERE',
  'e8403df0-339a-4879-95bb-169bca9564d8',
  E'[00:00] John: Welcome everyone to today\'s weekly project sync meeting.\n[00:15] Sarah: Thanks John. I\'d like to start by reviewing our progress on the Q4 deliverables.\n[00:32] Mike: We\'ve completed 80% of the user interface updates. The remaining work should be done by Friday.\n[01:05] John: That\'s great progress Mike. Sarah, how are we looking on the backend integration?\n[01:18] Sarah: The API endpoints are ready, but we\'re still waiting for the third-party service to approve our integration request.\n[01:45] Mike: I can follow up with them today. We have a good relationship with their technical team.\n[02:12] John: Perfect. Let\'s also discuss the upcoming client presentation next week.\n[02:28] Sarah: I\'ve prepared the demo environment and all the key features are working smoothly.\n[02:55] Mike: I\'ll have the updated documentation ready by Monday for the client review.\n[03:20] John: Excellent work everyone. Let\'s schedule our next check-in for Wednesday at the same time.',
  'en',
  'openai_whisper',
  0.95,
  'completed',
  'https://storage.example.com/transcripts/meeting-001.txt',
  'txt'
);

-- =====================================================
-- Sample Transcript Segments (Timestamped)
-- =====================================================
-- First, get the transcript_id from the inserted transcript
-- For this example, we'll use a placeholder. In real usage, you'd get it from the INSERT above

WITH new_transcript AS (
  SELECT id FROM meeting_transcripts 
  WHERE meeting_id = 'YOUR_MEETING_ID_HERE' 
  ORDER BY created_at DESC 
  LIMIT 1
)
INSERT INTO transcript_segments (
  transcript_id,
  meeting_id,
  speaker_name,
  text,
  start_time,
  end_time,
  confidence
)
SELECT 
  (SELECT id FROM new_transcript),
  'YOUR_MEETING_ID_HERE',
  speaker,
  text,
  start_time,
  end_time,
  confidence
FROM (VALUES
  ('John', 'Welcome everyone to today''s weekly project sync meeting.', 0.0, 5.2, 0.98),
  ('Sarah', 'Thanks John. I''d like to start by reviewing our progress on the Q4 deliverables.', 15.0, 22.5, 0.96),
  ('Mike', 'We''ve completed 80% of the user interface updates. The remaining work should be done by Friday.', 32.0, 42.3, 0.97),
  ('John', 'That''s great progress Mike. Sarah, how are we looking on the backend integration?', 65.0, 73.8, 0.95),
  ('Sarah', 'The API endpoints are ready, but we''re still waiting for the third-party service to approve our integration request.', 78.0, 89.2, 0.94),
  ('Mike', 'I can follow up with them today. We have a good relationship with their technical team.', 105.0, 114.5, 0.96),
  ('John', 'Perfect. Let''s also discuss the upcoming client presentation next week.', 132.0, 140.2, 0.97),
  ('Sarah', 'I''ve prepared the demo environment and all the key features are working smoothly.', 148.0, 158.6, 0.95),
  ('Mike', 'I''ll have the updated documentation ready by Monday for the client review.', 175.0, 184.3, 0.96),
  ('John', 'Excellent work everyone. Let''s schedule our next check-in for Wednesday at the same time.', 200.0, 210.5, 0.98)
) AS t(speaker, text, start_time, end_time, confidence);

-- =====================================================
-- Sample AI Analytics
-- =====================================================
INSERT INTO meeting_ai_analytics (
  meeting_id,
  user_id,
  summary,
  summary_short,
  sentiment,
  sentiment_score,
  engagement_level,
  key_points,
  action_items,
  topics,
  categories,
  keywords,
  speakers,
  dominant_speaker,
  clarity_score,
  productivity_score,
  questions_asked,
  decisions_made,
  follow_up_required,
  next_steps,
  ai_model,
  ai_provider,
  processing_cost,
  processing_status,
  analyzed_at
) VALUES (
  'YOUR_MEETING_ID_HERE',
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'The team discussed the current sprint progress with 80% of UI updates completed. Backend integration is pending third-party approval. A client presentation is scheduled for next week, with demo environment and documentation being prepared. Overall positive progress with clear action items assigned.',
  'Team sync covering project progress, backend integration status, and upcoming client presentation.',
  'positive',
  0.85,
  'high',
  -- Key points as JSONB
  '[
    {"text": "Project progress: 80% of UI updates completed", "importance": 0.95, "timestamp": 32},
    {"text": "Backend integration pending third-party approval", "importance": 0.90, "timestamp": 78},
    {"text": "Client presentation scheduled for next week", "importance": 0.88, "timestamp": 132},
    {"text": "Documentation updates due Monday", "importance": 0.75, "timestamp": 175}
  ]'::JSONB,
  -- Action items as JSONB
  '[
    {"task": "Follow up with third-party service", "assignee": "Mike", "priority": "high", "due_date": "2025-10-08"},
    {"task": "Prepare demo environment", "assignee": "Sarah", "priority": "high", "due_date": "2025-10-10"},
    {"task": "Complete documentation by Monday", "assignee": "Mike", "priority": "medium", "due_date": "2025-10-06"},
    {"task": "Schedule next check-in for Wednesday", "assignee": "John", "priority": "low", "due_date": "2025-10-09"}
  ]'::JSONB,
  ARRAY['Project Updates', 'Backend Integration', 'Client Presentation', 'Documentation'],
  ARRAY['Sprint Planning', 'Team Sync', 'Status Update'],
  ARRAY['progress', 'integration', 'presentation', 'documentation', 'approval', 'demo'],
  -- Speakers analysis as JSONB
  '[
    {"name": "John", "speaking_time": 180, "words": 245, "turns": 4},
    {"name": "Sarah", "speaking_time": 240, "words": 320, "turns": 3},
    {"name": "Mike", "speaking_time": 220, "words": 290, "turns": 3}
  ]'::JSONB,
  'Sarah',
  0.92, -- High clarity
  0.88, -- High productivity
  -- Questions asked as JSONB
  '[
    {"question": "How are we looking on the backend integration?", "asker": "John", "answered": true, "timestamp": 65}
  ]'::JSONB,
  -- Decisions made as JSONB
  '[
    {"decision": "Mike to follow up with third-party service", "impact": "high", "timestamp": 105},
    {"decision": "Demo environment to be ready by presentation", "impact": "high", "timestamp": 148},
    {"decision": "Next meeting scheduled for Wednesday", "impact": "low", "timestamp": 200}
  ]'::JSONB,
  TRUE, -- Follow-up required
  ARRAY['Complete UI updates', 'Await third-party approval', 'Prepare client demo', 'Finalize documentation'],
  'gpt-4',
  'openai',
  0.0450, -- $0.045
  'completed',
  NOW()
);

-- =====================================================
-- Sample AI Chat History
-- =====================================================
INSERT INTO meeting_ai_chats (meeting_id, user_id, role, message, ai_model, tokens_used)
VALUES 
  ('YOUR_MEETING_ID_HERE', 'e8403df0-339a-4879-95bb-169bca9564d8', 'user', 'What were the main topics discussed?', 'gpt-4', 12),
  ('YOUR_MEETING_ID_HERE', 'e8403df0-339a-4879-95bb-169bca9564d8', 'assistant', 'The main topics discussed were: 1) Project progress (80% UI updates completed), 2) Backend integration (pending third-party approval), 3) Client presentation preparation for next week, and 4) Documentation updates.', 'gpt-4', 58),
  ('YOUR_MEETING_ID_HERE', 'e8403df0-339a-4879-95bb-169bca9564d8', 'user', 'Who is responsible for following up with the third-party service?', 'gpt-4', 15),
  ('YOUR_MEETING_ID_HERE', 'e8403df0-339a-4879-95bb-169bca9564d8', 'assistant', 'Mike is responsible for following up with the third-party service. He mentioned having a good relationship with their technical team and committed to reaching out today.', 'gpt-4', 42);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Sample media and analytics data inserted!';
  RAISE NOTICE '⚠️  Remember to replace YOUR_MEETING_ID_HERE and e8403df0-339a-4879-95bb-169bca9564d8';
  RAISE NOTICE '💡 Query to get IDs: SELECT id, title FROM meetings LIMIT 1;';
  RAISE NOTICE '💡 Query to get user ID: SELECT id FROM auth.users WHERE email = ''your-email@example.com'';';
END $$;

