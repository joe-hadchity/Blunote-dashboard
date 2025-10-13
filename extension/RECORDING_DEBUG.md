# 🔍 Recording Debug Guide

## 🐛 **Common Issues & Fixes**

### **Issue 1: Can't Start Recording**

**Symptoms:**
- Click "Start Recording" → Nothing happens
- Button says "Starting..." then goes back to "Start Recording"
- Error in console

**Check:**
1. **Popup Console** (Right-click icon → Inspect popup)
   ```javascript
   // Should see:
   Got stream ID: xyz123...
   
   // If you see error:
   Error starting recording: [error message]
   ```

2. **Background Console** (chrome://extensions → Service worker)
   ```javascript
   // Should see:
   Starting recording for tab: 12345
   Using stream ID: xyz123
   Offscreen document created
   Recording started successfully
   
   // If you see:
   Error starting recording: [error message]
   ```

**Common Fixes:**

- **Error: "Invalid tab ID"**
  - Close and reopen popup
  - Make sure you're on the meeting tab
  
- **Error: "Failed to get media stream ID"**
  - Reload extension
  - Check tab audio permissions
  
- **Error: "Not authenticated"**
  - Log in to http://localhost:3000
  - Keep that tab open

---

### **Issue 2: Can't Stop Recording**

**Symptoms:**
- Click "Stop Recording" → Nothing happens
- Recording never stops
- Upload never happens

**Check:**
1. **Background Console:**
   ```javascript
   // Should see when you click stop:
   Message received: STOP_RECORDING
   
   // Then:
   Handling recording completion
   Uploading recording...
   Upload successful
   ```

**Fix:**
- If offscreen document is missing → Reload extension
- If upload fails → Check backend is running
- If hangs → Check network tab for failed requests

---

### **Issue 3: Recording Stops Immediately**

**Symptoms:**
- Starts recording
- Immediately stops
- 0 bytes uploaded

**Check:**
1. **Offscreen Console** (chrome://extensions → offscreen.html)
   ```javascript
   // Should see:
   MediaRecorder started
   Audio chunk: 15234 bytes
   Audio chunk: 16789 bytes
   
   // If you see:
   MediaRecorder stopped (immediately)
   Final blob: 0 bytes
   ```

**Fix:**
- Tab might not have active audio
- Test with YouTube video playing
- Check tab audio is unmuted

---

### **Issue 4: Multiple Recordings Conflict**

**Symptoms:**
- Start second recording → Error
- "Already recording" message

**Fix:**
```javascript
// Reload extension to clear state:
chrome://extensions → Find Bluenote → Click Reload
```

---

## 🔧 **Quick Fixes**

### **Fix 1: Reload Extension**
```
1. Go to: chrome://extensions/
2. Find "Bluenote - Meeting Recorder"
3. Click 🔄 RELOAD button
4. Try recording again
```

### **Fix 2: Clear Extension State**
```
1. chrome://extensions/
2. Find Bluenote
3. Click "Service worker" → Console
4. Type: chrome.storage.local.clear()
5. Press Enter
6. Reload extension
```

### **Fix 3: Check All Consoles**
```
Open 3 console windows:

1. Popup Console:
   Right-click extension icon → Inspect popup

2. Background Console:
   chrome://extensions → Service worker → Inspect

3. Offscreen Console:
   chrome://extensions → Inspect views: offscreen.html
```

---

## 🎯 **Checklist Before Recording**

- [ ] Logged in to http://localhost:3000
- [ ] On Google Meet/Zoom/Teams page
- [ ] Meeting has active audio (someone speaking)
- [ ] Extension shows "Ready to Record"
- [ ] Backend server is running (npm run dev)

---

## 📋 **Expected Console Logs**

### **When you click "Start Recording":**

**Popup:**
```javascript
Got stream ID: chrome-extension://...
```

**Background:**
```javascript
Message received: START_RECORDING
Starting recording for tab: 12345
Using stream ID: xyz123... for tab: 12345
Offscreen document already exists, reusing it
Recording started successfully
```

**Offscreen:**
```javascript
Offscreen received message: START_RECORDING
Starting offscreen recording with stream ID: xyz123...
Audio stream obtained: 1 audio tracks
MediaRecorder started
Tab 12345 - Audio chunk: 15234 bytes, total: 1
Tab 12345 - Audio chunk: 16789 bytes, total: 2
```

### **When you click "Stop Recording":**

**Background:**
```javascript
Message received: STOP_RECORDING
```

**Offscreen:**
```javascript
Tab 12345 - Stopping recording...
Tab 12345 - MediaRecorder stopped
Tab 12345 - Final audio blob: 150000 bytes
Audio sent to background: 150000 bytes
```

**Background:**
```javascript
Handling recording completion for tab: 12345
Reconstructed audio blob: 150000 bytes
Uploading recording... 150000 bytes
Upload successful
Recording uploaded successfully
```

---

## 🐛 **Common Errors**

### **"Error: Only a single offscreen document may be created"**

**Fix:**
```javascript
// Already fixed in code, but if you see it:
// Reload extension
```

### **"TypeError: chrome.tabCapture.capture is not a function"**

**Fix:**
```javascript
// Already fixed - using getMediaStreamId instead
// Reload extension if you see this
```

### **"Error: No stream ID provided"**

**Fix:**
```javascript
// Permission issue
// Check chrome://extensions → Bluenote → Permissions
// Should have "tabCapture" permission
```

### **"Error: Not authenticated"**

**Fix:**
```
1. Open http://localhost:3000
2. Log in
3. Keep tab open
4. Try again
```

---

## 🔍 **What to Tell Me**

If recording still doesn't work, tell me:

1. **What happens when you click Start?**
   - Does button say "Starting..."?
   - Does it go back to "Start Recording"?
   - Any error message?

2. **Console logs:**
   - Any errors in popup console?
   - Any errors in background console?
   - Any errors in offscreen console?

3. **Recording status:**
   - Does it say "Recording..."?
   - Does timer start counting?
   - Can you see the red dot?

4. **Stop behavior:**
   - What happens when you click Stop?
   - Does it upload?
   - Any errors?

---

**Open all 3 consoles and try recording. Then tell me what errors you see!** 🔍




