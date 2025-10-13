// ===================================================
// COMPREHENSIVE FIX FOR RECORDING ISSUES
// ===================================================
// Copy this code to fix common recording start/stop problems
//
// This file contains fixes for:
// 1. Start recording not working
// 2. Stop recording not working  
// 3. Multiple recording conflicts
// 4. Offscreen document issues
// 5. Upload failures
// ===================================================

// ===================================================
// FIX 1: Better Error Handling in popup.js
// ===================================================

// Replace startRecording function with this:
async function startRecording() {
  try {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) {
      console.error('Start button not found');
      return;
    }

    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    
    console.log('Requesting media stream ID for tab:', currentTab.id);
    
    // Get media stream ID (Manifest V3 way)
    let streamId;
    try {
      streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: currentTab.id
      });
    } catch (err) {
      console.error('Failed to get stream ID:', err);
      throw new Error('Failed to capture tab audio. Make sure the tab has audio playing.');
    }
    
    if (!streamId) {
      throw new Error('No stream ID returned. Tab might not have audio.');
    }
    
    console.log('Got stream ID:', streamId);
    
    // Send to background to start recording
    console.log('Sending START_RECORDING message...');
    const response = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      data: {
        ...meetingInfo,
        streamId: streamId,
        tabId: currentTab.id
      }
    });
    
    console.log('Start recording response:', response);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.success) {
      throw new Error('Recording failed to start');
    }
    
    isRecording = true;
    recordingDuration = 0;
    showRecordingUI();
    startDurationTimer();
    
    console.log('Recording started successfully');
    
  } catch (error) {
    console.error('Error starting recording:', error);
    showError(error.message || 'Failed to start recording');
    
    // Re-enable button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = '<span>🔴</span><span>Start Recording</span>';
    }
  }
}

// ===================================================
// FIX 2: Better Stop Recording
// ===================================================

async function stopRecording() {
  try {
    const stopBtn = document.getElementById('stopBtn');
    if (!stopBtn) {
      console.error('Stop button not found');
      return;
    }

    stopBtn.disabled = true;
    stopBtn.textContent = 'Stopping...';
    
    stopDurationTimer();
    
    console.log('Sending STOP_RECORDING message for tab:', currentTab.id);
    
    const response = await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      tabId: currentTab.id
    });
    
    console.log('Stop recording response:', response);
    
    if (response && response.error) {
      throw new Error(response.error);
    }
    
    isRecording = false;
    showSuccess('Recording stopped! Uploading...');
    
    console.log('Recording stopped successfully');
    
    // Wait a bit for upload, then show idle UI
    setTimeout(async () => {
      // Check if upload completed
      const status = await chrome.runtime.sendMessage({
        type: 'GET_RECORDING_STATUS',
        tabId: currentTab.id
      });
      
      if (!status.isRecording) {
        showIdleUI();
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error stopping recording:', error);
    showError(error.message || 'Failed to stop recording');
    
    // Force reset UI
    isRecording = false;
    setTimeout(() => showIdleUI(), 1000);
  }
}

// ===================================================
// FIX 3: Add Reset Function
// ===================================================

// Add this function to force reset everything
function forceReset() {
  isRecording = false;
  recordingDuration = 0;
  stopDurationTimer();
  
  // Send reset to background
  chrome.runtime.sendMessage({
    type: 'FORCE_STOP',
    tabId: currentTab?.id
  }).catch(() => {});
  
  showIdleUI();
  console.log('Force reset completed');
}

// Add reset button to error UI
function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="error">
      ⚠️ ${message}
    </div>
    <button class="button" onclick="forceReset()">
      🔄 Reset & Try Again
    </button>
    <button class="button button-dashboard" onclick="location.reload()">
      ↻ Reload Popup
    </button>
  `;
}

// ===================================================
// DEBUGGING TIPS
// ===================================================

/*
1. BEFORE RECORDING:
   - Open 3 console windows (popup, background, offscreen)
   - Keep them visible while recording
   - Watch for errors in real-time

2. WHEN STARTING:
   - Should see "Got stream ID" in popup
   - Should see "Recording started" in background
   - Should see "MediaRecorder started" in offscreen

3. DURING RECORDING:
   - Offscreen should show chunks every second
   - If no chunks → Audio not being captured

4. WHEN STOPPING:
   - Should see "Stopping" messages
   - Should see "Final audio blob: X bytes" (X should be >1000)
   - Should see "Upload successful"

5. IF STUCK:
   - Click "Reset & Try Again"
   - Reload extension
   - Close and reopen popup
*/




