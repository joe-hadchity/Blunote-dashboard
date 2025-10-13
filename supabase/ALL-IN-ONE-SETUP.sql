-- =====================================================
-- ALL-IN-ONE SETUP SCRIPT
-- Complete database reset and setup with your actual data
-- User ID: e8403df0-339a-4879-95bb-169bca9564d8
-- =====================================================

-- =====================================================
-- STEP 1: RESET (Delete Everything)
-- =====================================================

DROP VIEW IF EXISTS meetings_with_recordings CASCADE;
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS google_calendar_tokens CASCADE;
DROP FUNCTION IF EXISTS update_recordings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_meetings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_google_calendar_tokens_updated_at() CASCADE;

RAISE NOTICE '✅ Step 1: Database reset complete';

-- =====================================================
-- STEP 2: CREATE MEETINGS TABLE
-- =====================================================

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_link TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('VIDEO', 'AUDIO')),
  platform VARCHAR(50) DEFAULT 'OTHER' CHECK (platform IN ('GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'SLACK', 'OTHER')),
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  participants TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  sentiment VARCHAR(20),
  ai_summary TEXT,
  key_points TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  synced_from_google BOOLEAN DEFAULT false,
  google_event_id VARCHAR(255),
  google_calendar_id VARCHAR(255),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_duration CHECK (duration > 0),
  CONSTRAINT valid_times CHECK (end_time > start_time)
);

CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time DESC);
CREATE INDEX idx_meetings_platform ON meetings(platform);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_meetings_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_meetings_updated_at();

RAISE NOTICE '✅ Step 2: Meetings table created';

-- =====================================================
-- STEP 2.5: CREATE GOOGLE CALENDAR TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT,
  scope TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_token UNIQUE (user_id)
);

CREATE INDEX idx_google_tokens_user_id ON google_calendar_tokens(user_id);
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens" ON google_calendar_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tokens" ON google_calendar_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tokens" ON google_calendar_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tokens" ON google_calendar_tokens FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_google_calendar_tokens_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER google_calendar_tokens_updated_at BEFORE UPDATE ON google_calendar_tokens FOR EACH ROW EXECUTE FUNCTION update_google_calendar_tokens_updated_at();

RAISE NOTICE '✅ Step 2.5: Google Calendar tokens table created';

-- =====================================================
-- STEP 3: CREATE RECORDINGS TABLE (Flexible)
-- =====================================================

CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NULL REFERENCES meetings(id) ON DELETE SET NULL,  -- NULLABLE = standalone recordings allowed
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title VARCHAR(255),
  description TEXT,
  
  recording_url TEXT,
  audio_url TEXT,
  transcript_url TEXT,
  
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('VIDEO', 'AUDIO')),
  file_size BIGINT,
  duration INTEGER,
  format VARCHAR(20),
  
  status VARCHAR(20) DEFAULT 'READY' CHECK (status IN ('UPLOADING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
  processing_progress INTEGER DEFAULT 100,
  error_message TEXT,
  
  has_video BOOLEAN DEFAULT false,
  has_audio BOOLEAN DEFAULT true,
  has_transcript BOOLEAN DEFAULT false,
  
  transcription_status VARCHAR(20) DEFAULT 'PENDING' CHECK (transcription_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  
  storage_bucket VARCHAR(50),
  storage_path TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT recording_has_file CHECK (recording_url IS NOT NULL OR audio_url IS NOT NULL)
);

CREATE INDEX idx_recordings_meeting_id ON recordings(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX idx_recordings_standalone ON recordings(user_id) WHERE meeting_id IS NULL;
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_file_type ON recordings(file_type);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recordings" ON recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recordings" ON recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recordings" ON recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recordings" ON recordings FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_recordings_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recordings_updated_at BEFORE UPDATE ON recordings FOR EACH ROW EXECUTE FUNCTION update_recordings_updated_at();

RAISE NOTICE '✅ Step 3: Recordings table created (with nullable meeting_id)';

-- =====================================================
-- STEP 4: CREATE VIEW
-- =====================================================

CREATE OR REPLACE VIEW meetings_with_recordings AS
SELECT 
  r.id as recording_id,
  r.user_id,
  COALESCE(r.title, m.title, 'Untitled Recording') as title,
  COALESCE(r.description, m.description) as description,
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
  m.is_favorite,
  m.is_archived,
  m.synced_from_google,
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
  r.created_at,
  r.updated_at
FROM recordings r
LEFT JOIN meetings m ON r.meeting_id = m.id;

RAISE NOTICE '✅ Step 4: View created';

-- =====================================================
-- STEP 5: INSERT YOUR ACTUAL DATA
-- =====================================================

-- Standalone Video Recording (No Meeting Required)
INSERT INTO recordings (
  meeting_id,
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
  NULL,  -- Standalone (no meeting)
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Test Video Recording - Product Demo',
  'Testing video playback and noise cancellation',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-videos/e8403df0-339a-4879-95bb-169bca9564d8/meeting_video_2025-10-07T12-41-12-218Z.webm',  -- Public URL (permanent)
  'VIDEO',
  'webm',
  25000000,  -- 25MB estimate
  2700,      -- 45 min in seconds
  true,
  true,
  false,
  'READY'
);

-- Standalone Audio Recording (No Meeting Required)
INSERT INTO recordings (
  meeting_id,
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
  NULL,  -- Standalone (no meeting)
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Audio Sample - Noise Test',
  'WAV file for testing audio noise cancellation',
  'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-audios/e8403df0-339a-4879-95bb-169bca9564d8/audnoise.wav',  -- Public URL (permanent)
  'AUDIO',
  'wav',
  15000000,  -- 15MB estimate
  900,       -- 15 min in seconds
  false,
  true,
  false,
  'READY'
);

RAISE NOTICE '✅ Step 5: Your recordings inserted';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- View all recordings
SELECT 
  id,
  title,
  file_type,
  meeting_id IS NULL as is_standalone,
  status,
  has_video,
  has_audio,
  recording_url IS NOT NULL as has_video_file,
  audio_url IS NOT NULL as has_audio_file,
  created_at
FROM recordings
WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8'
ORDER BY created_at DESC;

-- View using the view
SELECT 
  recording_id,
  title,
  type,
  id as meeting_id,
  recording_status,
  has_video,
  recording_url IS NOT NULL as playable
FROM meetings_with_recordings
WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8'
ORDER BY created_at DESC;

-- Success summary
DO $$ 
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM recordings WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ SETUP COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total recordings created: %', v_count;
  RAISE NOTICE '🎬 Video file: meeting_video_2025-10-07T12-41-12-218Z.webm';
  RAISE NOTICE '🎵 Audio file: audnoise.wav';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created:';
  RAISE NOTICE '   - meetings';
  RAISE NOTICE '   - google_calendar_tokens';
  RAISE NOTICE '   - recordings';
  RAISE NOTICE '   - meetings_with_recordings (view)';
  RAISE NOTICE '';
  RAISE NOTICE '➡️  Visit: http://localhost:3000/recordings';
  RAISE NOTICE '➡️  Click on a recording to play your files!';
  RAISE NOTICE '➡️  Connect Google Calendar: http://localhost:3000/integrations';
  RAISE NOTICE '';
END $$;

