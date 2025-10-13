// Content script to bridge communication between extension and Bluenote web app
// This script runs on localhost:3000 pages to enable widget communication

console.log('Bluenote app bridge loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('App bridge received message:', message.type);
  
  // Forward recording status to the page
  if (message.type === 'RECORDING_STATUS') {
    window.postMessage({
      type: 'RECORDING_STATUS',
      isRecording: message.isRecording,
      duration: message.duration,
      title: message.title
    }, '*');
    sendResponse({ received: true });
    return false;
  }
  
  // Forward recording stopped message
  if (message.type === 'RECORDING_STOPPED') {
    window.postMessage({
      type: 'RECORDING_STATUS',
      isRecording: false,
      duration: 0
    }, '*');
    sendResponse({ received: true });
    return false;
  }
});

// Listen for messages from the page (React app)
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.origin !== window.location.origin) {
    return;
  }
  
  // Handle stop recording request from web app widget
  if (event.data.type === 'STOP_RECORDING_REQUEST') {
    console.log('Stop recording request from web app');
    
    // Forward to background script
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING'
    }, (response) => {
      console.log('Stop recording response:', response);
      
      // Notify page of result
      window.postMessage({
        type: 'STOP_RECORDING_RESPONSE',
        success: !response?.error,
        error: response?.error
      }, '*');
    });
  }
  
  // Handle discard recording request from web app widget
  if (event.data.type === 'DISCARD_RECORDING_REQUEST') {
    console.log('Discard recording request from web app');
    
    // Forward to background script
    chrome.runtime.sendMessage({
      type: 'DISCARD_RECORDING'
    }, (response) => {
      console.log('Discard recording response:', response);
      
      // Notify page of result
      window.postMessage({
        type: 'DISCARD_RECORDING_RESPONSE',
        success: !response?.error,
        error: response?.error
      }, '*');
    });
  }
});

console.log('Bluenote app bridge ready');

