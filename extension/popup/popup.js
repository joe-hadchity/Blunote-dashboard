// Popup UI Controller
// Handles user interactions with the extension popup

let currentTab = null;
let isRecording = false;
let recordingDuration = 0;
let durationInterval = null;
let meetingInfo = null;
let editedTitle = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    
    // Check if on a meeting page and detect platform
    const url = tab.url || '';
    const isMeetingPage = url.includes('meet.google.com') ||
                          url.includes('zoom.us') ||
                          url.includes('teams.microsoft.com');
    
    // Detect platform from URL
    let detectedPlatform = 'OTHER';
    if (url.includes('meet.google.com')) {
      detectedPlatform = 'GOOGLE_MEET';
    } else if (url.includes('zoom.us')) {
      detectedPlatform = 'ZOOM';
    } else if (url.includes('teams.microsoft.com')) {
      detectedPlatform = 'MICROSOFT_TEAMS';
    }
    
    if (!isMeetingPage) {
      showNotInMeeting();
      return;
    }
    
    // Get meeting info from content script
    meetingInfo = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_MEETING_INFO' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ 
            title: getMeetingTitleFromUrl(url) || 'Meeting', 
            platform: detectedPlatform, 
            url: tab.url 
          });
        } else {
          // Override platform with detected one if response has UNKNOWN
          if (response && (response.platform === 'UNKNOWN' || !response.platform)) {
            response.platform = detectedPlatform;
          }
          // Better title if available
          if (response && !response.title) {
            response.title = getMeetingTitleFromUrl(url) || 'Meeting';
          }
          resolve(response);
        }
      });
    });
    
    // Check recording status
    const statusResponse = await chrome.runtime.sendMessage({
      type: 'GET_RECORDING_STATUS',
      tabId: tab.id
    });
    
    isRecording = statusResponse.isRecording;
    recordingDuration = statusResponse.duration || 0;
    
    // Check authentication
    const authResponse = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    
    console.log('Auth response:', authResponse);
    
    if (!authResponse.authenticated) {
      showNotAuthenticated(authResponse.error, authResponse.cookiesFound);
      return;
    }
    
    // Render UI
    if (isRecording) {
      showRecordingUI();
      startDurationTimer();
    } else {
      showIdleUI();
    }
    
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError(error.message);
  }
});

// Extract meeting title from URL
function getMeetingTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Google Meet
    if (url.includes('meet.google.com')) {
      const code = urlObj.pathname.split('/').pop();
      return `Google Meet - ${code}`;
    }
    
    // Zoom
    if (url.includes('zoom.us')) {
      const meetingId = urlObj.pathname.match(/\/j\/(\d+)/)?.[1];
      if (meetingId) return `Zoom - ${meetingId}`;
      return 'Zoom Meeting';
    }
    
    // Microsoft Teams
    if (url.includes('teams.microsoft.com')) {
      return 'Teams Meeting';
    }
    
    return 'Meeting';
  } catch (e) {
    return 'Meeting';
  }
}

// Format platform name for display
function formatPlatformName(platform) {
  const platformNames = {
    'GOOGLE_MEET': 'Google Meet',
    'ZOOM': 'Zoom',
    'MICROSOFT_TEAMS': 'Microsoft Teams',
    'SLACK': 'Slack',
    'OTHER': 'Other Platform'
  };
  return platformNames[platform] || platform.replace('_', ' ');
}

// Show UI when not on a meeting page
function showNotInMeeting() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📹</div>
      <h3>Not in a Meeting</h3>
      <p>Navigate to Google Meet, Zoom, or Microsoft Teams to start recording.</p>
      <button class="button button-primary" onclick="openDashboard()">Open Dashboard</button>
    </div>
  `;
}

// Show UI when not authenticated
function showNotAuthenticated(errorMessage, cookiesFound) {
  const app = document.getElementById('app');
  
  const debugInfo = cookiesFound && cookiesFound.length > 0 
    ? `<div class="debug-info">
        Debug: Found cookies: ${cookiesFound.join(', ')}
      </div>`
    : '';
  
  app.innerHTML = `
    <div class="alert alert-error">
      <strong>Authentication Required</strong>
      ${errorMessage || 'Please log in to Bluenote first'}
    </div>
    <div class="alert alert-info">
      <strong>Quick Fix:</strong>
      <ol>
        <li>Open Bluenote in a new tab</li>
        <li>Log in if not already logged in</li>
        <li>Return here and try again</li>
      </ol>
    </div>
    <button class="button button-primary" onclick="openLogin()">Open Bluenote & Log In</button>
    <button class="button button-secondary" onclick="location.reload()">Retry</button>
    ${debugInfo}
  `;
}

// Show idle UI (ready to record)
function showIdleUI() {
  const app = document.getElementById('app');
  const currentTitle = editedTitle || meetingInfo.title;
  
  app.innerHTML = `
    <div class="status-card idle">
      <div class="status-header">
        <div class="status-icon idle">✓</div>
        <div class="status-text">
          <div class="status-label">Ready to Record</div>
          <div class="status-sublabel">Click below to start</div>
        </div>
      </div>
    </div>
    
    <div class="info-row editable-title">
      <div class="info-label">Meeting Title</div>
      <input 
        type="text" 
        class="title-input" 
        id="titleInput" 
        value="${currentTitle}"
        placeholder="Enter meeting title"
      >
      <div class="edit-hint">Click to edit</div>
    </div>
    
    <div class="info-row">
      <div class="info-label">Platform</div>
      <div class="info-value">
        <span class="platform-badge">${formatPlatformName(meetingInfo.platform)}</span>
      </div>
    </div>
    
    <div class="spacer"></div>
    
    <button class="button button-danger" id="startBtn">Start Recording</button>
    <button class="button button-secondary" onclick="openDashboard()">View Recordings</button>
  `;
  
  // Add event listeners
  document.getElementById('startBtn').addEventListener('click', startRecording);
  document.getElementById('titleInput').addEventListener('input', (e) => {
    editedTitle = e.target.value;
  });
}

// Show recording UI (actively recording)
function showRecordingUI() {
  const app = document.getElementById('app');
  const currentTitle = editedTitle || meetingInfo.title;
  
  app.innerHTML = `
    <div class="status-card recording">
      <div class="status-header">
        <div class="status-icon recording">●</div>
        <div class="status-text">
          <div class="status-label">Recording</div>
          <div class="status-sublabel">In progress</div>
        </div>
      </div>
      <div class="duration" id="duration">00:00</div>
    </div>
    
    <div class="info-row">
      <div class="info-label">Meeting Title</div>
      <div class="info-value">${currentTitle}</div>
    </div>
    
    <!-- Audio Level Visualizer -->
    <div class="audio-visualizer" id="audioVisualizer">
      <div class="audio-bar" id="bar1"></div>
      <div class="audio-bar" id="bar2"></div>
      <div class="audio-bar" id="bar3"></div>
      <div class="audio-bar" id="bar4"></div>
      <div class="audio-bar" id="bar5"></div>
      <div class="audio-bar" id="bar6"></div>
      <div class="audio-bar" id="bar7"></div>
      <div class="audio-bar" id="bar8"></div>
    </div>
    <div class="audio-level-text" id="audioLevelText">Audio level: -- (Speak into mic or play audio)</div>
    
    <div class="spacer"></div>
    
    <button class="button button-secondary" id="stopBtn">Stop Recording</button>
    
    <div style="margin-top: 12px; padding: 10px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 11px; color: #1e40af; line-height: 1.5;">
      <strong style="display: block; margin-bottom: 4px;">💡 Floating widget active</strong>
      A red timer widget appears on your meeting page. Click it to expand and control recording.
    </div>
  `;
  
  // Add event listener
  document.getElementById('stopBtn').addEventListener('click', stopRecording);
  
  // Listen for audio levels
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUDIO_LEVEL') {
      updateAudioVisualization(message.level);
    }
  });
}

// Update audio visualization bars
function updateAudioVisualization(level) {
  const bars = [
    document.getElementById('bar1'),
    document.getElementById('bar2'),
    document.getElementById('bar3'),
    document.getElementById('bar4'),
    document.getElementById('bar5'),
    document.getElementById('bar6'),
    document.getElementById('bar7'),
    document.getElementById('bar8')
  ];
  
  const audioLevelText = document.getElementById('audioLevelText');
  
  if (!bars[0] || !audioLevelText) return;
  
  // Update text
  audioLevelText.textContent = `Audio level: ${level}%`;
  
  // Update bars based on level
  bars.forEach((bar, index) => {
    const threshold = (index + 1) * 12.5; // 12.5%, 25%, 37.5%, etc.
    if (level >= threshold) {
      bar.style.transform = 'scaleY(1)';
      bar.style.background = level > 70 ? '#ef4444' : level > 40 ? '#f59e0b' : '#3b82f6';
    } else {
      bar.style.transform = 'scaleY(0.2)';
      bar.style.background = '#d1d5db';
    }
  });
}

// Start recording
async function startRecording() {
  try {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) return;

    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    
    console.log('Starting recording for tab:', currentTab.id);
    
    // Get media stream ID (Manifest V3 way)
    let streamId;
    try {
      streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: currentTab.id
      });
    } catch (err) {
      console.error('Failed to get stream ID:', err);
      throw new Error('Could not capture tab audio. Make sure the tab has audio playing or mic is enabled.');
    }
    
    if (!streamId) {
      throw new Error('No stream ID returned. The tab might not have active audio.');
    }
    
    console.log('✅ Got stream ID:', streamId);
    
    // Use edited title if available
    const finalMeetingInfo = {
      ...meetingInfo,
      title: editedTitle || meetingInfo.title,
      streamId: streamId,
      tabId: currentTab.id
    };
    
    // Send to background to start recording
    console.log('Sending START_RECORDING message to background...');
    const response = await Promise.race([
      chrome.runtime.sendMessage({
        type: 'START_RECORDING',
        data: finalMeetingInfo
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Start recording timeout')), 10000)
      )
    ]);
    
    console.log('Start recording response:', response);
    
    if (!response || response.error) {
      throw new Error(response?.error || 'Failed to start recording');
    }
    
    if (!response.success) {
      throw new Error('Recording did not start successfully');
    }
    
    isRecording = true;
    recordingDuration = 0;
    showRecordingUI();
    startDurationTimer();
    
    console.log('✅ Recording started successfully');
    
  } catch (error) {
    console.error('❌ Error starting recording:', error);
    showError(error.message || 'Failed to start recording. Please try again.');
    
    // Re-enable button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Start Recording';
    }
  }
}

// Stop recording
async function stopRecording() {
  try {
    const stopBtn = document.getElementById('stopBtn');
    if (!stopBtn) return;

    stopBtn.disabled = true;
    stopBtn.textContent = 'Stopping...';
    
    stopDurationTimer();
    
    console.log('Stopping recording for tab:', currentTab.id);
    
    const response = await Promise.race([
      chrome.runtime.sendMessage({
        type: 'STOP_RECORDING',
        tabId: currentTab.id
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stop recording timeout')), 15000)
      )
    ]);
    
    console.log('Stop recording response:', response);
    
    if (response && response.error) {
      console.warn('Stop had error but continuing:', response.error);
    }
    
    isRecording = false;
    showSuccess('Recording stopped! Processing and uploading...');
    
    console.log('✅ Recording stopped, waiting for upload...');
    
    // Wait for upload to complete
    setTimeout(() => {
      showIdleUI();
      console.log('Upload should be complete, showing idle UI');
    }, 4000);
    
  } catch (error) {
    console.error('❌ Error stopping recording:', error);
    
    // Even if stop fails, try to reset state
    isRecording = false;
    stopDurationTimer();
    
    showError(error.message || 'Error stopping recording. Upload may still be in progress.');
    
    // Force reset after error
    setTimeout(() => {
      showIdleUI();
    }, 3000);
  }
}

// Duration timer
function startDurationTimer() {
  durationInterval = setInterval(() => {
    recordingDuration++;
    updateDurationDisplay();
  }, 1000);
}

function stopDurationTimer() {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
}

function updateDurationDisplay() {
  const durationEl = document.getElementById('duration');
  if (durationEl) {
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = recordingDuration % 60;
    durationEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Show error message
function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="alert alert-error">
      <strong>Error</strong>
      ${message}
    </div>
    <div class="button-group">
      <button class="button button-primary" onclick="forceReset()">Reset</button>
      <button class="button button-secondary" onclick="location.reload()">Reload</button>
    </div>
    <div class="debug-info">
      If issue persists, reload extension at chrome://extensions/
    </div>
  `;
}

// Force reset recording state
async function forceReset() {
  console.log('Force resetting...');
  
  isRecording = false;
  recordingDuration = 0;
  stopDurationTimer();
  
  try {
    await chrome.runtime.sendMessage({
      type: 'FORCE_STOP',
      tabId: currentTab?.id
    });
  } catch (err) {
    // Ignore errors
  }
  
  location.reload();
}

window.forceReset = forceReset;

// Show success message
function showSuccess(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="alert alert-success">
      <strong>Success</strong>
      ${message}
    </div>
    <button class="button button-primary" onclick="openDashboard()">View in Dashboard</button>
  `;
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:3000/recordings' });
  window.close();
}

// Open login page
function openLogin() {
  chrome.tabs.create({ url: 'http://localhost:3000/signin' });
  window.close();
}

// Cleanup on popup close
window.addEventListener('unload', () => {
  stopDurationTimer();
});

