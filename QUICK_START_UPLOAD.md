# 🚀 Quick Start: Test Video/Audio Upload

## ⚡ 3-Minute Setup

### Step 1: Set Up Storage (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Run this file: `supabase/storage-setup.sql` (copy & paste, then click Run)
4. ✅ Done! Buckets created with policies

### Step 2: Upload Test File (1 minute)

1. Open: **http://localhost:3000/test-upload**
2. Enter meeting title
3. Click "Choose File" under Video
4. Select any video file (MP4, WebM, etc.)
5. Click "Upload & Create Meeting"
6. ✅ Done! View the meeting

---

## 📋 What You Need

- [ ] A video file (any format, < 500MB)
- [ ] OR an audio file (MP3, WAV, etc., < 100MB)
- [ ] Logged into your app

---

## 🎯 Expected Result

After uploading:

1. ✅ Files appear in Supabase Storage
2. ✅ Meeting created with file URLs
3. ✅ Can view meeting detail page
4. ✅ Video/audio plays in browser

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Test Upload Page | http://localhost:3000/test-upload |
| Meetings List | http://localhost:3000/meetings |
| Supabase Storage | https://supabase.com/dashboard (Storage tab) |

---

## 🎥 Where to Get Test Videos

**Quick Options:**
1. Record screen with OBS/QuickTime
2. Download: https://sample-videos.com/
3. Use phone camera video
4. Download: https://test-videos.co.uk/bigbuckbunny/mp4.html

**Recommended for Testing:**
- File: Big Buck Bunny (sample video)
- Size: ~10MB (short version)
- Format: MP4
- Link: https://test-videos.co.uk/bigbuckbunny/mp4.html

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Bucket not found" | Run `storage-setup.sql` in Supabase SQL Editor |
| "Permission denied" | Make sure buckets are set to Public |
| "File too large" | Use smaller file or adjust limits in code |
| Page not found | Make sure dev server is running (`npm run dev`) |

---

## ✅ Success Checklist

After upload, verify:

- [ ] Go to Supabase → Storage → meeting-videos
- [ ] See your user ID folder with uploaded file
- [ ] Copy file URL and open in browser
- [ ] File plays/downloads correctly
- [ ] Meeting appears in /meetings page
- [ ] Meeting detail page shows video player

---

## 📸 What It Should Look Like

**Supabase Storage:**
```
meeting-videos/
  └── abc123-def456-ghi789/  ← Your user ID
      └── 1696800000-my-video.mp4  ← Your file
```

**Database (meetings table):**
```
recording_url: https://xxx.supabase.co/storage/v1/object/public/meeting-videos/abc123.../video.mp4
has_video: true
```

---

## 🆘 Still Having Issues?

1. Check browser console (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify you're logged in
4. Try a smaller file first (< 50MB)

---

## 🎉 What's Next?

Once uploads work:

1. Test audio-only upload
2. Test transcript upload
3. Add video player to meeting detail page
4. Implement automatic transcription
5. Add video processing/compression

**Need help with any of these? Just ask!** 🚀




