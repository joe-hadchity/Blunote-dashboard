-- =====================================================
-- Google Calendar Integration - Tokens Table
-- =====================================================
-- This script creates a table to store Google OAuth tokens
-- Run this in Supabase SQL Editor

-- Create table to store Google Calendar OAuth tokens
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT NOT NULL, -- Unix timestamp in milliseconds
  
  -- Google account info
  google_email VARCHAR(255),
  google_account_id VARCHAR(255),
  
  -- Sync settings
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_token TEXT, -- For incremental sync
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one token per user
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_google_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX idx_google_tokens_sync_enabled ON google_calendar_tokens(sync_enabled);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own tokens
CREATE POLICY "Users can view their own tokens"
  ON google_calendar_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own tokens"
  ON google_calendar_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update their own tokens"
  ON google_calendar_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete their own tokens"
  ON google_calendar_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON google_calendar_tokens TO authenticated;
GRANT ALL ON google_calendar_tokens TO service_role;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Google Calendar tokens table created successfully!';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Ready to store Google OAuth tokens!';
END $$;





