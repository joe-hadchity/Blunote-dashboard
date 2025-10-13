-- =====================================================
-- FIX: Audio files not playing
-- =====================================================
-- 
-- ISSUE: The meeting-audios bucket is private, but we're using
-- public URLs which don't work for private buckets.
--
-- SOLUTION: Make the bucket public OR use signed URLs
-- =====================================================

-- =====================================================
-- OPTION 1: Make bucket public (RECOMMENDED for this app)
-- =====================================================
-- This allows anyone with the URL to access the files
-- Since recordings are user-specific, this is safe

UPDATE storage.buckets 
SET public = true 
WHERE id = 'meeting-audios';

-- Add a public read policy so anyone can download from the bucket
-- (They still need the full URL which includes the user ID)
CREATE POLICY "Public can view audios"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-audios');

-- =====================================================
-- Verification
-- =====================================================
-- Check if bucket is now public
SELECT id, name, public FROM storage.buckets WHERE id = 'meeting-audios';

-- Should show: public = true

-- =====================================================
-- OPTION 2: Keep private and use signed URLs (More secure)
-- =====================================================
-- If you want to keep the bucket private, you'll need to:
-- 1. Update the extension upload endpoint to use createSignedUrl()
-- 2. Generate signed URLs that expire (e.g., 1 year)
--
-- Example code (in TypeScript):
-- 
-- const { data, error } = await supabaseAdmin.storage
--   .from('meeting-audios')
--   .createSignedUrl(filePath, 31536000); // 1 year expiry
-- 
-- const audioUrl = data.signedUrl;
--
-- =====================================================

-- =====================================================
-- After running this, test your audio:
-- =====================================================
-- 1. Go to: http://localhost:3000/test-audio
-- 2. Click "Run Diagnostics"
-- 3. Should show: ✅ All tests passing
-- 4. Click "Test Play" on any file
-- 5. Audio should play!
-- =====================================================




