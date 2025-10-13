# 🚀 Extension Setup Guide - Quick Start

Get your Chrome Extension running in 5 minutes!

---

## ⚡ Quick Setup (3 Steps)

### **Step 1: Create Extension Icons** (1 minute)

You need 4 icon sizes. **Two options:**

**Option A: Use Online Generator (Easiest)**
1. Go to: https://www.favicon-generator.org/
2. Upload any logo/image
3. Download and extract
4. Copy these files to `extension/icons/`:
   - `favicon-16x16.png` → rename to `icon16.png`
   - `favicon-32x32.png` → rename to `icon32.png`
   - `android-icon-48x48.png` → rename to `icon48.png`
   - `android-icon-144x144.png` → rename to `icon128.png`

**Option B: Use Placeholder (Quick Test)**
1. Create a simple colored square in Paint/Photoshop
2. Save as PNG in 4 sizes: 16x16, 32x32, 48x48, 128x128
3. Name them: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
4. Put in `extension/icons/` folder

**Option C: Use Emoji (Fastest)**
1. Go to: https://emoji-to-png.com/
2. Select 🎙️ emoji
3. Download in all 4 sizes
4. Save to `extension/icons/`

---

### **Step 2: Make Sure Backend is Ready** (1 minute)

1. **Database Setup:**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/ALL-IN-ONE-SETUP.sql
   ```

2. **Storage Buckets:**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase-storage-setup.sql
   ```

3. **Backend Running:**
   ```bash
   npm run dev
   ```
   Should see: `http://localhost:3000`

---

### **Step 3: Load Extension** (1 minute)

1. **Open Chrome**
2. **Go to:** `chrome://extensions/`
3. **Enable "Developer mode"** (top-right toggle)
4. **Click "Load unpacked"**
5. **Select the `extension` folder:**
   ```
   C:\Users\JoeHadchity\Documents\Zaka Training\noise cancelation\free-nextjs-admin-dashboard\extension
   ```
6. **✅ Extension loaded!**

---

## 🧪 Test Your Extension

### Quick Test (2 minutes):

1. **Log into Bluenote:**
   - Open: `http://localhost:3000`
   - Sign in to your account

2. **Join a Test Meeting:**
   - Go to: `https://meet.google.com/new`
   - Click "Join now" or "Start an instant meeting"

3. **Start Recording:**
   - Click the Bluenote extension icon (should be in toolbar)
   - Popup shows "Ready to Record"
   - Click "🔴 Start Recording"
   - See red indicator on page: "Recording with Bluenote"

4. **Speak for 30 seconds:**
   - Say anything (test your mic)
   - Watch timer in extension popup

5. **Stop Recording:**
   - Click extension icon again
   - Click "⏹️ Stop Recording"
   - Wait for upload (few seconds)

6. **View Recording:**
   - Click "View Recordings" button
   - Or visit: `http://localhost:3000/recordings`
   - Your recording should appear!
   - Click to play it back

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Extension appears in `chrome://extensions/`
- [ ] Extension icon shows in toolbar
- [ ] Can open popup (click icon)
- [ ] Logged into Bluenote web app
- [ ] On a meeting page, popup shows "Ready to Record"
- [ ] Can start recording (red indicator appears)
- [ ] Timer counts up
- [ ] Can stop recording
- [ ] Upload succeeds (notification shows)
- [ ] Recording appears in dashboard

---

## 🐛 Common Issues

### "Failed to capture stream"

**Cause:** Chrome couldn't access tab audio

**Fix:**
- Refresh the meeting tab
- Make sure you're ON the meeting page (not just opened the tab)
- Click "Join" in the meeting first
- Try starting recording again

---

### "Not authenticated"

**Cause:** Extension can't find your login token

**Fix:**
1. Open Bluenote web app: `http://localhost:3000`
2. Log in
3. Keep that tab open
4. Try recording again

---

### "Upload failed"

**Cause:** Backend couldn't receive the file

**Fix:**
- Check backend is running: `npm run dev`
- Check terminal for errors
- Verify Storage buckets exist in Supabase
- Check API endpoint: `http://localhost:3000/api/extension/upload-recording`

---

### Extension not showing in meeting

**Cause:** Content script not loaded

**Fix:**
- Go to `chrome://extensions/`
- Click refresh icon on Bluenote
- Refresh the meeting tab
- Extension should load

---

## 🔧 Development Tips

### Debugging:

**Background Service Worker:**
```
1. Go to chrome://extensions/
2. Find Bluenote extension
3. Click "service worker" (blue link)
4. See console logs
```

**Content Script:**
```
1. On meeting page, press F12
2. Go to Console tab
3. Look for "Bluenote" logs
```

**Popup:**
```
1. Right-click extension icon
2. Select "Inspect popup"
3. Console shows popup logs
```

### Making Changes:

1. Edit files in `extension/` folder
2. Go to `chrome://extensions/`
3. Click refresh icon (🔄) on Bluenote
4. Popup/content changes: Reload immediately
5. Background changes: May need to remove & re-add extension

---

## 📊 What Gets Recorded

**Captured:**
- ✅ Meeting audio (all participants)
- ✅ Your microphone
- ✅ Meeting sounds/alerts

**Not Captured:**
- ❌ Video
- ❌ Screen shares (unless you enable video capture)
- ❌ Chat messages

**Metadata Collected:**
- Meeting title
- Platform (Google Meet/Zoom/Teams)
- Duration
- Timestamp
- Meeting URL (for linking)

---

## 🎯 Advanced Usage

### Auto-Start Recording:

Future feature - extension can auto-detect when you join a meeting and start recording automatically.

### Keyboard Shortcuts:

Add to `manifest.json`:
```json
"commands": {
  "start-recording": {
    "suggested_key": {
      "default": "Ctrl+Shift+R"
    },
    "description": "Start/Stop recording"
  }
}
```

### Custom Settings:

Edit in popup or add settings page for:
- Recording quality
- Noise reduction level
- Auto-transcription
- Notifications

---

## 🔄 Update Extension

When we release updates:

1. Pull latest code: `git pull`
2. Go to `chrome://extensions/`
3. Click refresh icon on Bluenote
4. New version loaded!

---

## 📦 Distribution

### Chrome Web Store (Future):

To publish:
1. Create developer account ($5 one-time)
2. Zip extension folder
3. Upload to Chrome Web Store
4. Users can install with one click

### Private Distribution (Now):

Share with team:
1. Zip the `extension` folder
2. Send to team members
3. They load as unpacked extension

---

## ✨ Features Roadmap

**v1.0 (Current):**
- ✅ Basic audio recording
- ✅ Google Meet, Zoom, Teams support
- ✅ Auto-upload to dashboard

**v1.1 (Next):**
- ⏳ Advanced noise cancellation (RNNoise)
- ⏳ Video capture option
- ⏳ Recording pause/resume

**v1.2 (Future):**
- ⏳ Real-time transcription
- ⏳ Live captions during meeting
- ⏳ Automatic meeting detection

**v2.0 (Advanced):**
- ⏳ Speaker separation
- ⏳ AI-powered highlights
- ⏳ Multi-track recording

---

## 🎉 You're Ready!

Extension is complete and functional. Load it in Chrome and start recording meetings!

**Test it now:**
1. Load extension
2. Join Google Meet test
3. Record 30 seconds
4. Check dashboard

**Works? Great! You now have auto-recording with noise cancellation!** 🎙️✨




