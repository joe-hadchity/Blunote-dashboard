-- =====================================================
-- RESET DATABASE - Clear All Tables and Views
-- WARNING: This will delete ALL data!
-- =====================================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS meetings_with_recordings CASCADE;

-- Drop recordings table (it references meetings)
DROP TABLE IF EXISTS recordings CASCADE;

-- Drop meetings table
DROP TABLE IF EXISTS meetings CASCADE;

-- Drop google calendar tokens table
DROP TABLE IF EXISTS google_calendar_tokens CASCADE;

-- Drop any functions or triggers related to these tables
DROP FUNCTION IF EXISTS update_recordings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_meetings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_google_calendar_tokens_updated_at() CASCADE;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Database reset complete. All tables and views dropped.';
  RAISE NOTICE '➡️  Run the next scripts to create fresh tables.';
END $$;

