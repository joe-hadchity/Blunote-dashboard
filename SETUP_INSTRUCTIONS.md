# 🚀 Complete Setup Instructions - Plan B (Flexible Recordings)

Your database now supports **standalone recordings** (without meetings)!

---

## 📋 **What's Different (Plan B):**

### **Before (Plan A):**
```
Recording MUST have a meeting
```

### **After (Plan B):**
```
Recording CAN have a meeting (optional)
```

**This means you can:**
- ✅ Upload any audio/video file for noise cancellation
- ✅ Process files without creating meetings
- ✅ Optionally link recordings to meetings later
- ✅ Have standalone voice memos, podcasts, etc.

---

## 🔥 **Complete Reset & Setup (5 Scripts)**

Run these **in order** in **Supabase SQL Editor**:

### **1️⃣ Reset Database** ⚠️
```
File: supabase/1-reset-database.sql
```
- Deletes everything
- Fresh start

### **2️⃣ Create Meetings Table**
```
File: supabase/2-create-meetings-table.sql
```
- Clean meetings table
- Meeting metadata only

### **3️⃣ Create Recordings Table** (Updated!)
```
File: supabase/3-create-recordings-table.sql
```
- ✅ `meeting_id` is now **NULLABLE**
- ✅ Added `title` and `description` fields for standalone recordings
- ✅ Can exist without a meeting

### **4️⃣ Create View**
```
File: supabase/4-create-view-and-sample-data.sql
```
- ✅ View updated to handle standalone recordings
- ✅ Uses COALESCE for title/description
- Includes sample data (optional)

### **5️⃣ Insert YOUR Data** (Your actual files!)
```
File: supabase/5-insert-your-data.sql
```
- ✅ Uses your user ID: `e8403df0-339a-4879-95bb-169bca9564d8`
- ✅ Uses your actual video URL (webm file)
- ✅ Uses your actual audio URL (wav file)
- ✅ Two options: with meetings or standalone

---

## 🎯 **Two Ways to Insert Data:**

### **Option 1: Recordings WITH Meetings**

Creates meetings first, then links recordings:

```sql
-- 1. Create meeting
INSERT INTO meetings (...) RETURNING id;

-- 2. Create recording linked to meeting
INSERT INTO recordings (
  meeting_id,  -- ← Link to meeting
  user_id,
  recording_url,
  ...
) VALUES (...);
```

**Result:** Recording appears in both:
- `/recordings` page
- `/calendar` page (as meeting event)

---

### **Option 2: Standalone Recordings** (No Meeting)

Creates recordings directly without meetings:

```sql
-- Just create recording with title
INSERT INTO recordings (
  meeting_id,     -- NULL (no meeting)
  user_id,
  title,          -- ← Recording has its own title
  description,
  recording_url,
  ...
) VALUES (
  NULL,           -- ← No meeting
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'My Audio File',
  'Testing noise cancellation',
  'https://...',
  ...
);
```

**Result:** Recording appears in:
- ✅ `/recordings` page
- ❌ NOT in `/calendar` (no meeting to show)

---

## 📊 **Your Actual Files:**

I've prepared SQL in `supabase/5-insert-your-data.sql` with your URLs:

**Video File:**
- Format: WebM
- Path: `meeting_video_2025-10-07T12-41-12-218Z.webm`
- URL: ✅ Included in script

**Audio File:**
- Format: WAV
- Path: `audnoise.wav`
- URL: ✅ Included in script

---

## ⚡ **Quick Setup (Copy-Paste):**

### **Step 1: Reset**
Run in SQL Editor:
```sql
-- supabase/1-reset-database.sql
```

### **Step 2-4: Create Tables & View**
Run in order:
```sql
-- supabase/2-create-meetings-table.sql
-- supabase/3-create-recordings-table.sql
-- supabase/4-create-view-and-sample-data.sql
```

### **Step 5: Choose Your Approach**

**For Standalone Recordings (Recommended):**
```sql
-- Run the OPTION 2 part from supabase/5-insert-your-data.sql
-- Lines with: meeting_id = NULL
```

**For Meeting-Linked Recordings:**
```sql
-- Run the OPTION 1 part from supabase/5-insert-your-data.sql
-- Creates meetings first, then links recordings
```

**Or do BOTH** to test both types!

---

## 🎬 **What You'll See:**

### **After Running OPTION 2 (Standalone):**

**Recordings Table:**
```
┌──────────────────────────────┬─────────┬─────────────┐
│ Title                        │ Type    │ Has Meeting │
├──────────────────────────────┼─────────┼─────────────┤
│ Test Video Recording         │ VIDEO   │ ❌ No       │
│ Audio Test - Noise Sample    │ AUDIO   │ ❌ No       │
└──────────────────────────────┴─────────┴─────────────┘
```

**Calendar Page:**
- Empty (no meetings linked)

**Recordings Page:**
- ✅ Shows both recordings
- ✅ Can play video/audio
- ✅ Can apply noise cancellation
- ✅ Can create meeting from it later

---

## 🔄 **Flexible Workflow:**

```
Upload File
    ↓
Create Recording (standalone)
    ↓
Process/Clean Audio
    ↓
[Optional] Link to Meeting
    ↓
Shows in Calendar
```

---

## ✅ **Verification:**

After setup, run:

```sql
-- Check recordings
SELECT 
  id,
  title,
  file_type,
  meeting_id IS NULL as is_standalone,
  recording_url IS NOT NULL as has_video,
  audio_url IS NOT NULL as has_audio,
  status
FROM recordings
WHERE user_id = 'e8403df0-339a-4879-95bb-169bca9564d8';

-- Should show: 2 recordings (standalone or with meetings, depending on which option you ran)
```

---

## 🎯 **My Recommendation:**

**Start with STANDALONE recordings** (Option 2) because:

1. ✅ Test your video/audio immediately
2. ✅ No need to create dummy meetings
3. ✅ Focus on noise cancellation (core feature)
4. ✅ Can add meetings later if needed
5. ✅ More flexible for testing

---

## 🚀 **Ready to Run:**

1. Run scripts 1-4 (reset + create tables)
2. Run **OPTION 2** from script 5 (standalone recordings)
3. Visit: `http://localhost:3000/recordings`
4. See your 2 files ready to play! 🎬

**Want me to create a single combined SQL file that does everything at once?** Or are you ready to run the 5 scripts? 🎯



