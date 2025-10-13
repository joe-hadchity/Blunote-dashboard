-- =====================================================
-- CREATE GOOGLE CALENDAR TOKENS TABLE
-- Stores OAuth tokens for Google Calendar integration
-- =====================================================

CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  
  -- Token metadata
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT, -- Unix timestamp in milliseconds
  scope TEXT,
  
  -- Sync tracking
  last_sync_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one token set per user
  CONSTRAINT unique_user_token UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_google_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX idx_google_tokens_last_sync ON google_calendar_tokens(last_sync_at DESC);

-- Enable Row Level Security
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tokens"
  ON google_calendar_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON google_calendar_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON google_calendar_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON google_calendar_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_google_calendar_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER google_calendar_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_calendar_tokens_updated_at();

-- Add comments
COMMENT ON TABLE google_calendar_tokens IS 'Stores OAuth tokens for Google Calendar integration';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'OAuth 2.0 access token (encrypted in production)';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'OAuth 2.0 refresh token for obtaining new access tokens';
COMMENT ON COLUMN google_calendar_tokens.expiry_date IS 'Token expiry time in Unix milliseconds';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Google Calendar tokens table created successfully';
END $$;




