# 🔧 Fix Empty Recordings - Troubleshooting Guide

## ⚠️ Issue: Recordings Are Empty

If your recordings are coming out empty after adding noise cancellation, here's how to fix it:

---

## 🚀 Quick Fix (Option 1): Disable Noise Cancellation Temporarily

### Update `extension/offscreen.js`

Find this section around line 73:

```javascript
try {
  console.log('🔧 Setting up audio processing pipeline...');
  // ... noise cancellation code ...
} catch (ncError) {
  // Fall back to original stream
}
```

**Replace the ENTIRE try/catch block with:**

```javascript
// TEMPORARY: Skip noise cancellation to fix empty recordings
console.log('⚠️ Noise cancellation disabled - using original audio');
finalStream = stream;
noiseCancellationAvailable = false;
audioContext = null;
cleanStream = null;
```

This will record audio WITHOUT noise cancellation, ensuring recordings work.

---

## 🔍 Debug Steps

### Step 1: Check Offscreen Console

1. Go to: `chrome://extensions`
2. Find "Bluenote"
3. Click "Inspect views: offscreen"
4. Start a recording
5. Look for errors

**What to look for:**
```
❌ BAD (means issue):
Error: Failed to create MediaStreamDestination
Error: AudioContext suspended
Error: No audio tracks in stream

✅ GOOD (means working):
✅ Audio stream obtained: 1 audio tracks
Tab 123 [CLEAN] - Audio chunk: 12345 bytes (not 0!)
Final audio blob: 54321 bytes (not 0!)
```

### Step 2: Check Audio Chunks

In the console, look for:
```
Tab 123 - Audio chunk: XXXX bytes
```

**If size is 0 or missing:**
- Audio is not being captured
- MediaRecorder is not receiving audio
- Stream might be stopped or empty

**If size is > 0:**
- Audio IS being captured
- Issue might be in upload

### Step 3: Check Audio Blob Size

Look for:
```
Tab 123 - Final audio blob: XXXX bytes
```

**Should be:**
- ~500 KB for 30 seconds
- ~1 MB for 1 minute
- ~5 MB for 5 minutes

**If 0 bytes:**
- MediaRecorder received no audio
- Stream was empty

---

## 🛠️ Solution 1: Simplified Audio Pipeline

Replace the noise cancellation section in `extension/offscreen.js` with this simpler version:

```javascript
// Try to apply basic audio enhancement (simpler version)
let finalStream = stream;
let audioContext = null;
let cleanStream = null;

try {
  console.log('🔧 Setting up basic audio enhancement...');
  
  // Create audio context
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  
  // Just add a simple gain node (no complex processing)
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0; // No change, just pass through
  
  // Create destination
  const destination = audioContext.createMediaStreamDestination();
  
  // Simple pipeline: source → gain → destination
  source.connect(gainNode);
  gainNode.connect(destination);
  
  cleanStream = destination.stream;
  finalStream = cleanStream;
  noiseCancellationAvailable = false; // Mark as no NC for now
  
  console.log('✅ Audio pipeline ready (pass-through mode)');
  
} catch (error) {
  console.warn('⚠️ Using original audio stream:', error.message);
  finalStream = stream;
  noiseCancellationAvailable = false;
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
```

This just passes audio through Web Audio API without any processing, to test if the pipeline itself works.

---

## 🛠️ Solution 2: Complete Bypass (Most Reliable)

Replace the entire noise cancellation section (lines 67-133) with:

```javascript
// BYPASS: Use original stream directly (no processing)
finalStream = stream;
audioContext = null;
cleanStream = null;
noiseCancellationAvailable = false;
console.log('📼 Using original audio stream (no processing)');
```

This ensures recordings work 100%, then we can add NC back gradually.

---

## 🔍 Root Cause Analysis

### Possible Issues:

1. **AudioContext Suspended**
   - Chrome suspends AudioContext by default
   - Need to resume it: `await audioContext.resume()`

2. **MediaStreamDestination No Tracks**
   - Destination stream might not have tracks
   - Check: `destination.stream.getAudioTracks().length`

3. **Stream Stopped Too Early**
   - Original stream stopped before recording finishes
   - Need to keep original stream alive

4. **CORS or Security Issue**
   - AudioWorklet might be blocked
   - Tab capture might have restrictions

---

## ✅ Solution 3: Fix AudioContext Suspended Issue

Add this after creating AudioContext:

```javascript
audioContext = new AudioContext({ sampleRate: 48000 });

// IMPORTANT: Resume audio context (might be suspended)
if (audioContext.state === 'suspended') {
  await audioContext.resume();
  console.log('✅ AudioContext resumed');
}

const source = audioContext.createMediaStreamSource(stream);
```

---

## 🧪 Testing Each Solution

### Test 1: Complete Bypass
- Remove all noise cancellation
- Record 30 seconds
- Check if audio is captured
- ✅ If YES: Issue is in the noise cancellation code
- ❌ If NO: Issue is elsewhere (permissions, tab capture, etc.)

### Test 2: Simple Pass-Through
- Use basic audio pipeline with no processing
- Record 30 seconds
- Check if audio is captured
- ✅ If YES: Issue is in the filters/processing
- ❌ If NO: Issue is in Web Audio API setup

### Test 3: Add Processing Gradually
- Start with just high-pass filter
- Then add compressor
- Then add low-pass filter
- Find which one breaks it

---

## 📝 Recommended Fix (Step-by-Step)

I'll implement this for you:

1. **Remove the complex AudioWorklet** (not needed yet)
2. **Use simple Web Audio API filters** (high-pass, compressor)
3. **Add AudioContext.resume()** to fix suspended state
4. **Keep original stream alive** during processing
5. **Add better error logging**

This should fix the empty recordings while still providing some audio enhancement!

---

## 🚨 Emergency: Restore Working State

If you need recordings to work RIGHT NOW, use this minimal version:

**In `extension/offscreen.js`, replace the entire `startRecording` function with:**

```javascript
async function startRecording(streamId, tabId) {
  try {
    console.log('Starting recording for tab:', tabId);
    
    if (activeRecorders.has(tabId)) {
      throw new Error(`Already recording tab ${tabId}`);
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    
    console.log('✅ Audio stream obtained');
    
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    
    const audioChunks = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
        console.log(`Audio chunk: ${event.data.size} bytes`);
      }
    };
    
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      console.log(`Final audio: ${audioBlob.size} bytes`);
      sendAudioToBackground(audioBlob, tabId, false);
      activeRecorders.delete(tabId);
    };
    
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      activeRecorders.delete(tabId);
    };
    
    activeRecorders.set(tabId, {
      mediaRecorder,
      audioChunks,
      stream,
      mimeType
    });
    
    mediaRecorder.start(1000);
    console.log('✅ Recording started');
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

This is the **original working version** before noise cancellation.

---

## 💡 Next Steps

1. First, **restore recordings** to working state
2. Then **debug why** noise cancellation broke it
3. Then **add NC back carefully** with proper testing

Want me to fix this? I can implement the corrected version that should work!

