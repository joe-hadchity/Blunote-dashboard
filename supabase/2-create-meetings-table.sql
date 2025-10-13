-- =====================================================
-- CREATE MEETINGS TABLE (Fresh and Clean)
-- =====================================================

CREATE TABLE meetings (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic meeting info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_link TEXT, -- Google Meet/Zoom/Teams link for joining (from calendar sync)
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- Duration in minutes
  
  -- Meeting type and platform
  type VARCHAR(10) NOT NULL CHECK (type IN ('VIDEO', 'AUDIO')),
  platform VARCHAR(50) DEFAULT 'OTHER' CHECK (platform IN ('GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'SLACK', 'OTHER')),
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  
  -- Participants and content
  participants TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  
  -- AI Analysis (for future use)
  sentiment VARCHAR(20),
  ai_summary TEXT,
  key_points TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  
  -- User preferences
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Google Calendar integration (optional)
  synced_from_google BOOLEAN DEFAULT false,
  google_event_id VARCHAR(255),
  google_calendar_id VARCHAR(255),
  last_synced_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration > 0),
  CONSTRAINT valid_times CHECK (end_time > start_time)
);

-- Create indexes for better query performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time DESC);
CREATE INDEX idx_meetings_platform ON meetings(platform);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_is_archived ON meetings(is_archived);
CREATE INDEX idx_meetings_is_favorite ON meetings(is_favorite);
CREATE INDEX idx_meetings_google_event ON meetings(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

-- Full-text search index
CREATE INDEX idx_meetings_title_search ON meetings USING gin(to_tsvector('english', title));
CREATE INDEX idx_meetings_description_search ON meetings USING gin(to_tsvector('english', coalesce(description, '')));

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_meetings_updated_at();

-- Add comments
COMMENT ON TABLE meetings IS 'Stores meeting metadata and scheduling information';
COMMENT ON COLUMN meetings.synced_from_google IS 'Indicates if meeting was synced from Google Calendar';
COMMENT ON COLUMN meetings.duration IS 'Meeting duration in minutes';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Meetings table created successfully';
END $$;

