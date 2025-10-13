# 🆕 Fresh Database Setup - Quick Guide

Complete reset and fresh start with clean tables.

---

## 🚀 **Run These 4 Scripts in Order**

Go to **Supabase Dashboard → SQL Editor** and run these files one by one:

### **1️⃣ Reset Database**
```
File: supabase/1-reset-database.sql
```
⚠️ **This deletes everything!** Make sure you want a fresh start.

**What it does:**
- Drops `meetings` table
- Drops `recordings` table
- Drops `meetings_with_recordings` view
- Clears all data

---

### **2️⃣ Create Meetings Table**
```
File: supabase/2-create-meetings-table.sql
```

**What it does:**
- Creates fresh `meetings` table
- No old columns
- Clean structure for meeting metadata only
- Adds indexes and RLS policies

---

### **3️⃣ Create Recordings Table**
```
File: supabase/3-create-recordings-table.sql
```

**What it does:**
- Creates `recordings` table
- Links to meetings via `meeting_id`
- Stores video/audio URLs
- Adds indexes and RLS policies

---

### **4️⃣ Create View & Sample Data**
```
File: supabase/4-create-view-and-sample-data.sql
```

**What it does:**
- Creates `meetings_with_recordings` view
- Inserts 3 sample meetings
- Inserts 2 sample recordings
- Ready for testing!

---

## 📊 **What You'll Have**

After running all 4 scripts:

### **Tables:**
```
meetings (3 rows)
  ├─ Q4 Planning Session (video)
  ├─ Daily Standup (audio)
  └─ Client Presentation (scheduled, no recording)

recordings (2 rows)
  ├─ Video recording for Q4 Planning
  └─ Audio recording for Daily Standup
```

### **In Your App:**

**Recordings Page** (`/recordings`):
- ✅ Shows 2 recordings
- ✅ "Q4 Planning Session" with video
- ✅ "Daily Standup" with audio
- ❌ "Client Presentation" NOT shown (no recording)

**Calendar Page** (`/calendar`):
- ✅ Shows all 3 meetings (including scheduled)

---

## 🎥 **Add Real Files**

The sample data has placeholder URLs. To make videos/audio playable:

### **Step 1: Upload Your Files**

1. Go to **Supabase Dashboard → Storage**
2. Create buckets (if not exists):
   - `meeting-videos`
   - `meeting-audios`
3. Upload your files
4. Copy the public URLs

### **Step 2: Update Recording URLs**

```sql
-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Update video recording URL
UPDATE recordings
SET recording_url = 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/meeting-videos/YOUR-USER-ID/your-video.mp4'
WHERE file_type = 'VIDEO';

-- Update audio recording URL
UPDATE recordings
SET audio_url = 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/meeting-audios/YOUR-USER-ID/your-audio.mp3'
WHERE file_type = 'AUDIO';
```

---

## ✅ **Verification**

After setup, verify everything works:

```sql
-- Check tables were created
SELECT COUNT(*) FROM meetings;  -- Should return: 3
SELECT COUNT(*) FROM recordings;  -- Should return: 2

-- Check view
SELECT title, recording_id IS NOT NULL as has_recording
FROM meetings_with_recordings
ORDER BY start_time DESC;

-- Check what /recordings page will show
SELECT title, type, has_video, recording_status
FROM meetings_with_recordings
WHERE recording_id IS NOT NULL
  AND recording_status = 'READY';
-- Should return: 2 rows
```

---

## 🧪 **Test in Application**

1. **Visit Recordings Page:**
   ```
   http://localhost:3000/recordings
   ```
   Expected: 2 recordings shown

2. **Visit Calendar Page:**
   ```
   http://localhost:3000/calendar
   ```
   Expected: 3 events shown (including scheduled one)

3. **Click on a Recording:**
   - Opens detail page
   - Video/audio player shows
   - (Will show placeholder until you update URLs with real files)

---

## 📁 **File Structure**

```
supabase/
├─ 1-reset-database.sql          ← Run first (⚠️ deletes all)
├─ 2-create-meetings-table.sql   ← Run second
├─ 3-create-recordings-table.sql ← Run third
└─ 4-create-view-and-sample-data.sql ← Run fourth
```

---

## 🎯 **Summary**

**4 simple steps:**
1. ⚠️ Reset database (delete all)
2. ✅ Create meetings table
3. ✅ Create recordings table
4. ✅ Create view + sample data

**Result:**
- Clean database structure
- 2 test recordings
- Ready to add your own files

---

## 🆘 **Troubleshooting**

**Error: "relation already exists"**
- Run script 1 again to reset

**Error: "no users found"**
- Make sure you're logged into the app
- Check: `SELECT * FROM auth.users;`

**No recordings showing in app:**
- Check: `SELECT * FROM recordings;`
- Make sure `status = 'READY'`
- Hard refresh the page (Ctrl+Shift+R)

---

## 🎬 **Next Steps**

After setup:
1. Upload your actual video/audio files to Storage
2. Update the recording URLs with real file URLs
3. Test playback in the app
4. Add more recordings as needed

**Ready to reset? Run the 4 scripts in order!** 🚀




