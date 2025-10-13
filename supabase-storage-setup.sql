-- =====================================================
-- Supabase Storage Buckets Setup
-- =====================================================
-- Run this in Supabase SQL Editor to create storage buckets

-- Note: You can also create buckets via Supabase Dashboard:
-- Storage → Create Bucket

-- =====================================================
-- Create Storage Buckets
-- =====================================================

-- 1. Create bucket for meeting videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-videos',
  'meeting-videos',
  false, -- Private bucket (requires authentication)
  524288000, -- 500 MB max file size
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create bucket for meeting audios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-audios',
  'meeting-audios',
  false, -- Private bucket
  104857600, -- 100 MB max file size
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- 3. Create bucket for transcripts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-transcripts',
  'meeting-transcripts',
  false, -- Private bucket
  10485760, -- 10 MB max file size
  ARRAY['text/plain', 'text/vtt', 'application/x-subrip', 'application/json']
) ON CONFLICT (id) DO NOTHING;

-- 4. Create bucket for thumbnails (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-thumbnails',
  'meeting-thumbnails',
  true, -- Public bucket (thumbnails can be public)
  5242880, -- 5 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies (RLS for Storage)
-- =====================================================

-- Policies for meeting-videos bucket
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'meeting-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meeting-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for meeting-audios bucket
CREATE POLICY "Users can upload their own audios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-audios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own audios"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'meeting-audios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own audios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meeting-audios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own audios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-audios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for meeting-transcripts bucket
CREATE POLICY "Users can upload their own transcripts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own transcripts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'meeting-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own transcripts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for meeting-thumbnails bucket (public read)
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-thumbnails');

CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Storage buckets created successfully!';
  RAISE NOTICE '📁 Created buckets:';
  RAISE NOTICE '   - meeting-videos (500 MB limit, private)';
  RAISE NOTICE '   - meeting-audios (100 MB limit, private)';
  RAISE NOTICE '   - meeting-transcripts (10 MB limit, private)';
  RAISE NOTICE '   - meeting-thumbnails (5 MB limit, public)';
  RAISE NOTICE '✅ Storage policies (RLS) enabled';
  RAISE NOTICE '🔒 Users can only access their own files';
  RAISE NOTICE '📝 File path format: {user_id}/{meeting_id}/{filename}';
  RAISE NOTICE '🚀 Ready for file uploads!';
END $$;


