# 🎤 Speaker Diarization - Complete Implementation

## ✅ **What I've Built**

Your transcriptions now automatically **identify different speakers**! The transcript will show who said what.

---

## 🎯 **What is Speaker Diarization?**

**Speaker diarization** = Detecting "who spoke when" in an audio recording

### **Example Output:**

**Without diarization (old):**
```
Hello everyone. Welcome to the meeting. 
Let's start with the Q4 roadmap.
```

**With diarization (new):**
```
Speaker 1: Hello everyone. Welcome to the meeting.
Speaker 2: Thanks for having me.
Speaker 1: Let's start with the Q4 roadmap.
Speaker 3: I have some thoughts on that.
```

---

## 🔧 **How It Works**

### **Azure Speech with Speaker Diarization:**

1. **Analyzes voice patterns**
   - Pitch, tone, cadence
   - Unique vocal characteristics

2. **Groups similar voices**
   - Speaker 1 = All segments from voice A
   - Speaker 2 = All segments from voice B  
   - Speaker 3 = All segments from voice C

3. **Labels each segment**
   - Each phrase tagged with speaker number
   - Consecutive phrases from same speaker grouped

---

## 📊 **What Gets Saved**

### **Database Fields:**

```sql
transcript_text TEXT          -- Formatted: "Speaker 1: Hello..."
transcript_segments JSONB     -- Array of speaker segments
speaker_count INTEGER         -- Number of speakers (2, 3, 4, etc.)
transcript_words JSONB        -- Word-level data with speaker IDs
```

### **Example Data:**

```json
{
  "transcript_segments": [
    {
      "speaker": 1,
      "text": "Hello everyone, welcome to the meeting.",
      "startTime": 100,
      "endTime": 3500,
      "words": [...]
    },
    {
      "speaker": 2,
      "text": "Thanks for having me.",
      "startTime": 4000,
      "endTime": 5500,
      "words": [...]
    }
  ],
  "speaker_count": 2
}
```

---

## 🎨 **UI Display**

### **Recording Page Shows:**

```
┌──────────────────────────────────────────┐
│ TRANSCRIPT              2 speakers       │
├──────────────────────────────────────────┤
│ [Speaker 1] Hello everyone, welcome to   │
│             the meeting. Today we'll     │
│             discuss the Q4 roadmap.      │
│                                          │
│ [Speaker 2] Thanks for having me.        │
│             I'm excited to share my      │
│             thoughts on the roadmap.     │
│                                          │
│ [Speaker 1] Great! Let's start with      │
│             the timeline.                │
└──────────────────────────────────────────┘
```

**Features:**
- ✅ Speaker labels (Speaker 1, Speaker 2, etc.)
- ✅ Color-coded badges
- ✅ Grouped by speaker turns
- ✅ Shows total speaker count
- ✅ Clean, readable format

---

## 📋 **Files Modified**

1. ✅ **`src/lib/azure-speech.ts`**
   - Added speaker diarization
   - Uses ConversationTranscriber API
   - Saves speaker segments

2. ✅ **`supabase/add-transcript-fields.sql`**
   - Added `transcript_segments` column
   - Added `speaker_count` column

3. ✅ **`src/app/api/recordings/[id]/route.ts`**
   - Returns speaker data

4. ✅ **`src/app/(admin)/(others-pages)/recording/[id]/page.tsx`**
   - Displays transcript with speaker labels
   - Shows speaker count

---

## 🎯 **Setup Steps**

### **Step 1: Get Azure Credentials**

1. Go to: https://portal.azure.com
2. Create "Speech Services" resource
3. **Important:** Choose **Standard (S0)** tier for speaker diarization
   - F0 (Free) tier **does NOT support** speaker diarization
   - S0 costs $1/hour but much more accurate
4. Copy KEY and REGION

### **Step 2: Add to .env.local**

```bash
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=eastus
```

### **Step 3: Run Database Migration**

Open Supabase SQL Editor and run:
```sql
-- From supabase/add-transcript-fields.sql
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_words JSONB;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS transcript_segments JSONB;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS speaker_count INTEGER DEFAULT 0;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS error_message TEXT;
```

### **Step 4: Restart Server**

```bash
npm run dev
```

---

## 🧪 **Test It**

### **Record a Multi-Speaker Meeting:**

1. **Join Google Meet with 2+ people**
2. **Have a conversation** (each person speaks)
3. **Use extension to record**
4. **Stop recording**

### **Check Backend Logs:**

```
Expected output:
Conversation transcription started (with speaker diarization)
[Speaker Guest-1] Hello everyone
[Speaker Guest-2] Thanks for having me  
[Speaker Guest-1] Let's start
Transcription completed: 45 words, 2 speakers
Transcript saved (2 speakers detected)
```

### **View Recording Page:**

```
http://localhost:3000/recording/[id]
```

**Should show:**
```
TRANSCRIPT                    2 speakers detected

[Speaker 1] Hello everyone, welcome to the meeting.
            Today we'll discuss the Q4 roadmap.

[Speaker 2] Thanks for having me. I'm excited to 
            share my thoughts.

[Speaker 1] Great! Let's start with the timeline.
```

---

## 💰 **Pricing Update**

### **⚠️ Important: Speaker Diarization Requires S0 Tier**

**Free Tier (F0):**
- ❌ **Does NOT support** speaker diarization
- Only basic transcription

**Standard Tier (S0):**
- ✅ **Supports** speaker diarization
- ✅ Better accuracy
- **Cost:** $1 per audio hour

**Estimate:**
- 100 meetings × 5 minutes = 8.3 hours/month
- **$8.30/month** for full speaker identification

**Worth it?** ✅ Yes! Knowing who said what is invaluable for meeting notes.

---

## 🎯 **Features**

### **What You Get:**

✅ **Automatic speaker detection** - No manual tagging needed  
✅ **Unlimited speakers** - Works with 2, 3, 5, 10+ people  
✅ **High accuracy** - Azure's industry-leading AI  
✅ **Word-level speaker tags** - Know which speaker said each word  
✅ **Organized segments** - Grouped by speaker turns  
✅ **Speaker count** - Total number of unique speakers  

### **Limitations:**

⚠️ **Anonymous speakers** - Labels are "Speaker 1, 2, 3" (not names)
- Future: Add manual labeling (rename Speaker 1 → "John Smith")

⚠️ **Requires S0 tier** - Free tier doesn't support this
- But it's only $1/hour - very affordable!

⚠️ **Best with 2-10 speakers** - Works with more but accuracy decreases

---

## 🎨 **Speaker Label Colors**

Each speaker gets a different colored badge:

```
[Speaker 1] → Blue badge
[Speaker 2] → Green badge  
[Speaker 3] → Purple badge
[Speaker 4] → Orange badge
```

(Can be customized in the UI component)

---

## 📈 **Accuracy Factors**

### **Better Accuracy:**
✅ Clear audio (no background noise)
✅ Speakers have distinct voices
✅ Speakers don't talk over each other
✅ Good microphone quality
✅ Longer audio samples (>1 minute per speaker)

### **Lower Accuracy:**
❌ Noisy background
❌ Similar sounding voices
❌ People interrupting each other
❌ Very short utterances (<3 seconds)
❌ Poor audio quality

---

## 🔍 **Debugging**

### **Check if speaker diarization is working:**

**Backend logs should show:**
```javascript
[Speaker Guest-1] Hello everyone  ← Has speaker ID!
[Speaker Guest-2] Thanks           ← Different speaker!
Transcription completed: 45 words, 2 speakers  ← Count!
```

**If you see:**
```javascript
[Speaker Unknown] Hello everyone  ← No speaker detection
Transcription completed: 45 words, 0 speakers  ← Failed!
```

**Then:**
1. Check if you're using S0 tier (not F0)
2. Check Azure portal → Resource → Pricing tier
3. Upgrade if needed

---

## 🚀 **Future Enhancements**

### **Coming Soon:**

1. **Speaker Naming**
   ```
   Speaker 1 → "John Smith" (CEO)
   Speaker 2 → "Sarah Johnson" (CTO)
   ```

2. **Speaker Statistics**
   ```
   Speaker 1: 45% talk time
   Speaker 2: 30% talk time
   Speaker 3: 25% talk time
   ```

3. **Color-coded Speakers**
   - Each speaker has unique color
   - Easier visual scanning

4. **Search by Speaker**
   ```
   "Show me everything Speaker 2 said"
   ```

5. **Export with Speakers**
   - PDF with speaker labels
   - SRT subtitles with speaker tags

---

## ✅ **Summary**

You now have:
- ✅ Automatic speaker detection
- ✅ Speaker-organized transcript
- ✅ Word-level speaker tags
- ✅ Speaker count tracking
- ✅ Clean UI display
- ✅ Private storage with signed URLs

**Transcript format:**
```
Speaker 1: [their words]
Speaker 2: [their words]
Speaker 1: [more words]
```

---

## 🎯 **Quick Setup Checklist**

- [ ] Create Azure Speech resource (S0 tier, not F0!)
- [ ] Copy KEY and REGION
- [ ] Add to .env.local
- [ ] Run database migration (add-transcript-fields.sql)
- [ ] Restart server (npm run dev)
- [ ] Record multi-speaker meeting
- [ ] Check transcript shows speaker labels
- [ ] Verify speaker count is correct

---

## 💡 **Pro Tips**

### **Best Practices:**

1. **Test with known audio first**
   - Record yourself talking
   - Have a friend join
   - Check if 2 speakers detected

2. **Use good audio**
   - Encourage participants to use headphones
   - Reduce background noise
   - One person talks at a time

3. **Monitor logs**
   - Check backend for speaker count
   - Should match actual participants

4. **Start small**
   - Test with 2 people first
   - Then try 3-4 people
   - Ensure accuracy before scaling

---

**Add your Azure credentials (S0 tier) and test with a 2-person meeting!** 🎤

The transcript will automatically show who said what! 🎉




