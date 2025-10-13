-- =====================================================
-- Add Google Calendar Integration Fields to Meetings Table
-- =====================================================
-- This script adds fields to track Google Calendar sync
-- Run this in Supabase SQL Editor AFTER creating meetings table

-- Add Google Calendar integration fields
ALTER TABLE meetings 
  ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS google_calendar_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS synced_from_google BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Create index for Google event lookup
CREATE INDEX IF NOT EXISTS idx_meetings_google_event_id ON meetings(google_event_id);
CREATE INDEX IF NOT EXISTS idx_meetings_synced_from_google ON meetings(synced_from_google);

-- Add unique constraint to prevent duplicate syncs
CREATE UNIQUE INDEX IF NOT EXISTS idx_meetings_user_google_event 
  ON meetings(user_id, google_event_id) 
  WHERE google_event_id IS NOT NULL;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Google Calendar sync fields added to meetings table!';
  RAISE NOTICE '✅ Indexes created for efficient lookup';
  RAISE NOTICE '✅ Ready for Google Calendar integration!';
END $$;





