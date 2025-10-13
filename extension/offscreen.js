// Offscreen document for handling audio capture in Manifest V3
// Service workers can't use getUserMedia, so we use an offscreen document

console.log('Bluenote offscreen audio recorder loaded');

// Support multiple simultaneous recordings (one per tab)
const activeRecorders = new Map(); // tabId -> { mediaRecorder, audioChunks, stream }

// Audio visualization
let audioContext = null;
let analyser = null;
let visualizationInterval = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message.type);
  
  if (message.target !== 'offscreen') {
    return false;
  }
  
  switch (message.type) {
    case 'START_RECORDING':
      startRecording(message.streamId, message.tabId)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'STOP_RECORDING':
      stopRecording(message.tabId)
        .then((audioBlob) => {
          // The onstop handler will send the audio to background
          sendResponse({ success: true });
        })
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    default:
      return false;
  }
});

// Start recording audio from BOTH tab and microphone
async function startRecording(streamId, tabId) {
  try {
    console.log('🎙️ Starting recording with TAB + MICROPHONE for tab:', tabId);
    
    // Check if already recording this tab
    if (activeRecorders.has(tabId)) {
      throw new Error(`Already recording tab ${tabId}`);
    }
    
    // 1. Get TAB audio stream (what you hear from the meeting)
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    console.log('✅ Tab audio stream obtained:', tabStream.getAudioTracks().length, 'tracks');
    
    // 2. Get MICROPHONE stream (your voice)
    let micStream = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('✅ Microphone stream obtained:', micStream.getAudioTracks().length, 'tracks');
    } catch (micError) {
      console.warn('⚠️ Could not access microphone:', micError.message);
      console.log('Continuing with tab audio only (you won\'t hear your own voice in recording)');
    }
    
    // 3. Mix BOTH streams using Web Audio API
    let finalStream;
    let mixedStream = null;
    
    if (micStream) {
      try {
        console.log('🔧 Mixing tab audio + microphone...');
        
        audioContext = new AudioContext({ sampleRate: 48000 });
        
        // Resume if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Create sources
        const tabSource = audioContext.createMediaStreamSource(tabStream);
        const micSource = audioContext.createMediaStreamSource(micStream);
        
        // Create mixer/destination
        const destination = audioContext.createMediaStreamDestination();
        
        // Set up visualization BEFORE connecting to destination
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Connect: tab → analyser → destination
        tabSource.connect(analyser);
        tabSource.connect(destination);
        
        // Connect: mic → analyser → destination
        micSource.connect(analyser);
        micSource.connect(destination);
        
        mixedStream = destination.stream;
        finalStream = mixedStream;
        
        console.log('✅ Mixed stream created (tab + mic)');
        console.log('Mixed stream tracks:', mixedStream.getAudioTracks().length);
        
        // Start audio level monitoring
        startAudioLevelMonitoring(tabId);
        console.log('✅ Audio visualization started');
        
      } catch (mixError) {
        console.error('❌ Failed to mix streams:', mixError);
        finalStream = tabStream;
        if (audioContext) {
          audioContext.close();
          audioContext = null;
        }
        console.log('Falling back to tab audio only');
      }
    } else {
      // No microphone, just use tab audio
      finalStream = tabStream;
      console.log('📼 Using tab audio only (no microphone)');
      
      // Still set up visualization for tab audio
      try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(tabStream);
        source.connect(analyser);
        startAudioLevelMonitoring(tabId);
        console.log('✅ Visualization started (tab audio only)');
      } catch (vizError) {
        console.warn('Could not start visualization:', vizError);
      }
    }
    
    // 4. Verify final stream has audio
    const finalTracks = finalStream.getAudioTracks();
    console.log('Final stream audio tracks:', finalTracks.length);
    
    if (finalTracks.length === 0) {
      throw new Error('Final stream has no audio tracks!');
    }
    
    finalTracks.forEach((track, i) => {
      console.log(`Final track ${i}:`, {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        label: track.label
      });
    });
    
    // 5. Create MediaRecorder
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
        console.log(`📼 Audio chunk:`, event.data.size, 'bytes, total:', audioChunks.length);
      } else {
        console.warn(`⚠️ Empty chunk! Size:`, event.data?.size || 0);
      }
    };
    
    mediaRecorder.onstop = () => {
      console.log(`🛑 MediaRecorder stopped`);
      console.log(`📊 Total chunks collected:`, audioChunks.length);
      
      // Stop all streams
      tabStream.getTracks().forEach(track => track.stop());
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (mixedStream) {
        mixedStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      stopAudioLevelMonitoring();
      
      // Create final blob
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      console.log(`📦 Final audio blob:`, audioBlob.size, 'bytes from', audioChunks.length, 'chunks');
      
      if (audioBlob.size === 0) {
        console.error('❌❌❌ EMPTY RECORDING!');
        console.error('Chunks collected:', audioChunks.length);
        console.error('This means NO audio was captured at all');
      }
      
      sendAudioToBackground(audioBlob, tabId);
      activeRecorders.delete(tabId);
    };
    
    mediaRecorder.onerror = (event) => {
      console.error(`❌ MediaRecorder error:`, event.error);
      activeRecorders.delete(tabId);
    };
    
    // Store everything
    activeRecorders.set(tabId, {
      mediaRecorder,
      audioChunks,
      tabStream,
      micStream,
      mixedStream,
      audioContext,
      mimeType
    });
    
    // Start recording
    mediaRecorder.start(1000);
    console.log(`🎬 MediaRecorder start() called`);
    
    // Verify state
    setTimeout(() => {
      console.log(`✅ MediaRecorder state:`, mediaRecorder.state);
      console.log(`📊 Stream active:`, finalStream.active);
      console.log(`📊 Track count:`, finalStream.getAudioTracks().length);
      
      if (mediaRecorder.state !== 'recording') {
        console.error(`❌ NOT RECORDING! State: ${mediaRecorder.state}`);
      } else {
        console.log(`✅ Successfully recording tab ${tabId}`);
      }
    }, 500);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error starting recording:', error);
    throw error;
  }
}

// Stop recording for a specific tab
async function stopRecording(tabId) {
  return new Promise((resolve, reject) => {
    const recorder = activeRecorders.get(tabId);
    
    if (!recorder) {
      reject(new Error(`No active recording for tab ${tabId}`));
      return;
    }
    
    const { mediaRecorder, audioChunks, stream, mimeType } = recorder;
    
    if (mediaRecorder.state === 'recording') {
      console.log(`Tab ${tabId} - Stopping recording...`);
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log(`Tab ${tabId} - Recording stopped, blob size:`, audioBlob.size);
        resolve(audioBlob);
      }, { once: true });
      
      mediaRecorder.stop();
    } else {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      console.log(`Tab ${tabId} - Recording already stopped, blob size:`, audioBlob.size);
      resolve(audioBlob);
    }
  });
}

// Monitor audio levels and send to popup for visualization
function startAudioLevelMonitoring(tabId) {
  if (!analyser) {
    console.error('❌ Analyser not initialized!');
    return;
  }
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  console.log('🎵 Starting audio level monitoring, buffer length:', bufferLength);
  
  // Clear any existing interval
  if (visualizationInterval) {
    clearInterval(visualizationInterval);
  }
  
  let sampleCount = 0;
  
  // Send audio levels every 100ms
  visualizationInterval = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    let sum = 0;
    let max = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
      if (dataArray[i] > max) max = dataArray[i];
    }
    const average = sum / bufferLength;
    const level = Math.round((average / 255) * 100); // 0-100
    
    sampleCount++;
    
    // Log every 10 samples (every second)
    if (sampleCount % 10 === 0) {
      console.log(`🎵 Audio level: ${level}% (avg: ${average.toFixed(1)}, max: ${max})`);
    }
    
    // Send to background (which forwards to popup)
    chrome.runtime.sendMessage({
      type: 'AUDIO_LEVEL',
      tabId: tabId,
      level: level
    }).catch(() => {}); // Ignore errors
    
  }, 100);
  
  console.log('✅ Audio monitoring interval started');
}

function stopAudioLevelMonitoring() {
  if (visualizationInterval) {
    clearInterval(visualizationInterval);
    visualizationInterval = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyser = null;
}

// Send audio blob to background for upload
async function sendAudioToBackground(audioBlob, tabId) {
  try {
    console.log('Converting audio blob to array buffer...');
    console.log('Blob details:', {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    // Stop audio monitoring
    stopAudioLevelMonitoring();
    
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    
    if (arrayBuffer.byteLength === 0) {
      console.error('❌ ArrayBuffer is empty! Blob conversion failed or blob was empty');
    }
    
    // Convert to Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Uint8Array length:', uint8Array.length);
    
    // Send to background
    console.log('Sending to background...');
    chrome.runtime.sendMessage({
      type: 'RECORDING_COMPLETE',
      tabId: tabId,
      audioData: Array.from(uint8Array),
      mimeType: audioBlob.type,
      size: audioBlob.size
    });
    
    console.log('✅ Audio sent to background:', audioBlob.size, 'bytes');
    
  } catch (error) {
    console.error('❌ Error sending audio to background:', error);
  }
}

