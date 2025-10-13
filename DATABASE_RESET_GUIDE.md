# 🔄 Database Reset & Fresh Setup Guide

Complete guide to reset your database and start fresh with the new structure.

---

## ⚠️ **WARNING**

This will **DELETE ALL** existing data in:
- `meetings` table
- `recordings` table  
- `meetings_with_recordings` view

**Before proceeding:**
1. Backup any important data
2. Make sure you want a fresh start
3. Have your Google Calendar connection info ready (if you want to reconnect)

---

## 🚀 **Quick Setup (4 Scripts)**

Run these scripts **in order** in Supabase SQL Editor:

### **Script 1: Reset Database**
```bash
File: supabase/1-reset-database.sql
```
- Drops all tables and views
- Clears all data
- Fresh start

### **Script 2: Create Meetings Table**
```bash
File: supabase/2-create-meetings-table.sql
```
- Creates fresh `meetings` table
- Adds indexes and RLS policies
- No old columns (clean structure)

### **Script 3: Create Recordings Table**
```bash
File: supabase/3-create-recordings-table.sql
```
- Creates `recordings` table
- Links to meetings via `meeting_id`
- Adds indexes and RLS policies

### **Script 4: Create View & Sample Data**
```bash
File: supabase/4-create-view-and-sample-data.sql
```
- Creates `meetings_with_recordings` view
- Inserts 3 sample meetings (2 with recordings, 1 scheduled)
- Sample data for testing

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Backup (Optional)**

If you have important data:

```sql
-- Export meetings
SELECT * FROM meetings;
-- Copy to spreadsheet or save as CSV

-- Export google calendar tokens (to reconnect later)
SELECT * FROM google_calendar_tokens;
```

### **Step 2: Run Reset Script**

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy contents of `supabase/1-reset-database.sql`
3. Paste and click **"Run"**
4. ✅ You should see: "Database reset complete"

### **Step 3: Create Meetings Table**

1. Still in **SQL Editor**
2. Copy contents of `supabase/2-create-meetings-table.sql`
3. Paste and click **"Run"**
4. ✅ You should see: "Meetings table created successfully"

### **Step 4: Create Recordings Table**

1. Still in **SQL Editor**
2. Copy contents of `supabase/3-create-recordings-table.sql`
3. Paste and click **"Run"**
4. ✅ You should see: "Recordings table created successfully"

### **Step 5: Create View & Sample Data**

1. Still in **SQL Editor**
2. Copy contents of `supabase/4-create-view-and-sample-data.sql`
3. Paste and click **"Run"**
4. ✅ You should see: "Sample data created"

### **Step 6: Upload Your Files**

Now upload actual files to Supabase Storage:

1. **Go to Storage → meeting-videos**
2. **Upload a video file:**
   - Click "Upload file"
   - Select your video (MP4, WebM, etc.)
   - Click upload
3. **Get the public URL:**
   - Click on uploaded file
   - Copy the URL (looks like: `https://xxx.supabase.co/storage/v1/object/public/meeting-videos/...`)

### **Step 7: Update Recording URLs**

Update the sample recordings with your actual file URLs:

```sql
-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Update recording with your actual video URL
UPDATE recordings
SET recording_url = 'YOUR-ACTUAL-VIDEO-URL-HERE'
WHERE file_type = 'VIDEO'
RETURNING id, meeting_id, recording_url;

-- Update recording with your actual audio URL (optional)
UPDATE recordings
SET audio_url = 'YOUR-ACTUAL-AUDIO-URL-HERE'
WHERE file_type = 'AUDIO'
RETURNING id, meeting_id, audio_url;
```

---

## 🎯 **What You'll Have**

After running all scripts:

### **Tables:**
- ✅ `meetings` - Clean meeting metadata
- ✅ `recordings` - Video/audio files linked to meetings
- ✅ `meetings_with_recordings` - View joining both

### **Sample Data:**
- ✅ Meeting 1: "Q4 Planning Session" (with video recording)
- ✅ Meeting 2: "Daily Standup" (with audio recording)
- ✅ Meeting 3: "Client Presentation" (scheduled, no recording)

### **What Shows in `/recordings` Page:**
- ✅ Only Meeting 1 and Meeting 2 (have recordings)
- ❌ Meeting 3 won't show (no recording yet)

---

## 🧪 **Verification**

After running all scripts, run these queries:

```sql
-- Check meetings table
SELECT COUNT(*) as total_meetings FROM meetings;
-- Should return: 3

-- Check recordings table
SELECT COUNT(*) as total_recordings FROM recordings;
-- Should return: 2

-- Check view
SELECT 
  title, 
  recording_id IS NOT NULL as has_recording,
  file_type,
  recording_status
FROM meetings_with_recordings
ORDER BY start_time DESC;
-- Should return: 3 meetings, 2 with recordings
```

---

## 📱 **Test in Application**

1. **Visit Recordings Page:**
   ```
   http://localhost:3000/recordings
   ```

2. **Expected:**
   - ✅ Shows 2 recordings (Q4 Planning, Daily Standup)
   - ❌ Doesn't show scheduled meeting (no recording)
   - ✅ Search, filter, sort all working

3. **Click on a Recording:**
   - Should open `/meeting/{id}` detail page
   - Video/audio player shows (placeholder until you upload real files)

---

## 🎥 **Add Real Files**

To make recordings playable:

### **Option 1: Update URLs Manually**

```sql
-- Update with your uploaded file URL
UPDATE recordings
SET recording_url = 'https://bxdegqsladfaczeixnmh.supabase.co/storage/v1/object/public/meeting-videos/YOUR-USER-ID/your-video.mp4'
WHERE file_type = 'VIDEO';
```

### **Option 2: Use Test Upload Page**

```
http://localhost:3000/test-upload
```
- Upload files via UI
- Creates meeting + recording automatically

---

## 🔧 **Customize Sample Data**

Edit `supabase/4-create-view-and-sample-data.sql` to:
- Change meeting titles
- Modify dates
- Add more participants
- Adjust topics
- Add AI summaries (optional)

---

## 📊 **New Database Structure**

```
┌──────────────────┐         ┌────────────────────┐
│   meetings       │         │   recordings       │
├──────────────────┤         ├────────────────────┤
│ id (PK)          │◄────────│ meeting_id (FK)    │
│ user_id          │         │ user_id            │
│ title            │         │ recording_url      │
│ description      │         │ audio_url          │
│ start_time       │         │ transcript_url     │
│ end_time         │         │ file_type          │
│ duration         │         │ file_size          │
│ platform         │         │ format             │
│ status           │         │ status             │
│ participants     │         │ has_video          │
│ topics           │         │ has_audio          │
│ is_favorite      │         │ has_transcript     │
│ synced_from_google│        │ duration (seconds) │
└──────────────────┘         └────────────────────┘
```

---

## ✅ **Benefits of New Structure**

1. **Clean Separation**: Meetings vs Files
2. **Flexible**: One meeting can have multiple recordings
3. **Better Tracking**: Upload status, processing status
4. **Future-Ready**: Easy to add transcription, AI processing
5. **No Duplicates**: Clear what's a meeting vs what's a recording

---

## 🎬 **Ready to Reset?**

Run the 4 scripts in order, upload your files, update the URLs, and you're done! 🚀

**Questions? Check the verification queries or ask for help!**




