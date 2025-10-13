-- =====================================================
-- Meetings Table Schema for Supabase
-- =====================================================
-- This script creates the meetings table with all necessary fields
-- Run this in Supabase SQL Editor

-- Create ENUM types for meetings
CREATE TYPE meeting_type AS ENUM ('VIDEO', 'AUDIO');
CREATE TYPE meeting_platform AS ENUM ('GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'SLACK', 'OTHER');
CREATE TYPE meeting_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic meeting info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Time and duration
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- Duration in minutes
  
  -- Meeting type and platform
  type meeting_type DEFAULT 'VIDEO',
  platform meeting_platform DEFAULT 'GOOGLE_MEET',
  status meeting_status DEFAULT 'SCHEDULED',
  
  -- File URLs
  recording_url TEXT,
  transcript_url TEXT,
  audio_url TEXT,
  
  -- Content flags
  has_transcript BOOLEAN DEFAULT FALSE,
  has_summary BOOLEAN DEFAULT FALSE,
  has_video BOOLEAN DEFAULT FALSE,
  
  -- AI-generated content
  ai_summary TEXT,
  key_points TEXT[], -- Array of strings
  action_items TEXT[], -- Array of strings
  
  -- Meeting metadata
  participants TEXT[], -- Array of participant names
  sentiment VARCHAR(50), -- e.g., 'positive', 'neutral', 'negative'
  topics TEXT[], -- Array of topics discussed
  
  -- User preferences
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time DESC);
CREATE INDEX idx_meetings_platform ON meetings(platform);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_is_favorite ON meetings(is_favorite);
CREATE INDEX idx_meetings_is_archived ON meetings(is_archived);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own meetings
CREATE POLICY "Users can view their own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meetings
CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meetings
CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own meetings
CREATE POLICY "Users can delete their own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON meetings TO authenticated;
GRANT ALL ON meetings TO service_role;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Meetings table created successfully!';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Ready to insert data!';
END $$;

