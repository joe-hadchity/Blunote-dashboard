# Floating Recording Widget - Testing Guide

## 🎯 Quick Test

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "Bluenote - Meeting Recorder"
3. Click the **reload icon** (circular arrow)
4. Make sure it's **enabled** (toggle switch is on)

### Step 2: Open a Meeting
1. Go to Google Meet: `https://meet.google.com/new`
2. Start or join a meeting

### Step 3: Verify Content Script
1. **Open DevTools** on the meeting page (F12)
2. Go to **Console** tab
3. Look for these messages:
   ```
   Bluenote meeting detector loaded
   Bluenote content script initialized
   💡 Test the widget manually: bluenoteTest.showWidget()
   ```

### Step 4: Test Widget Manually (First)
**Before starting a recording**, test the widget manually:

1. In the **Console** of the meeting page, type:
   ```javascript
   bluenoteTest.showWidget()
   ```
2. **You should see a RED floating badge** in the top-right corner showing `● 00:00`
3. **Click the badge** to expand it
4. **Click "Minimize"** to collapse it back
5. **Click "Stop Recording"** to hide it (or use `bluenoteTest.hideWidget()`)

### Step 5: Test with Real Recording
1. Click the Bluenote extension icon (top-right of browser)
2. Edit the meeting title if desired
3. Click **"Start Recording"**
4. Close the popup
5. **The floating widget should appear automatically**

## 🐛 Troubleshooting

### Widget Not Appearing?

**1. Check if Content Script is Loaded:**
```javascript
// Run in meeting page console:
window.bluenoteTest
```
If this returns `undefined`, the content script isn't loaded. Reload both extension and page.

**2. Manually Trigger Widget:**
```javascript
// Run in meeting page console:
bluenoteTest.showWidget()
```
If this works, the issue is with message passing from background script.

**3. Check for Messages:**
Look in console for:
- `✅ Bluenote content script received message: RECORDING_STARTED`
- `🎙️ Starting recording widget...`
- `✅ Widget added to page`

**4. Check DOM:**
```javascript
// Run in meeting page console:
document.getElementById('bluenote-recording-widget')
```
Should return the widget element.

### Widget Appears But Doesn't Show Timer?

Check console for timer updates. You should see the timer element updating.

### Can't Stop Recording from Widget?

The "Stop Recording" button sends a message to the background script. Check the background service worker console for errors.

## 📝 Expected Behavior

### Compact Mode:
- Red gradient badge
- White pulsing dot
- Timer (MM:SS format)
- Hover effect (lifts slightly)

### Expanded Mode:
- White card with red header
- "Recording" label
- Large timer display
- Two buttons: "Stop Recording" and "Minimize"
- Close button (×) in header

### Interactions:
- **Click compact** → Expands
- **Click "×" or "Minimize"** → Collapses
- **Click "Stop Recording"** → Stops and removes widget

## 🔍 Debug Commands

```javascript
// Show widget
bluenoteTest.showWidget()

// Hide widget  
bluenoteTest.hideWidget()

// Toggle expanded/compact
bluenoteTest.toggleWidget()

// Check if widget exists
document.getElementById('bluenote-recording-widget')

// Manually trigger recording started message
chrome.runtime.sendMessage({type: 'RECORDING_STARTED'})
```

## ✅ Success Checklist

- [ ] Extension reloaded
- [ ] Meeting page opened
- [ ] Console shows content script loaded
- [ ] `bluenoteTest.showWidget()` shows the widget
- [ ] Widget can expand/collapse
- [ ] Widget shows live timer
- [ ] Recording auto-shows widget
- [ ] Can stop recording from widget
