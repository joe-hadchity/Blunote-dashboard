// Content Script - Detects meeting platform and info
// Runs on Google Meet, Zoom, and Teams pages

console.log('Bluenote meeting detector loaded');

// Detect which platform we're on
const detectPlatform = () => {
  const url = window.location.href;
  
  if (url.includes('meet.google.com')) {
    return 'GOOGLE_MEET';
  } else if (url.includes('zoom.us')) {
    return 'ZOOM';
  } else if (url.includes('teams.microsoft.com')) {
    return 'MICROSOFT_TEAMS';
  }
  
  return 'UNKNOWN';
};

// Extract meeting information
const extractMeetingInfo = () => {
  const platform = detectPlatform();
  let title = 'Untitled Meeting';
  let meetingId = '';
  
  try {
    if (platform === 'GOOGLE_MEET') {
      // Try to get meeting title from Google Meet UI
      const titleElement = document.querySelector('[data-meeting-title]') ||
                          document.querySelector('h1') ||
                          document.querySelector('.u6vdEc');
      
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
      
      // Extract meeting code from URL
      const urlMatch = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
      meetingId = urlMatch ? urlMatch[1] : '';
      
    } else if (platform === 'ZOOM') {
      // Try to get meeting title from Zoom
      const titleElement = document.querySelector('.meeting-topic') ||
                          document.querySelector('.meeting-title');
      
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
      
      // Extract meeting ID from URL
      const urlMatch = window.location.pathname.match(/\/j\/(\d+)/);
      meetingId = urlMatch ? urlMatch[1] : '';
      
    } else if (platform === 'MICROSOFT_TEAMS') {
      // Try to get meeting title from Teams
      const titleElement = document.querySelector('[data-tid="meeting-title"]') ||
                          document.querySelector('.ts-calling-screen-header-title');
      
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
    }
    
  } catch (error) {
    console.error('Error extracting meeting info:', error);
  }
  
  // If still untitled, use platform + timestamp
  if (title === 'Untitled Meeting' || !title) {
    const platformName = platform.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    title = `${platformName} Meeting - ${new Date().toLocaleString()}`;
  }
  
  return {
    title,
    platform,
    meetingId,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
};

// Recording widget state
let recordingStartTime = null;
let timerInterval = null;
let widgetExpanded = false;

// Create and inject floating recording widget
const showRecordingIndicator = () => {
  try {
    console.log('🎨 Creating floating widget...');
    
    // Remove existing indicator
    const existing = document.getElementById('bluenote-recording-widget');
    if (existing) {
      console.log('Removing existing widget');
      existing.remove();
    }
    
    // Clear existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    // Set start time
    recordingStartTime = Date.now();
    console.log('⏱️ Recording start time:', new Date(recordingStartTime).toLocaleTimeString());
    
    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'bluenote-recording-widget';
    widget.innerHTML = `
    <style>
      @keyframes bluenote-pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }
      @keyframes bluenote-fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .bluenote-widget-compact {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 10px 16px;
        border-radius: 12px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
        z-index: 999999;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        animation: bluenote-fade-in 0.3s ease;
      }
      .bluenote-widget-compact:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15);
      }
      .bluenote-rec-dot {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: bluenote-pulse-dot 2s ease-in-out infinite;
      }
      .bluenote-timer {
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.5px;
      }
      .bluenote-widget-expanded {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        animation: bluenote-fade-in 0.2s ease;
        overflow: hidden;
        border: 1px solid #e4e7ec;
      }
      .bluenote-widget-header {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .bluenote-widget-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .bluenote-widget-body {
        padding: 16px;
      }
      .bluenote-btn {
        padding: 8px 14px;
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
        width: 100%;
        margin-bottom: 8px;
      }
      .bluenote-btn-stop:hover {
        background: #b91c1c;
      }
      .bluenote-btn-minimize {
        background: white;
        color: #344054;
        border: 1px solid #d0d5dd;
        width: 100%;
      }
      .bluenote-btn-minimize:hover {
        background: #f9fafb;
      }
      .bluenote-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: background 0.15s ease;
      }
      .bluenote-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    </style>
    <div class="bluenote-widget-compact" id="bluenote-compact">
      <span class="bluenote-rec-dot"></span>
      <span class="bluenote-timer" id="bluenote-timer">00:00</span>
    </div>
  `;
  
    if (!document.body) {
      console.error('❌ Document body not ready, retrying in 500ms...');
      setTimeout(showRecordingIndicator, 500);
      return;
    }
    
    document.body.appendChild(widget);
    console.log('✅ Widget added to page');
    
    // Start timer
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    console.log('⏱️ Timer started');
    
    // Add click handler to toggle expanded view
    const compactWidget = widget.querySelector('#bluenote-compact');
    if (compactWidget) {
      compactWidget.addEventListener('click', toggleWidget);
      console.log('✅ Click handler added');
    }
    
    // Verify widget is visible
    setTimeout(() => {
      const check = document.getElementById('bluenote-recording-widget');
      if (check) {
        console.log('✅ Widget verified on page');
      } else {
        console.error('❌ Widget not found after creation!');
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ Error creating widget:', error);
  }
};

// Update timer display
const updateTimer = () => {
  if (!recordingStartTime) return;
  
  const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const timerElement = document.getElementById('bluenote-timer');
  if (timerElement) {
    timerElement.textContent = timeStr;
  }
};

// Toggle between compact and expanded view
const toggleWidget = () => {
  const widget = document.getElementById('bluenote-recording-widget');
  if (!widget) return;
  
  widgetExpanded = !widgetExpanded;
  
  if (widgetExpanded) {
    // Show expanded view
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    widget.innerHTML = `
      <div class="bluenote-widget-expanded">
        <div class="bluenote-widget-header">
          <div class="bluenote-widget-header-left">
            <span class="bluenote-rec-dot"></span>
            <div>
              <div style="font-size: 13px; font-weight: 600;">Recording</div>
              <div class="bluenote-timer" id="bluenote-timer" style="font-size: 18px; font-weight: 700; margin-top: 2px;">${timeStr}</div>
            </div>
          </div>
          <button class="bluenote-close-btn" id="bluenote-minimize-btn">×</button>
        </div>
        <div class="bluenote-widget-body">
          <button class="bluenote-btn bluenote-btn-stop" id="bluenote-stop-btn">Stop Recording</button>
          <button class="bluenote-btn bluenote-btn-minimize" id="bluenote-minimize-btn2">Minimize</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    widget.querySelector('#bluenote-stop-btn').addEventListener('click', stopRecordingFromWidget);
    widget.querySelector('#bluenote-minimize-btn').addEventListener('click', toggleWidget);
    widget.querySelector('#bluenote-minimize-btn2').addEventListener('click', toggleWidget);
  } else {
    // Show compact view
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    widget.innerHTML = `
      <div class="bluenote-widget-compact" id="bluenote-compact">
        <span class="bluenote-rec-dot"></span>
        <span class="bluenote-timer" id="bluenote-timer">${timeStr}</span>
      </div>
    `;
    
    widget.querySelector('#bluenote-compact').addEventListener('click', toggleWidget);
  }
};

// Stop recording from widget
const stopRecordingFromWidget = () => {
  // Send message to background to stop recording
  chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
    .then(response => {
      console.log('Recording stopped:', response);
    })
    .catch(error => {
      console.error('Error stopping recording:', error);
    });
};

// Remove recording indicator
const hideRecordingIndicator = () => {
  const widget = document.getElementById('bluenote-recording-widget');
  if (widget) {
    widget.remove();
  }
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  recordingStartTime = null;
  widgetExpanded = false;
};

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('✅ Bluenote content script received message:', message.type);
  
  try {
    switch (message.type) {
      case 'RECORDING_STARTED':
        console.log('🎙️ Starting recording widget...');
        showRecordingIndicator();
        console.log('✅ Recording widget shown');
        sendResponse({ success: true });
        break;
        
      case 'RECORDING_STOPPED':
        console.log('⏹️ Stopping recording widget...');
        hideRecordingIndicator();
        console.log('✅ Recording widget hidden');
        sendResponse({ success: true });
        break;
        
      case 'GET_MEETING_INFO':
        const meetingInfo = extractMeetingInfo();
        console.log('📋 Meeting info:', meetingInfo);
        sendResponse(meetingInfo);
        break;
        
      default:
        console.warn('⚠️ Unknown message type:', message.type);
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('❌ Error handling message:', error);
    sendResponse({ error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Send meeting info to background when page loads
setTimeout(() => {
  const meetingInfo = extractMeetingInfo();
  
  chrome.runtime.sendMessage({
    type: 'MEETING_DETECTED',
    data: meetingInfo
  }).catch(error => {
    console.log('Could not send meeting info:', error);
  });
}, 2000); // Wait 2s for page to load

console.log('Bluenote content script initialized');

// Make test functions available globally for debugging
window.bluenoteTest = {
  showWidget: () => {
    console.log('🧪 Testing widget display...');
    showRecordingIndicator();
  },
  hideWidget: () => {
    console.log('🧪 Hiding widget...');
    hideRecordingIndicator();
  },
  toggleWidget: () => {
    console.log('🧪 Toggling widget...');
    toggleWidget();
  }
};

console.log('💡 Test the widget manually: bluenoteTest.showWidget()');



