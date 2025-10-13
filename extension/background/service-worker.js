// Background Service Worker for Bluenote Extension
// Handles recording, noise cancellation, and backend communication

let activeRecordings = new Map(); // Map of tabId -> recording session
const API_BASE_URL = 'http://localhost:3000'; // Your Next.js app
let badgeTimerInterval = null; // Timer for updating badge
const MIN_RECORDING_DURATION = 30; // Minimum 30 seconds to save recording

// Recording session state
class RecordingSession {
  constructor(tabId, meetingInfo) {
    this.tabId = tabId;
    this.meetingInfo = meetingInfo;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = Date.now();
    this.status = 'preparing'; // preparing, recording, stopped
  }
}

// Update badge with recording time
function updateBadge() {
  if (activeRecordings.size === 0) {
    // No active recordings - clear badge
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
    
    // Stop timer if running
    if (badgeTimerInterval) {
      clearInterval(badgeTimerInterval);
      badgeTimerInterval = null;
    }
    return;
  }
  
  // Get the first (or only) active recording
  const [session] = activeRecordings.values();
  
  if (session && session.status === 'recording') {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    // Format as MM:SS or M:SS for shorter durations
    let badgeText;
    if (minutes < 10) {
      badgeText = `${minutes}:${String(seconds).padStart(2, '0')}`;
    } else {
      // For longer recordings, just show minutes
      badgeText = `${minutes}m`;
    }
    
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
  }
}

// Broadcast recording status to web app tabs
async function broadcastRecordingStatus() {
  try {
    // Find all tabs with the Bluenote web app
    const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    
    // Get current recording status
    let status = { isRecording: false, duration: 0, title: '' };
    
    if (activeRecordings.size > 0) {
      const [session] = activeRecordings.values();
      status = {
        isRecording: true,
        duration: Math.floor((Date.now() - session.startTime) / 1000),
        title: session.meetingInfo.title || 'Meeting'
      };
    }
    
    // Send status to all Bluenote tabs
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'RECORDING_STATUS',
          ...status
        }).catch(() => {
          // Tab might not be ready, ignore
        });
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

// Start badge timer
function startBadgeTimer() {
  // Clear existing timer
  if (badgeTimerInterval) {
    clearInterval(badgeTimerInterval);
  }
  
  // Update immediately
  updateBadge();
  
  // Broadcast initial status
  broadcastRecordingStatus();
  
  // Update every second
  badgeTimerInterval = setInterval(() => {
    updateBadge();
    broadcastRecordingStatus();
  }, 1000);
}

// Stop badge timer
function stopBadgeTimer() {
  if (badgeTimerInterval) {
    clearInterval(badgeTimerInterval);
    badgeTimerInterval = null;
  }
  chrome.action.setBadgeText({ text: '' });
  
  // Broadcast stopped status to web app
  broadcastRecordingStatus();
}

// Inject floating widget into meeting page
async function injectFloatingWidget(tabId) {
  try {
    console.log('💉 Injecting widget into tab:', tabId);
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: createFloatingWidget,
      args: []
    });
    
    console.log('✅ Widget injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject widget:', error);
    throw error;
  }
}

// This function will be injected and run in the meeting page
function createFloatingWidget() {
  // Remove existing widget
  const existing = document.getElementById('bluenote-floating-widget');
  if (existing) {
    existing.remove();
  }
  
  // Create widget
  const widget = document.createElement('div');
  widget.id = 'bluenote-floating-widget';
  widget.innerHTML = `
    <style>
      @keyframes bluenote-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes bluenote-slide-in {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .bluenote-widget {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: bluenote-slide-in 0.3s ease;
      }
      .bluenote-compact {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 12px 18px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .bluenote-compact:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
      }
      .bluenote-dot {
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        animation: bluenote-pulse 2s ease-in-out infinite;
      }
      .bluenote-time {
        font-size: 16px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.5px;
      }
      .bluenote-expanded {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        border: 1px solid #e4e7ec;
        min-width: 240px;
      }
      .bluenote-header {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .bluenote-header-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .bluenote-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
      }
      .bluenote-timer-large {
        font-size: 24px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.5px;
      }
      .bluenote-body {
        padding: 16px;
      }
      .bluenote-btn {
        width: 100%;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s ease;
        font-family: 'Inter', sans-serif;
      }
      .bluenote-btn-stop {
        background: #dc2626;
        color: white;
        margin-bottom: 8px;
      }
      .bluenote-btn-stop:hover {
        background: #b91c1c;
      }
      .bluenote-btn-minimize {
        background: white;
        color: #344054;
        border: 1px solid #d0d5dd;
      }
      .bluenote-btn-minimize:hover {
        background: #f9fafb;
      }
      .bluenote-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        transition: background 0.15s ease;
      }
      .bluenote-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    </style>
    <div class="bluenote-widget" id="bluenote-widget-root">
      <div class="bluenote-compact" id="bluenote-widget-compact">
        <span class="bluenote-dot"></span>
        <span class="bluenote-time" id="bluenote-widget-time">0:00</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(widget);
  
  // Widget state
  let startTime = Date.now();
  let expanded = false;
  let timerInterval = null;
  
  // Update timer
  function updateTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    const timeEl = document.getElementById('bluenote-widget-time');
    if (timeEl) {
      timeEl.textContent = timeStr;
    }
  }
  
  // Start timer
  updateTime();
  timerInterval = setInterval(updateTime, 1000);
  
  // Toggle expanded/compact
  function toggleExpanded() {
    expanded = !expanded;
    const root = document.getElementById('bluenote-widget-root');
    if (!root) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    if (expanded) {
      root.innerHTML = `
        <div class="bluenote-expanded">
          <div class="bluenote-header">
            <div class="bluenote-header-content">
              <span class="bluenote-dot"></span>
              <div>
                <div class="bluenote-title">Recording</div>
                <div class="bluenote-timer-large" id="bluenote-widget-time">${timeStr}</div>
              </div>
            </div>
            <button class="bluenote-close" id="bluenote-close-btn">×</button>
          </div>
          <div class="bluenote-body">
            <button class="bluenote-btn bluenote-btn-stop" id="bluenote-stop-btn">Stop Recording</button>
            <button class="bluenote-btn bluenote-btn-minimize" id="bluenote-minimize-btn">Minimize</button>
          </div>
        </div>
      `;
      
      document.getElementById('bluenote-stop-btn').addEventListener('click', stopRecording);
      document.getElementById('bluenote-minimize-btn').addEventListener('click', toggleExpanded);
      document.getElementById('bluenote-close-btn').addEventListener('click', toggleExpanded);
    } else {
      root.innerHTML = `
        <div class="bluenote-compact" id="bluenote-widget-compact">
          <span class="bluenote-dot"></span>
          <span class="bluenote-time" id="bluenote-widget-time">${timeStr}</span>
        </div>
      `;
      
      document.getElementById('bluenote-widget-compact').addEventListener('click', toggleExpanded);
    }
  }
  
  // Stop recording
  async function stopRecording() {
    console.log('🛑 Stop button clicked in widget');
    
    // Calculate duration
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const MIN_DURATION = 30;
    
    // Check if recording is too short
    if (durationSeconds < MIN_DURATION) {
      const confirmDiscard = confirm(
        `Recording is only ${durationSeconds} seconds long.\n\n` +
        `Minimum ${MIN_DURATION} seconds required to save.\n\n` +
        `This recording will NOT be saved. Continue?`
      );
      
      if (!confirmDiscard) {
        return; // User cancelled, continue recording
      }
      
      // User confirmed, discard the recording
      try {
        await chrome.runtime.sendMessage({ type: 'DISCARD_RECORDING' });
        removeWidget();
      } catch (error) {
        console.error('Error discarding recording:', error);
      }
      return;
    }
    
    const stopBtn = document.getElementById('bluenote-stop-btn');
    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.textContent = 'Stopping...';
    }
    
    try {
      // Send stop message to background
      const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
      console.log('Stop response:', response);
      
      // Show success state
      if (stopBtn) {
        stopBtn.textContent = 'Stopped ✓';
        stopBtn.style.background = '#16a34a';
      }
      
      // Remove widget after short delay
      setTimeout(() => {
        removeWidget();
      }, 1500);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      if (stopBtn) {
        stopBtn.textContent = 'Error - Retry';
        stopBtn.disabled = false;
      }
    }
  }
  
  // Remove widget
  function removeWidget() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    const widget = document.getElementById('bluenote-floating-widget');
    if (widget) {
      widget.remove();
    }
  }
  
  // Add compact click handler
  document.getElementById('bluenote-widget-compact').addEventListener('click', toggleExpanded);
  
  // Listen for stop messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'RECORDING_STOPPED') {
      removeWidget();
    }
  });
  
  console.log('✅ Bluenote widget created and running');
}

// Remove widget from meeting page
async function removeFloatingWidget(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const widget = document.getElementById('bluenote-floating-widget');
        if (widget) {
          widget.remove();
        }
      }
    });
  } catch (error) {
    console.log('Could not remove widget:', error.message);
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bluenote Extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    noiseReduction: true,
    autoTranscribe: true,
    apiUrl: API_BASE_URL
  });
  
  // Clear badge on install
  chrome.action.setBadgeText({ text: '' });
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.type);
  
  switch (message.type) {
    case 'START_RECORDING':
      // Get tabId from message.data (sent from popup) or sender.tab (sent from content script)
      const tabId = message.data.tabId || sender.tab?.id;
      handleStartRecording(message.data, tabId)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep channel open for async response
      
    case 'STOP_RECORDING':
      // Get tabId from message or from sender tab (when called from widget)
      const stopTabId = message.tabId || sender.tab?.id;
      
      // If no tabId provided, try to find the active recording
      if (!stopTabId && activeRecordings.size === 1) {
        const [firstTabId] = activeRecordings.keys();
        handleStopRecording(firstTabId, false)
          .then(sendResponse)
          .catch(error => sendResponse({ error: error.message }));
      } else {
        handleStopRecording(stopTabId, false)
          .then(sendResponse)
          .catch(error => sendResponse({ error: error.message }));
      }
      return true;
      
    case 'DISCARD_RECORDING':
      // Discard recording without saving
      const discardTabId = message.tabId || sender.tab?.id;
      
      if (!discardTabId && activeRecordings.size === 1) {
        const [firstTabId] = activeRecordings.keys();
        handleStopRecording(firstTabId, true)
          .then(sendResponse)
          .catch(error => sendResponse({ error: error.message }));
      } else {
        handleStopRecording(discardTabId, true)
          .then(sendResponse)
          .catch(error => sendResponse({ error: error.message }));
      }
      return true;
      
    case 'GET_RECORDING_STATUS':
      const session = activeRecordings.get(message.tabId);
      sendResponse({ 
        isRecording: !!session,
        status: session?.status,
        duration: session ? Math.floor((Date.now() - session.startTime) / 1000) : 0
      });
      return false;
      
    case 'CHECK_AUTH':
      checkAuthentication()
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'AUDIO_LEVEL':
      // Forward audio levels to popup (no response needed)
      // This allows popup to show real-time audio visualization
      return false;
      
    case 'RECORDING_COMPLETE':
      // Received audio data from offscreen document
      handleRecordingComplete(message.tabId, message.audioData, message.mimeType, message.size)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'FORCE_STOP':
      // Force stop and cleanup (reset state)
      if (message.tabId && activeRecordings.has(message.tabId)) {
        activeRecordings.delete(message.tabId);
        console.log('Force stopped recording for tab:', message.tabId);
        removeFloatingWidget(message.tabId).catch(() => {});
      }
      stopBadgeTimer();
      cleanupOffscreenDocument().catch(() => {});
      sendResponse({ success: true });
      return false;
      
    default:
      sendResponse({ error: 'Unknown message type' });
      return false;
  }
});

// Start recording a tab
async function handleStartRecording(meetingInfo, tabId) {
  try {
    console.log('Starting recording for tab:', tabId, meetingInfo);
    
    // Validate tabId
    if (!tabId || typeof tabId !== 'number') {
      throw new Error('Invalid tab ID. Please try clicking the extension icon again.');
    }
    
    // Check if already recording
    if (activeRecordings.has(tabId)) {
      throw new Error('Already recording this tab');
    }
    
    // Check authentication
    const authCheck = await checkAuthentication();
    if (!authCheck.authenticated) {
      throw new Error('Not authenticated. Please log in to Bluenote.');
    }
    
    // Get streamId from meetingInfo (passed from popup after calling getMediaStreamId)
    const streamId = meetingInfo.streamId;
    if (!streamId) {
      throw new Error('No stream ID provided. Please try again.');
    }
    
    console.log('Using stream ID:', streamId, 'for tab:', tabId);
    
    // Create recording session
    const session = new RecordingSession(tabId, meetingInfo);
    activeRecordings.set(tabId, session);
    
    // Create an offscreen document to handle audio capture
    // Service workers can't use getUserMedia directly in Manifest V3
    
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (existingContexts.length === 0) {
      // No offscreen document exists, create one
      try {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: [chrome.offscreen.Reason.USER_MEDIA],
          justification: 'Recording meeting audio with noise cancellation'
        });
        console.log('Offscreen document created');
      } catch (error) {
        console.error('Error creating offscreen document:', error);
        throw error;
      }
    } else {
      console.log('Offscreen document already exists, reusing it');
    }
    
    // Send stream ID to offscreen document to start recording
    const offscreenResponse = await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'START_RECORDING',
      streamId: streamId,
      tabId: tabId
    });
    
    if (!offscreenResponse || offscreenResponse.error) {
      throw new Error(offscreenResponse?.error || 'Failed to start offscreen recording');
    }
    
    session.status = 'recording';
    
    // Start badge timer to show recording duration on icon
    startBadgeTimer();
    console.log('✅ Badge timer started');
    
    // Inject floating widget directly into the meeting page
    if (tabId) {
      injectFloatingWidget(tabId).catch(error => {
        console.log('Could not inject widget:', error.message);
      });
    }
    
    // Notify content script (optional, don't fail if it doesn't work)
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'RECORDING_STARTED',
        sessionId: tabId
      }).catch((error) => {
        console.log('Could not notify content script (this is normal):', error.message);
      });
    }
    
    return {
      success: true,
      message: 'Recording started',
      sessionId: tabId
    };
    
  } catch (error) {
    console.error('Error starting recording:', error);
    activeRecordings.delete(tabId);
    stopBadgeTimer();
    if (tabId) {
      removeFloatingWidget(tabId).catch(() => {});
    }
    throw error;
  }
}

// Start MediaRecorder with the captured stream
function startMediaRecording(session, stream) {
  try {
    // Use audio/webm for broad compatibility
    const options = { 
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000 // 128 kbps
    };
    
    session.mediaRecorder = new MediaRecorder(stream, options);
    session.audioChunks = [];
    
    session.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        session.audioChunks.push(event.data);
        console.log('Audio chunk received:', event.data.size, 'bytes');
      }
    };
    
    session.mediaRecorder.onstop = async () => {
      console.log('MediaRecorder stopped, processing audio...');
      
      // Create blob from chunks
      const audioBlob = new Blob(session.audioChunks, { type: 'audio/webm' });
      console.log('Audio blob created:', audioBlob.size, 'bytes');
      
      // Upload to backend
      await uploadRecording(session, audioBlob);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    };
    
    session.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      activeRecordings.delete(session.tabId);
    };
    
    // Start recording (collect data every second)
    session.mediaRecorder.start(1000);
    console.log('MediaRecorder started');
    
  } catch (error) {
    console.error('Error starting media recording:', error);
    throw error;
  }
}

// Stop recording a tab
async function handleStopRecording(tabId, discard = false) {
  try {
    console.log('🛑 Stopping recording for tab:', tabId, 'discard:', discard);
    
    const session = activeRecordings.get(tabId);
    
    if (!session) {
      console.warn('⚠️ No active recording for tab:', tabId);
      // Try to find any active recording if tabId is wrong
      if (activeRecordings.size > 0) {
        const [firstTabId, firstSession] = activeRecordings.entries().next().value;
        console.log('Using first available recording:', firstTabId);
        return handleStopRecording(firstTabId, discard);
      }
      throw new Error('No active recording for this tab');
    }
    
    // Check recording duration
    const durationSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    console.log('Recording duration:', durationSeconds, 'seconds');
    
    // Set discard flag if recording is too short (unless already discarding)
    if (!discard && durationSeconds < MIN_RECORDING_DURATION) {
      console.warn(`Recording too short (${durationSeconds}s < ${MIN_RECORDING_DURATION}s), will discard`);
      discard = true;
    }
    
    session.status = 'stopping';
    session.discard = discard; // Store discard flag in session
    console.log('📝 Session status set to stopping, discard:', discard);
    
    // Send message to offscreen document to stop recording
    try {
      const response = await chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'STOP_RECORDING',
        tabId: tabId,
        discard: discard
      });
      
      if (response && response.error) {
        console.error('Error stopping offscreen recording:', response.error);
      }
    } catch (error) {
      console.log('Could not send stop message to offscreen (may have already closed):', error.message);
    }
    
    // Notify content script and widget
    chrome.tabs.sendMessage(tabId, {
      type: 'RECORDING_STOPPED'
    }).catch(() => {
      // Content script might not be ready
    });
    
    console.log('✅ Stop recording complete');
    
    return {
      success: true,
      message: discard ? 'Recording discarded' : 'Recording stopped successfully',
      tabId: tabId,
      discard: discard
    };
    
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
}

// Handle recording completion from offscreen document
async function handleRecordingComplete(tabId, audioDataArray, mimeType, size) {
  try {
    console.log('Handling recording completion for tab:', tabId, 'size:', size);
    
    const session = activeRecordings.get(tabId);
    if (!session) {
      console.warn('No session found for tab:', tabId);
      return;
    }
    
    // Check if recording should be discarded
    const durationSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const shouldDiscard = session.discard || durationSeconds < MIN_RECORDING_DURATION;
    
    if (shouldDiscard) {
      console.log(`🗑️ Discarding recording (${durationSeconds}s, discard flag: ${session.discard})`);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Recording Discarded',
        message: `Recording was too short (${durationSeconds}s). Minimum ${MIN_RECORDING_DURATION}s required.`,
        priority: 1
      });
    } else {
      // Convert array back to Blob
      const audioBlob = new Blob([new Uint8Array(audioDataArray)], { type: mimeType });
      console.log('Reconstructed audio blob:', audioBlob.size, 'bytes');
      
      // Upload to backend
      await uploadRecording(session, audioBlob);
    }
    
    // Clean up session
    activeRecordings.delete(tabId);
    
    // Stop badge timer
    stopBadgeTimer();
    console.log('✅ Badge timer stopped');
    
    // Remove widget from page
    if (tabId) {
      await removeFloatingWidget(tabId);
    }
    
    console.log(shouldDiscard ? 'Recording discarded' : 'Recording uploaded successfully');
    
    // Close offscreen document if no more active recordings
    await cleanupOffscreenDocument();
    
  } catch (error) {
    console.error('Error handling recording completion:', error);
    throw error;
  }
}

// Clean up offscreen document if no recordings are active
async function cleanupOffscreenDocument() {
  try {
    // Only close if no active recordings
    if (activeRecordings.size === 0) {
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });
      
      if (existingContexts.length > 0) {
        await chrome.offscreen.closeDocument();
        console.log('Offscreen document closed (no active recordings)');
      }
    } else {
      console.log(`Keeping offscreen document (${activeRecordings.size} active recordings)`);
    }
  } catch (error) {
    // Ignore errors if document is already closed
    console.log('Offscreen cleanup error (may already be closed):', error.message);
  }
}

// Upload recording to backend
async function uploadRecording(session, audioBlob) {
  try {
    console.log('Uploading recording...', audioBlob.size, 'bytes');
    
    // Get auth token from cookies (try multiple names)
    const possibleTokenNames = ['sb-access-token', 'supabase-access-token', 'access-token'];
    let accessToken = null;
    
    for (const cookieName of possibleTokenNames) {
      const cookies = await chrome.cookies.getAll({
        url: API_BASE_URL,
        name: cookieName
      });
      
      if (cookies.length > 0) {
        accessToken = cookies[0].value;
        console.log(`Using token from cookie: ${cookieName}`);
        break;
      }
    }
    
    // Calculate duration
    const durationSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    
    // Create FormData
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);
    formData.append('title', session.meetingInfo.title || 'Recorded Meeting');
    formData.append('platform', session.meetingInfo.platform || 'GOOGLE_MEET');
    formData.append('duration', durationSeconds.toString());
    formData.append('meetingUrl', session.meetingInfo.url || '');
    
    // Build headers
    const headers = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Upload to backend
    const response = await fetch(`${API_BASE_URL}/api/extension/upload-recording`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',  // Include cookies
      mode: 'cors',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const data = await response.json();
    console.log('Upload successful:', data);
    
    // Clean up session
    activeRecordings.delete(session.tabId);
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Recording Saved!',
      message: `Your recording "${session.meetingInfo.title}" has been saved and is being processed.`,
      priority: 2
    });
    
    return data;
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Upload Failed',
      message: error.message,
      priority: 2
    });
    
    throw error;
  }
}

// Check if user is authenticated
async function checkAuthentication() {
  try {
    console.log('Checking authentication...');
    
    // Try to get all cookies from the app
    const allCookies = await chrome.cookies.getAll({
      url: API_BASE_URL
    });
    
    console.log('All cookies from app:', allCookies.map(c => c.name));
    
    // Look for access token (try different cookie names)
    const possibleTokenNames = ['sb-access-token', 'supabase-access-token', 'access-token'];
    let accessToken = null;
    
    for (const cookieName of possibleTokenNames) {
      const cookies = await chrome.cookies.getAll({
        url: API_BASE_URL,
        name: cookieName
      });
      
      if (cookies.length > 0) {
        accessToken = cookies[0].value;
        console.log(`Found token in cookie: ${cookieName}`);
        break;
      }
    }
    
    if (!accessToken) {
      console.warn('No access token found in cookies');
      
      // Try to check if user is logged in via session API
      const sessionCheck = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      }).catch(err => {
        console.error('Session check failed:', err);
        return null;
      });
      
      if (sessionCheck && sessionCheck.ok) {
        const data = await sessionCheck.json();
        console.log('User authenticated via session:', data.user?.email);
        return { 
          authenticated: true, 
          user: data.user 
        };
      }
      
      return { 
        authenticated: false, 
        error: 'Not logged in. Please log in to Bluenote first.',
        cookiesFound: allCookies.map(c => c.name)
      };
    }
    
    // Verify token with backend
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Authentication successful:', data.user?.email);
      return { 
        authenticated: true, 
        user: data.user 
      };
    } else {
      const errorText = await response.text();
      console.error('Auth verification failed:', response.status, errorText);
      return { 
        authenticated: false, 
        error: 'Session expired. Please log in again.' 
      };
    }
    
  } catch (error) {
    console.error('Auth check error:', error);
    return { 
      authenticated: false, 
      error: `Authentication check failed: ${error.message}` 
    };
  }
}

// Listen for tab updates (detect when meeting ends)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If tab URL changes or closes, stop recording
  if (changeInfo.url && activeRecordings.has(tabId)) {
    const session = activeRecordings.get(tabId);
    const meetingUrl = session.meetingInfo.url;
    
    // Check if still on meeting page
    if (!changeInfo.url.includes('meet.google.com') && 
        !changeInfo.url.includes('zoom.us') && 
        !changeInfo.url.includes('teams.microsoft.com')) {
      console.log('Left meeting page, stopping recording');
      handleStopRecording(tabId).catch(console.error);
    }
  }
});

// Listen for tab closures
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeRecordings.has(tabId)) {
    console.log('Tab closed, stopping recording');
    handleStopRecording(tabId).catch(console.error);
  }
});

console.log('Bluenote background service worker loaded');

