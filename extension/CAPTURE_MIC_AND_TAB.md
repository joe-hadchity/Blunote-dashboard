# 🎙️ Capture Microphone + Tab Audio (Both Sides)

## 🎯 The Problem

**Current Setup:**
- ✅ Captures TAB audio (what you hear - others talking)
- ❌ Does NOT capture YOUR microphone (your voice)

**What You Want:**
- ✅ Capture TAB audio (others talking)
- ✅ Capture YOUR microphone (your voice)
- ✅ Mix them together in one recording

---

## 🔧 Solution: Mix Two Audio Streams

### Architecture:

```
Stream 1: Tab Audio (Google Meet output)
Stream 2: Microphone (Your voice)
    ↓
Audio Context - Mix both streams
    ↓
Combined Stream
    ↓
MediaRecorder
    ↓
Recording with BOTH voices
```

---

## 💻 Implementation

Update `extension/offscreen.js`:

**Replace the `startRecording` function with:**

```javascript
async function startRecording(streamId, tabId) {
  try {
    console.log('Starting recording for tab:', tabId);
    
    if (activeRecorders.has(tabId)) {
      throw new Error(`Already recording tab ${tabId}`);
    }
    
    // 1. Get TAB audio stream
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    console.log('✅ Tab audio stream obtained');
    
    // 2. Get MICROPHONE stream
    let micStream = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('✅ Microphone stream obtained');
    } catch (micError) {
      console.warn('⚠️ Could not access microphone:', micError.message);
      console.log('Continuing with tab audio only');
    }
    
    // 3. Mix both streams using Web Audio API
    let finalStream;
    let audioContext = null;
    
    if (micStream) {
      try {
        audioContext = new AudioContext();
        
        // Create sources for both streams
        const tabSource = audioContext.createMediaStreamSource(tabStream);
        const micSource = audioContext.createMediaStreamSource(micStream);
        
        // Create destination
        const destination = audioContext.createMediaStreamDestination();
        
        // Connect both to destination (this mixes them)
        tabSource.connect(destination);
        micSource.connect(destination);
        
        finalStream = destination.stream;
        console.log('🎙️ Mixed audio stream created (tab + microphone)');
        
        // Set up visualization
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        tabSource.connect(analyser);
        micSource.connect(analyser);
        startAudioLevelMonitoring(tabId, analyser);
        
      } catch (mixError) {
        console.warn('Failed to mix streams:', mixError);
        finalStream = tabStream;
        if (audioContext) audioContext.close();
      }
    } else {
      // No microphone, just use tab audio
      finalStream = tabStream;
      console.log('📼 Using tab audio only');
    }
    
    // 4. Create MediaRecorder with the final (mixed) stream
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    
    const audioChunks = [];
    
    const mediaRecorder = new MediaRecorder(finalStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
        console.log(`Tab ${tabId} - Audio chunk:`, event.data.size, 'bytes, total:', audioChunks.length);
      }
    };
    
    mediaRecorder.onstop = () => {
      console.log(`Tab ${tabId} - MediaRecorder stopped`);
      console.log(`Tab ${tabId} - Collected ${audioChunks.length} audio chunks`);
      
      // Stop all streams
      tabStream.getTracks().forEach(track => track.stop());
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      
      // Create final blob
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      console.log(`Tab ${tabId} - Final audio blob:`, audioBlob.size, 'bytes');
      
      sendAudioToBackground(audioBlob, tabId);
      activeRecorders.delete(tabId);
    };
    
    mediaRecorder.start(1000);
    console.log(`Tab ${tabId} - MediaRecorder started (tab + mic)`);
    
    // Store recorder
    activeRecorders.set(tabId, {
      mediaRecorder,
      audioChunks,
      tabStream,
      micStream,
      audioContext,
      mimeType
    });
    
    return true;
    
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

// Audio level monitoring helper
function startAudioLevelMonitoring(tabId, analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const interval = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const level = Math.round((average / 255) * 100);
    
    chrome.runtime.sendMessage({
      type: 'AUDIO_LEVEL',
      tabId: tabId,
      level: level
    }).catch(() => {});
    
  }, 100);
  
  // Store interval for cleanup
  const recorder = activeRecorders.get(tabId);
  if (recorder) {
    recorder.visualizationInterval = interval;
  }
}
```

---

## ✅ What This Does

**Now captures:**
1. ✅ Tab audio (Google Meet - others talking)
2. ✅ Your microphone (your voice)
3. ✅ Mixes them together
4. ✅ Records combined audio
5. ✅ Visualization shows BOTH

**Result:**
- Complete meeting recording with EVERYONE's voice
- Your voice + their voices
- All in one file

---

## 🎯 Benefits

| Before | After |
|--------|-------|
| Only tab audio | Tab + Microphone |
| Missing your voice | Has your voice ✅ |
| Incomplete meetings | Complete meetings ✅ |

---

## 🧪 Test It

1. Reload extension
2. Join Google Meet
3. Start talking into mic
4. Start recording
5. Bars should move when you talk! ✅
6. Recording will have your voice! ✅

---

## ⚠️ Microphone Permission

When you start recording, Chrome will ask:
```
Allow Bluenote to use your microphone?
[Block] [Allow]
```

Click **Allow** to capture your voice too!

---

**Want me to implement this?** This will capture both tab audio AND your microphone!

