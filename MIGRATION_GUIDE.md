# 🔄 Database Migration Guide - Recordings Table

This guide explains the new database structure and how to migrate.

---

## 🎯 **What Changed**

### **Before (Old Structure):**
```
meetings
├─ id
├─ title
├─ recording_url  ← Mixed with meeting data
├─ audio_url
├─ has_video
└─ ...
```

### **After (New Structure):**
```
meetings                recordings
├─ id         ─────────  ├─ id
├─ title                 ├─ meeting_id (FK)
├─ description           ├─ recording_url
└─ ...                   ├─ audio_url
                         ├─ has_video
                         ├─ status
                         └─ ...
```

---

## ✅ **Benefits of New Structure**

1. **Separation of Concerns**: Meeting metadata separate from file data
2. **Multiple Recordings**: One meeting can have multiple recordings
3. **Better Tracking**: Track upload/processing status per recording
4. **Cleaner Queries**: Filter meetings vs filter recordings separately
5. **Future-Proof**: Easy to add features like:
   - Multiple file formats per meeting
   - Recording versions/revisions
   - Processing status tracking
   - File size limits

---

## 🚀 **Migration Steps**

### **Step 1: Run the Migration SQL**

```bash
# In Supabase Dashboard → SQL Editor
# Run: supabase/create-recordings-table.sql
```

This will:
- ✅ Create `recordings` table
- ✅ Migrate existing data from `meetings` table
- ✅ Create indexes and RLS policies
- ✅ Create `meetings_with_recordings` view for easy querying

### **Step 2: Verify Migration**

```sql
-- Check if data was migrated
SELECT COUNT(*) FROM recordings;

-- View meetings with their recordings
SELECT * FROM meetings_with_recordings LIMIT 5;

-- Check for meetings without recordings
SELECT m.id, m.title
FROM meetings m
LEFT JOIN recordings r ON m.id = r.meeting_id
WHERE r.id IS NULL;
```

### **Step 3: Update Your Application**

The API has been updated to:
- Query `meetings_with_recordings` view
- Join meetings with recordings automatically
- Return recording data in the same format

**No frontend changes needed!** The API returns the same structure.

---

## 📊 **New Database Schema**

### **recordings table:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `meeting_id` | UUID | Foreign key to meetings |
| `user_id` | UUID | Owner of recording |
| `recording_url` | TEXT | Video/audio file URL |
| `audio_url` | TEXT | Separate audio file |
| `transcript_url` | TEXT | Transcript file |
| `file_type` | VARCHAR | 'VIDEO' or 'AUDIO' |
| `file_size` | BIGINT | Size in bytes |
| `duration` | INTEGER | Duration in seconds |
| `format` | VARCHAR | mp4, wav, etc. |
| `status` | VARCHAR | Upload/processing status |
| `has_video` | BOOLEAN | Has video track |
| `has_audio` | BOOLEAN | Has audio track |
| `has_transcript` | BOOLEAN | Has transcript |
| `transcription_status` | VARCHAR | AI processing status |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Updated timestamp |

---

## 🔍 **New Query Patterns**

### **Get Meeting with Recording:**
```sql
-- Option 1: Use the view (easiest)
SELECT * FROM meetings_with_recordings
WHERE user_id = 'xxx'
  AND recording_url IS NOT NULL;

-- Option 2: Manual join
SELECT 
  m.*,
  r.recording_url,
  r.audio_url,
  r.has_video,
  r.status
FROM meetings m
INNER JOIN recordings r ON m.id = r.meeting_id
WHERE m.user_id = 'xxx';
```

### **Filter by Recording Status:**
```sql
SELECT * FROM meetings_with_recordings
WHERE user_id = 'xxx'
  AND recording_status = 'READY';
```

### **Get Only Meetings with Recordings:**
```sql
SELECT * FROM meetings_with_recordings
WHERE user_id = 'xxx'
  AND recording_id IS NOT NULL;
```

---

## 📝 **Inserting New Recordings**

### **Method 1: Quick Insert (Recommended)**

See `INSERT_RECORDING.sql` for templates.

### **Method 2: Via Application**

The app will handle this automatically when you upload files.

---

## 🧹 **Cleanup (After Testing)**

Once you've verified everything works:

```sql
-- OPTIONAL: Remove old columns from meetings table
ALTER TABLE meetings DROP COLUMN IF EXISTS recording_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS audio_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS transcript_url;
ALTER TABLE meetings DROP COLUMN IF EXISTS has_video;
ALTER TABLE meetings DROP COLUMN IF EXISTS has_transcript;
```

**⚠️ Warning:** Only run this after thorough testing!

---

## 🔄 **Backward Compatibility**

The `meetings_with_recordings` view ensures backward compatibility:

- Frontend queries work the same
- Data structure returned is similar
- No breaking changes to existing code

---

## 🎬 **Example Workflow**

### **Creating a Recorded Meeting:**

```sql
-- 1. Create meeting
INSERT INTO meetings (user_id, title, ...) 
VALUES (...) 
RETURNING id;

-- 2. Upload file to Supabase Storage

-- 3. Create recording entry
INSERT INTO recordings (meeting_id, recording_url, ...)
VALUES (...);

-- 4. Query combined data
SELECT * FROM meetings_with_recordings
WHERE id = 'meeting-id';
```

---

## ✅ **Verification Checklist**

- [ ] `recordings` table created
- [ ] Data migrated from `meetings` table
- [ ] Indexes and RLS policies in place
- [ ] `meetings_with_recordings` view working
- [ ] Can query meetings with recordings
- [ ] Can insert new recordings
- [ ] API returns correct data
- [ ] Frontend displays recordings correctly

---

## 🆘 **Troubleshooting**

### **No recordings showing?**
```sql
-- Check if data was migrated
SELECT COUNT(*) FROM recordings;

-- Check if recordings are linked
SELECT 
  m.id,
  m.title,
  r.id as recording_id
FROM meetings m
LEFT JOIN recordings r ON m.id = r.meeting_id
LIMIT 10;
```

### **Permission errors?**
```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'recordings';

-- Test policy
SELECT * FROM recordings WHERE user_id = auth.uid();
```

---

## 📚 **Next Steps**

After migration:
1. Test uploading new videos/audio
2. Test viewing recordings in meetings detail page
3. Verify recordings appear in meetings table
4. Consider adding:
   - Automatic transcription
   - File compression
   - Multiple recording versions
   - Processing status tracking

---

**Questions? Check the SQL files or ask for help!** 🚀




