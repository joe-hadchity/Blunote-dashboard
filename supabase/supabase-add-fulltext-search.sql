-- =====================================================
-- Add Full-Text Search to Meetings Table
-- =====================================================
-- Run this in Supabase SQL Editor to enable powerful search

-- Add a generated column for full-text search
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(participants, ' '), '')), 'C') ||
  setweight(to_tsvector('english', coalesce(array_to_string(topics, ' '), '')), 'D') ||
  setweight(to_tsvector('english', coalesce(ai_summary, '')), 'D')
) STORED;

-- Create an index for fast full-text search
CREATE INDEX IF NOT EXISTS meetings_search_idx ON meetings USING GIN (search_vector);

-- Create a function to search meetings with ranking
CREATE OR REPLACE FUNCTION search_meetings(
  search_query text,
  user_uuid uuid
)
RETURNS TABLE (
  id uuid,
  title varchar,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  duration integer,
  type meeting_type,
  platform meeting_platform,
  status meeting_status,
  recording_url text,
  transcript_url text,
  audio_url text,
  has_transcript boolean,
  has_summary boolean,
  has_video boolean,
  ai_summary text,
  key_points text[],
  action_items text[],
  participants text[],
  sentiment varchar,
  topics text[],
  is_favorite boolean,
  is_archived boolean,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.*,
    ts_rank(m.search_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM meetings m
  WHERE 
    m.user_id = user_uuid
    AND m.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Full-text search enabled on meetings table!';
  RAISE NOTICE '✅ Search index created for fast queries';
  RAISE NOTICE '✅ Search function created with ranking';
  RAISE NOTICE '📝 The search now covers: title, description, participants, topics, and AI summary';
  RAISE NOTICE '🚀 Ready to use powerful search!';
END $$;

