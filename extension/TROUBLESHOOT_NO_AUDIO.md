# 🔍 Troubleshooting: No Audio in Recordings

## 🎯 **Quick Test First**

### **Step 1: Run the debug tool**
```
http://localhost:3000/debug-audio
```

Click **"Test Latest Recording"**

This will tell you exactly what's wrong:
- ❌ File is empty (0 bytes) → Recording not capturing audio
- ❌ 403 error → Bucket is still private
- ❌ 404 error → File doesn't exist
- ❌ File exists but won't play → Corrupted or wrong format
- ✅ File is good → Something else is wrong

---

## 📊 **Problem 1: File is Empty (0 bytes)**

### **This means: Audio is not being captured**

### **Check Extension Logs:**

#### **1. Open Offscreen Console:**
```
1. Go to: chrome://extensions/
2. Find: "offscreen.html"
3. Click: "Inspect"
4. Go to Console tab
```

#### **2. Start a recording and look for:**

**✅ GOOD (audio is being captured):**
```javascript
Audio stream obtained: 1 audio tracks
MediaRecorder started
Tab 12345 - Audio chunk: 15234 bytes, total: 1
Tab 12345 - Audio chunk: 14567 bytes, total: 2
Tab 12345 - Audio chunk: 16234 bytes, total: 3
... (many chunks)
Tab 12345 - Final audio blob: 150000 bytes
```

**❌ BAD (no audio):**
```javascript
Audio stream obtained: 1 audio tracks
MediaRecorder started
Tab 12345 - MediaRecorder stopped
Tab 12345 - Final audio blob: 0 bytes  ← EMPTY!
```

**❌ BAD (very small chunks):**
```javascript
Tab 12345 - Audio chunk: 12 bytes, total: 1
Tab 12345 - Audio chunk: 8 bytes, total: 2
Tab 12345 - Final audio blob: 54 bytes  ← TOO SMALL!
```

### **Fixes:**

#### **Fix 1: Make sure you're on a Google Meet call**
- The extension captures **tab audio**, not your microphone
- You need to be in an **active meeting** with other people talking
- Or play a YouTube video in the same tab to test

#### **Fix 2: Check tab audio is actually playing**
- Right-click on the Google Meet tab
- You should see a speaker icon 🔊 if audio is playing
- If no icon → no audio → nothing to record!

#### **Fix 3: Grant tab audio permissions**
```
1. Go to the Google Meet tab
2. Look for a microphone icon in address bar
3. Make sure "Tab audio" is allowed
4. Reload the page and try again
```

#### **Fix 4: Test with a YouTube video**
```
1. Open: https://www.youtube.com/watch?v=dQw4w9WgXcQ
2. Play the video (unmuted!)
3. Click extension icon
4. Start recording
5. Let it record for 10 seconds
6. Stop recording
7. Check if file has content
```

---

## 📊 **Problem 2: Permission Denied (403)**

### **This means: Bucket is still private**

### **Fix:**

Open Supabase SQL Editor and run:

```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'meeting-audios';

-- Add public read policy
CREATE POLICY "Public can view audios"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-audios');
```

Then test again at: http://localhost:3000/debug-audio

---

## 📊 **Problem 3: File Not Found (404)**

### **This means: Upload failed**

### **Check Backend Logs:**

Look at your terminal where `npm run dev` is running:

**✅ GOOD:**
```
Extension upload: { title: '...', fileSize: 150000 }
Recording saved successfully: abc-123-uuid
```

**❌ BAD:**
```
Storage upload error: [some error]
Database insert error: [some error]
```

### **Fixes:**

- Check `.env.local` has correct Supabase credentials
- Check storage bucket exists
- Check RLS policies allow uploads
- Check extension console for upload errors

---

## 📊 **Problem 4: File Exists But Won't Play**

### **This means: File might be corrupted**

### **Test:**

1. Go to: http://localhost:3000/debug-audio
2. Click "Test Latest Recording"
3. Click "📥 Download File"
4. Open the file in **VLC Media Player** or **Windows Media Player**
5. Does it play there?

**If YES:** Browser compatibility issue
- Try a different browser (Chrome/Firefox/Edge)
- Check browser console for errors

**If NO:** File is corrupted
- Recording process is broken
- Check offscreen console logs
- The MediaRecorder might be failing

---

## 🔬 **Deep Debugging**

### **Check 1: Verify stream is active**

Add this to `extension/offscreen.js` after line 58:

```javascript
console.log('Audio stream obtained:', stream.getAudioTracks().length, 'audio tracks');

// ADD THIS:
stream.getAudioTracks().forEach(track => {
  console.log('Track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
});
```

Reload extension and record again. Check console.

**Expected:**
```javascript
Track: Tab audio enabled: true muted: false readyState: live
```

**Bad:**
```javascript
Track: Tab audio enabled: false muted: true readyState: ended
```

### **Check 2: Verify MediaRecorder is supported**

Add this before line 67 in `extension/offscreen.js`:

```javascript
console.log('Supported MIME types:');
console.log('audio/webm:', MediaRecorder.isTypeSupported('audio/webm'));
console.log('audio/webm;codecs=opus:', MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
console.log('audio/ogg:', MediaRecorder.isTypeSupported('audio/ogg'));
```

Should show at least one `true`.

### **Check 3: Monitor recording state**

Add this after line 70 in `extension/offscreen.js`:

```javascript
mediaRecorder.onstart = () => {
  console.log(`Tab ${tabId} - Recording STARTED, state:`, mediaRecorder.state);
};

mediaRecorder.onpause = () => {
  console.log(`Tab ${tabId} - Recording PAUSED`);
};

mediaRecorder.onresume = () => {
  console.log(`Tab ${tabId} - Recording RESUMED`);
};
```

Should see: `Recording STARTED, state: recording`

---

## ✅ **Expected Full Flow**

### **When everything works correctly:**

#### **Popup Console:**
```javascript
Got stream ID: xyz123...
```

#### **Background Console:**
```javascript
Using stream ID: xyz123... for tab: 12345
Offscreen document created (or reusing existing)
Recording started successfully
```

#### **Offscreen Console:**
```javascript
Starting offscreen recording with stream ID: xyz123... for tab: 12345
Audio stream obtained: 1 audio tracks
Track: Tab audio enabled: true muted: false readyState: live
MediaRecorder started, state: recording

Tab 12345 - Audio chunk: 15234 bytes, total: 1
Tab 12345 - Audio chunk: 16789 bytes, total: 2
Tab 12345 - Audio chunk: 14234 bytes, total: 3
... (every second for duration of recording)

Tab 12345 - MediaRecorder stopped
Tab 12345 - Final audio blob: 150000 bytes  ← Should be >1000
Audio sent to background: 150000 bytes
```

#### **Background Console (after stop):**
```javascript
Handling recording completion for tab: 12345, size: 150000
Reconstructed audio blob: 150000 bytes
Uploading recording... 150000 bytes
Upload successful: { success: true, recording: {...} }
Recording uploaded successfully
```

#### **Backend Console:**
```javascript
Extension upload: {
  title: 'Recorded Meeting',
  platform: 'GOOGLE_MEET',
  duration: 15,
  fileSize: 150000,
  fileName: 'recording-123456789.webm'
}
Recording saved successfully: uuid-here
```

---

## 🎯 **Most Common Issues & Fixes**

| Issue | Cause | Fix |
|-------|-------|-----|
| 0 byte files | No tab audio | Make sure meeting has active audio |
| 403 errors | Private bucket | Run SQL to make bucket public |
| Empty chunks | Wrong permissions | Check tab audio capture permissions |
| Corrupted files | MediaRecorder issue | Try different Chrome version |
| Upload fails | Backend error | Check Supabase credentials |

---

## 🚀 **Quick Checklist**

- [ ] Run: http://localhost:3000/debug-audio
- [ ] File size > 1000 bytes?
- [ ] HTTP status = 200?
- [ ] Content-Type = audio/webm?
- [ ] Can download and play in VLC?
- [ ] Offscreen console shows audio chunks?
- [ ] Background console shows upload success?
- [ ] Backend console shows save success?

If all ✅ but still doesn't play in browser:
- Try different browser
- Check browser console errors
- Test with headphones/speakers

---

**Start with the debug tool:** http://localhost:3000/debug-audio 🔍




