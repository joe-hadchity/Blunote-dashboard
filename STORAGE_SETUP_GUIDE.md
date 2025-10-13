# 📦 Supabase Storage Setup & Testing Guide

Complete guide to set up storage buckets and test uploading video/audio files.

---

## 🚀 Step 1: Set Up Supabase Storage Buckets

### Option A: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

3. **Create Three Buckets:**

   **Bucket 1: meeting-videos**
   - Name: `meeting-videos`
   - Public: ✅ Check "Public bucket"
   - Click "Create bucket"

   **Bucket 2: meeting-audios**
   - Name: `meeting-audios`
   - Public: ✅ Check "Public bucket"
   - Click "Create bucket"

   **Bucket 3: meeting-transcripts**
   - Name: `meeting-transcripts`
   - Public: ✅ Check "Public bucket"
   - Click "Create bucket"

4. **Set Up Policies (Important!)**
   - For each bucket, click on it
   - Go to "Policies" tab
   - Click "New policy"
   - Select "For full customization" template
   - Copy the policies from `supabase/storage-setup.sql`
   - Or use the SQL editor (next option)

### Option B: Using SQL Editor (Faster)

1. **Go to SQL Editor**
   - In Supabase Dashboard, click "SQL Editor"

2. **Run the Storage Setup Script**
   - Copy all content from `supabase/storage-setup.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Buckets Were Created**
   - Go to Storage section
   - You should see: `meeting-videos`, `meeting-audios`, `meeting-transcripts`

---

## 🧪 Step 2: Test File Upload

### Method 1: Using the Test Upload Page (Recommended)

1. **Navigate to Test Upload Page**
   ```
   http://localhost:3000/test-upload
   ```

2. **Fill in Meeting Details**
   - Title: "My Test Meeting"
   - Description: "Testing video upload"
   - Platform: Select any

3. **Select Files to Upload**
   - **Video**: Click "Choose File" under Video section
     - Supported: .mp4, .webm, .mov, .avi, etc.
     - Max size: 500MB
   
   - **Audio** (optional): Click "Choose File" under Audio section
     - Supported: .mp3, .wav, .m4a, .ogg, etc.
     - Max size: 100MB
   
   - **Transcript** (optional): Upload a .txt file
     - For testing, create a simple text file with sample transcript

4. **Click "Upload & Create Meeting"**
   - Wait for upload to complete (progress shown)
   - You'll see success message with link to view meeting

5. **View the Meeting**
   - Click "View Meeting →" link
   - You should see the video/audio player with your uploaded files

### Method 2: Manual Upload via Supabase Dashboard

If you want to test without the UI:

1. **Go to Storage in Supabase Dashboard**

2. **Select `meeting-videos` bucket**

3. **Create a folder with your user ID**
   - Get your user ID from: Authentication → Users → Copy your UUID
   - Click "Create folder"
   - Name it with your user ID (e.g., `abc123-def456-...`)

4. **Upload a video file**
   - Click on your user folder
   - Click "Upload file"
   - Select your video file
   - Click "Upload"

5. **Get the public URL**
   - After upload, click on the file
   - Copy the public URL (looks like: `https://xxx.supabase.co/storage/v1/object/public/meeting-videos/...`)

6. **Create a meeting with this URL**
   - Go to: http://localhost:3000/calendar
   - Click "New Meeting"
   - Fill in details
   - In "Meeting Link" field, paste the storage URL
   - Save

---

## 📁 Where to Get Test Files

### Sample Video Files
- **Option 1**: Use a short video from your phone/camera
- **Option 2**: Download sample videos:
  - https://sample-videos.com/
  - https://test-videos.co.uk/
  - Or record a quick screen recording

### Sample Audio Files
- Record a quick voice memo on your phone
- Use any .mp3 music file for testing
- Or use online text-to-speech to generate audio

### Sample Transcript
Create a simple text file (`transcript.txt`):
```
Speaker 1: Welcome to the meeting everyone.
Speaker 2: Thanks for having us.
Speaker 1: Let's discuss the project updates.
```

---

## 🔍 Step 3: Verify Upload

### Check in Supabase Dashboard

1. **Go to Storage → meeting-videos**
   - You should see a folder with your user ID
   - Inside, you'll see your uploaded files

2. **Click on a file**
   - You should be able to preview it
   - Copy the public URL

3. **Test the URL**
   - Paste the URL in a new browser tab
   - The video should play/download

### Check in Your App

1. **Go to Meetings Page**
   - http://localhost:3000/meetings
   - Find your test meeting

2. **Click on the Meeting**
   - Should open meeting detail page
   - Video player should show your uploaded video

3. **Verify Database**
   - Go to Supabase Dashboard → Table Editor
   - Open `meetings` table
   - Find your meeting
   - Check that `recording_url`, `audio_url`, `has_video` fields are populated

---

## 🎯 Expected Results

After successful upload, you should have:

✅ **Files in Storage:**
```
meeting-videos/
  └── {your-user-id}/
      └── {timestamp}-your-video.mp4

meeting-audios/
  └── {your-user-id}/
      └── {timestamp}-your-audio.mp3
```

✅ **Meeting in Database:**
```json
{
  "id": "123",
  "title": "My Test Meeting",
  "recording_url": "https://xxx.supabase.co/storage/v1/object/public/meeting-videos/...",
  "audio_url": "https://xxx.supabase.co/storage/v1/object/public/meeting-audios/...",
  "has_video": true,
  "has_transcript": false
}
```

✅ **Accessible URLs:**
- Video URL should be publicly accessible
- Audio URL should be publicly accessible
- Files play directly in browser

---

## 🐛 Troubleshooting

### Issue: "Storage bucket not found"
**Solution:** Run the storage setup SQL script in Supabase SQL Editor

### Issue: "Permission denied" when uploading
**Solution:** 
- Check that buckets are set to "Public"
- Verify storage policies are created
- Make sure you're logged in

### Issue: "File too large"
**Solution:**
- Videos: Max 500MB (adjust in `src/lib/storage.ts` if needed)
- Audio: Max 100MB
- Compress files if needed

### Issue: "Invalid file type"
**Solution:**
- Check allowed MIME types in `validateFile()` function
- Videos: video/*
- Audio: audio/*

### Issue: Upload succeeds but meeting creation fails
**Solution:**
- Check browser console for errors
- Verify `/api/meetings` endpoint is working
- Check that you're authenticated

---

## 📊 File Size Limits

| File Type | Max Size | Bucket |
|-----------|----------|--------|
| Video | 500 MB | meeting-videos |
| Audio | 100 MB | meeting-audios |
| Transcript | 10 MB | meeting-transcripts |

To change these limits, edit `src/lib/storage.ts` in the `validateFile()` function.

---

## 🔐 Security Notes

**Current Setup (For Testing):**
- ✅ Buckets are public
- ✅ Anyone with URL can view files
- ✅ Only authenticated users can upload

**For Production:**
- Consider making buckets private
- Use signed URLs for temporary access
- Add row-level security
- Implement file scanning for malware

---

## 🎬 Quick Test Checklist

- [ ] Storage buckets created in Supabase
- [ ] Policies set up (public read, authenticated upload)
- [ ] Test upload page accessible at `/test-upload`
- [ ] Selected a video or audio file (< max size)
- [ ] Uploaded successfully
- [ ] Meeting created with file URLs
- [ ] Can view meeting detail page
- [ ] Video/audio plays correctly
- [ ] Files visible in Supabase Storage dashboard

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Supabase Logs**
   - Dashboard → Logs → Storage logs

2. **Check Browser Console**
   - F12 → Console tab
   - Look for error messages

3. **Verify Environment Variables**
   - Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set

4. **Test Storage API Directly**
   ```javascript
   // In browser console:
   const { data, error } = await supabase.storage.from('meeting-videos').list();
   console.log(data, error);
   ```

---

## ✅ Next Steps After Testing

Once uploads work:

1. **Add Video Player Component**
   - Display uploaded videos in meeting detail page
   - Add playback controls

2. **Add Audio Waveform Visualization**
   - For audio-only meetings
   - Use libraries like wavesurfer.js

3. **Implement Transcript Processing**
   - Parse uploaded transcript files
   - Display with timestamps

4. **Add Automatic Transcription**
   - Integrate Whisper API or similar
   - Process uploaded audio/video files

5. **Add Progress Bars**
   - Show upload progress in real-time
   - Handle large file uploads better




