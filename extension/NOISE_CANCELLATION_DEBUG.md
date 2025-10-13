# 🔍 Noise Cancellation Debug Guide

## 🧪 How to Debug Empty Recordings

### Step 1: Open Extension Console

**Offscreen Console:**
```
1. chrome://extensions
2. Find "Bluenote"
3. Click "Inspect views: offscreen"
4. Keep this console open
```

**Background Console:**
```
1. chrome://extensions
2. Find "Bluenote"
3. Click "Inspect views: service worker"
4. Keep this console open
```

---

### Step 2: Start Recording and Monitor

Start a recording and watch for these specific messages:

#### ✅ WORKING (What You Want to See):

**Offscreen Console:**
```
🎙️ Starting recording with noise cancellation for tab: 123
✅ Audio stream obtained: 1 audio tracks
🔧 Setting up audio processing pipeline...
✅ AudioContext resumed from suspended state
✅ Clean stream tracks: 1
🎉 Audio processing active! Recording enhanced audio...
✅ Tab 123 - Recording started 🎙️ WITH NOISE CANCELLATION

Tab 123 [CLEAN] - Audio chunk: 12543 bytes, total chunks: 1
Tab 123 [CLEAN] - Audio chunk: 13421 bytes, total chunks: 2
Tab 123 [CLEAN] - Audio chunk: 11987 bytes, total chunks: 3
... (should get chunks every second)

Tab 123 - MediaRecorder stopped
Tab 123 - Total audio chunks collected: 30
Tab 123 - Final audio 🎙️ Clean (NC): 387654 bytes from 30 chunks
```

#### ❌ PROBLEM (Empty Recordings):

**Scenario A - No Audio Chunks:**
```
✅ Audio stream obtained: 1 audio tracks
🎉 Audio processing active!
✅ Recording started

(No chunk messages!)

MediaRecorder stopped
Total audio chunks collected: 0  ❌ PROBLEM!
Final audio: 0 bytes  ❌ EMPTY!
```

**Scenario B - Empty Chunks:**
```
✅ Recording started
Tab 123 - Audio chunk: 0 bytes  ❌ PROBLEM!
Tab 123 - Audio chunk: 0 bytes  ❌ PROBLEM!
Final audio: 0 bytes  ❌ EMPTY!
```

**Scenario C - Audio Context Failed:**
```
✅ Audio stream obtained
⚠️ Audio processing setup failed: [error message]
⚠️ Using original audio

(Then should fall back and work)
```

---

### Step 3: Check Audio Track State

Add this temporary debugging code to see track state:

**In offscreen.js, after getting the stream, add:**

```javascript
const stream = await navigator.mediaDevices.getUserMedia({...});

// DEBUG: Check track state
const tracks = stream.getAudioTracks();
tracks.forEach((track, i) => {
  console.log(`Track ${i}:`, {
    kind: track.kind,
    enabled: track.enabled,
    muted: track.muted,
    readyState: track.readyState,
    label: track.label
  });
});
```

**Expected output:**
```
Track 0: {
  kind: "audio",
  enabled: true,
  muted: false,  ✅ NOT muted!
  readyState: "live",  ✅ LIVE!
  label: "Tab audio"
}
```

**If muted or not live:**
```
Track 0: {
  enabled: false,  ❌ DISABLED!
  muted: true,     ❌ MUTED!
  readyState: "ended"  ❌ ENDED!
}
```
This means the stream is dead or muted!

---

## 🔧 Quick Fixes

### Fix 1: Disable Noise Cancellation (Test if basic recording works)

In `extension/offscreen.js`, around line 73, replace the entire try/catch with:

```javascript
// TEMPORARY: Disable noise cancellation to test
console.log('⚠️ Noise cancellation temporarily disabled');
finalStream = stream;
audioContext = null;
cleanStream = null;
noiseCancellationAvailable = false;
```

Reload extension and test. If recordings work:
- ✅ Basic recording is fine
- ❌ Issue is in the noise cancellation pipeline

---

### Fix 2: Simpler Audio Pipeline

If Fix 1 works, try this simpler pipeline:

```javascript
try {
  audioContext = new AudioContext();
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  const source = audioContext.createMediaStreamSource(stream);
  const destination = audioContext.createMediaStreamDestination();
  
  // Direct connection (no processing)
  source.connect(destination);
  
  cleanStream = destination.stream;
  
  // Check if stream has tracks
  if (cleanStream.getAudioTracks().length > 0) {
    finalStream = cleanStream;
    console.log('✅ Audio pipeline active (pass-through)');
  } else {
    finalStream = stream;
    audioContext.close();
  }
} catch (error) {
  console.warn('Fallback to original:', error.message);
  finalStream = stream;
}
```

This tests if the Web Audio API pipeline itself works.

---

### Fix 3: Check MediaRecorder State

Add logging to MediaRecorder:

```javascript
const mediaRecorder = new MediaRecorder(finalStream, {
  mimeType: mimeType,
  audioBitsPerSecond: 128000
});

console.log('MediaRecorder created:', {
  state: mediaRecorder.state,
  mimeType: mediaRecorder.mimeType,
  stream: finalStream.id,
  tracks: finalStream.getAudioTracks().length
});

mediaRecorder.onstart = () => {
  console.log('✅ MediaRecorder STARTED');
};

mediaRecorder.ondataavailable = (event) => {
  console.log('📼 Data available:', event.data.size, 'bytes');
  // ... rest of code
};
```

---

## 📞 Share These With Me

If still having issues, share:

1. **Complete console output** from offscreen console
2. **Audio chunk sizes** (are they 0 or > 0?)
3. **Total chunks collected** (is it 0 or > 0?)
4. **Final blob size** (is it 0 or > 0?)
5. **Any error messages** (red text in console)

---

## ✅ Expected Behavior

**For 30 second recording:**
- Chunks collected: ~30 chunks
- Chunk size: ~10,000-15,000 bytes each
- Final blob: ~300,000-500,000 bytes (300-500 KB)

**If you see:**
- 0 chunks → MediaRecorder not receiving audio
- 0 bytes per chunk → Stream has no audio data
- 0 byte final blob → Recording is empty

---

**Try the fixes I applied and reload the extension. Then share the console output!** 🔍

