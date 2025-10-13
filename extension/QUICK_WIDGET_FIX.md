# Quick Fix for Widget

## The widget isn't showing because the content script isn't loaded.

## ✅ Fix Steps:

### 1. Reload Extension (IMPORTANT!)
1. Open new tab: `chrome://extensions/`
2. Find **"Bluenote - Meeting Recorder"**
3. Click the **circular reload icon** ↻
4. Wait for it to finish reloading

### 2. Close ALL Google Meet Tabs
- Close every Google Meet tab you have open
- This is important! Old tabs won't have the new script

### 3. Open Fresh Google Meet
1. Open NEW tab
2. Go to: `https://meet.google.com/new`
3. Start or join a meeting

### 4. Verify Script Loaded
1. Open DevTools on the meeting page (F12)
2. Go to Console tab
3. You MUST see these messages:
   ```
   Bluenote meeting detector loaded
   Bluenote content script initialized
   💡 Test the widget manually: bluenoteTest.showWidget()
   ```

4. If you DON'T see these messages:
   - The content script didn't load
   - Go back to step 1 and make sure extension is reloaded
   - Make sure you're on `meet.google.com`

### 5. Test Widget
In the Console, type:
```javascript
bluenoteTest.showWidget()
```

You should see a RED badge appear in top-right corner!

### 6. Try Recording
1. Click Bluenote extension icon
2. Click "Start Recording"
3. Widget should appear automatically

## 🔧 Still Not Working?

### Check Extension is Active:
```javascript
// Run in Console on meeting page:
chrome.runtime.id
```
Should return extension ID like: `abcdef123456...`

If it returns undefined, the extension isn't communicating with the page.

### Force Reload Everything:
1. `chrome://extensions/` → Remove Bluenote extension
2. Re-add it (Load unpacked → select extension folder)
3. Close all Google Meet tabs
4. Open fresh meeting
5. Check console for script loaded messages

## What the Widget Does:

**Compact (default):**
```
  ●  00:42   ← Click to expand
```

**Expanded:**
```
┌──────────────┐
│ ● Recording ×│
│    01:23     │
├──────────────┤
│Stop Recording│
│  Minimize    │
└──────────────┘
```


