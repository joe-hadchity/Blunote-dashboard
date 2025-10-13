-- =====================================================
-- SUPABASE STORAGE SETUP FOR MEETINGS
-- Create buckets and policies for video, audio, and transcript files
-- =====================================================

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('meeting-videos', 'meeting-videos', true),
  ('meeting-audios', 'meeting-audios', true),
  ('meeting-transcripts', 'meeting-transcripts', true)
on conflict (id) do nothing;

-- =====================================================
-- POLICIES FOR MEETING VIDEOS BUCKET
-- =====================================================

-- Allow authenticated users to upload videos
create policy "Users can upload their own meeting videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meeting-videos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own videos
create policy "Users can read their own meeting videos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meeting-videos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own videos
create policy "Users can delete their own meeting videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meeting-videos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLICIES FOR MEETING AUDIOS BUCKET
-- =====================================================

-- Allow authenticated users to upload audios
create policy "Users can upload their own meeting audios"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meeting-audios' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own audios
create policy "Users can read their own meeting audios"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meeting-audios' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own audios
create policy "Users can delete their own meeting audios"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meeting-audios' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLICIES FOR MEETING TRANSCRIPTS BUCKET
-- =====================================================

-- Allow authenticated users to upload transcripts
create policy "Users can upload their own meeting transcripts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meeting-transcripts' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own transcripts
create policy "Users can read their own meeting transcripts"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meeting-transcripts' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own transcripts
create policy "Users can delete their own meeting transcripts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meeting-transcripts' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PUBLIC READ ACCESS (Optional - for easier testing)
-- Comment these out if you want private files only
-- =====================================================

-- Allow public to read videos (for sharing)
create policy "Public can read meeting videos"
on storage.objects for select
to public
using (bucket_id = 'meeting-videos');

-- Allow public to read audios (for sharing)
create policy "Public can read meeting audios"
on storage.objects for select
to public
using (bucket_id = 'meeting-audios');

-- Allow public to read transcripts (for sharing)
create policy "Public can read meeting transcripts"
on storage.objects for select
to public
using (bucket_id = 'meeting-transcripts');




