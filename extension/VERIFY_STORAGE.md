# ✅ Verify Audio Storage

Your recording should now be saved! Let's verify it's in the right place.

---

## 🔍 **Method 1: Storage Verification Page (Easiest)**

### **Step 1: Open the test page**
```
http://localhost:3000/test-storage
```

### **Step 2: Check the dashboard**

You should see:

✅ **Files in Storage:** `1` (or more)  
✅ **Recordings in DB:** `1` (or more)  
✅ **Total Size:** `[file size]`

### **Step 3: Test playback**

Click the **▶️ Play** button next to your recording to test if the audio plays correctly.

---

## 🔍 **Method 2: Check Backend Logs**

### **Look at your terminal where `npm run dev` is running:**

You should see logs like:

```javascript
Extension upload: {
  title: 'Recorded Meeting',
  platform: 'GOOGLE_MEET',
  duration: 15,
  fileSize: 245678,
  fileName: 'recording-1234567890.webm'
}

Recording saved successfully: [uuid]
```

If you see **errors** instead:
- ❌ `Storage upload error:` → Check Supabase Storage bucket exists
- ❌ `Database insert error:` → Check database schema
- ❌ `Not authenticated` → Extension auth issue

---

## 🔍 **Method 3: Check Supabase Dashboard**

### **Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### **Step 2: Check Storage**

1. Go to: **Storage** (left sidebar)
2. Click on: **meeting-audios** bucket
3. Look for folder: `[your-user-id]/`
4. You should see: `[timestamp]-recording-[timestamp].webm`

### **Step 3: Check Database**

1. Go to: **Table Editor** (left sidebar)
2. Open table: **recordings**
3. You should see your new recording with:
   - `title`: "Recorded Meeting"
   - `audio_url`: `https://...supabase.co/storage/.../meeting-audios/...`
   - `file_size`: `[size in bytes]`
   - `duration`: `[seconds]`
   - `has_audio`: `true`
   - `status`: `READY`

---

## 🔍 **Method 4: Check /recordings Page**

### **Step 1: Open recordings page**
```
http://localhost:3000/recordings
```

### **Step 2: Look for your recording**

You should see your new recording in the table with:
- Title: "Recorded Meeting"
- Platform: Google Meet icon
- Duration: [your recording length]
- Date: Just now

### **Step 3: Click on it**

Click the recording row → Opens detail page → Should show audio player

---

## 🔍 **Method 5: Extension Console Logs**

### **Background Script Console:**

1. Go to: `chrome://extensions/`
2. Find: "Bluenote - Meeting Recorder"
3. Click: "Service worker" (or "Inspect views: background page")
4. Check console for:

```javascript
Uploading recording... 245678 bytes
Upload complete: {
  success: true,
  recording: { id: '...', title: '...' }
}
Recording uploaded successfully
```

### **Offscreen Document Console:**

1. Go to: `chrome://extensions/`
2. Find: "offscreen.html"
3. Click: "Inspect"
4. Check console for:

```javascript
MediaRecorder stopped
Final audio blob: 245678 bytes
Audio sent to background: 245678 bytes
```

---

## ✅ **Expected File Structure**

### **Supabase Storage:**
```
meeting-audios/
  └── [user-id]/
      └── 1728462071670-recording-1728462056789.webm
```

### **Database (`recordings` table):**
```sql
id: uuid
user_id: uuid
title: "Recorded Meeting"
audio_url: "https://...supabase.co/storage/v1/object/public/meeting-audios/..."
recording_url: "https://...supabase.co/storage/v1/object/public/meeting-audios/..."
file_size: 245678
duration: 15
has_audio: true
has_video: false
status: "READY"
created_at: "2025-10-09T07:41:11.670Z"
```

---

## 🐛 **Troubleshooting**

### **Issue: No files in storage**

**Check:**
1. Extension console → Any errors during upload?
2. Backend console → Did it receive the upload request?
3. Supabase dashboard → Does the `meeting-audios` bucket exist?
4. Backend → Check `src/app/api/extension/upload-recording/route.ts` for errors

**Fix:**
```bash
# Make sure storage bucket exists
# Run in Supabase SQL Editor:
SELECT * FROM storage.buckets WHERE name = 'meeting-audios';
```

### **Issue: File in storage but not in database**

**Check:**
- Backend console → Database insert error?
- Recordings table exists?
- RLS policies allow inserts?

**Fix:**
```sql
-- Check if recordings table exists
SELECT * FROM recordings LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'recordings';
```

### **Issue: Recording in database but audio won't play**

**Check:**
1. Test page → Click "▶️ Play" → Any error?
2. Check `audio_url` value → Is it a valid URL?
3. Open URL in browser → Does it download/play?

**Fix:**
- Make sure bucket is **public**
- Check storage policies allow public read access

---

## 🎯 **Quick Health Check**

Run this to verify everything:

1. **Record 10 seconds** of audio with extension
2. **Check backend logs** → Should show "Recording saved successfully"
3. **Open** http://localhost:3000/test-storage
4. **Verify:**
   - ✅ Files in Storage: 1+
   - ✅ Recordings in DB: 1+
   - ✅ Storage and DB in sync
   - ✅ All recordings have audio URLs
5. **Click Play** → Audio should play
6. **Open** /recordings → Recording should appear
7. **Click recording** → Audio player should work

---

## 📊 **What Success Looks Like:**

### **Extension:**
```
🔴 Recording... ⏺️ 0:15
⏹️ Stop Recording
✅ Upload complete! (or similar success message)
```

### **Backend:**
```
Extension upload: { title: '...', fileSize: 245678 }
Recording saved successfully: abc123-uuid
```

### **Test Page:**
```
📁 Files in Storage: 1
💾 Recordings in DB: 1
✅ All checks passed
```

### **/recordings Page:**
```
[Table shows your recording]
Title: Recorded Meeting
Platform: 🎥 Google Meet
Duration: 0:15
```

---

**Open the test page now to verify:** http://localhost:3000/test-storage 🔍




