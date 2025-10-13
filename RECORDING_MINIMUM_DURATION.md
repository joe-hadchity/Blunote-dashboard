# 30-Second Minimum Recording Rule

## ✅ What Was Implemented

A **30-second minimum duration** rule for recordings with smart warnings and automatic discard for short recordings.

---

## 🎯 How It Works

### **Rule:**
- Recordings **must be at least 30 seconds** to be saved
- Shorter recordings are **automatically discarded** (not uploaded)
- User is **warned before stopping** a short recording

### **Implementation Locations:**

1. **Web App Widget** (`src/layout/SidebarWidget.tsx`)
   - Shows live warning when under 30s
   - Beautiful modal dialog before discarding
   - Two options: "Continue Recording" or "Discard & Stop"

2. **Meeting Page Widget** (`extension/background/service-worker.js`)
   - Browser confirm() dialog when stopping early
   - Clear warning message

3. **Extension Backend** (`extension/background/service-worker.js`)
   - Enforces minimum at upload time
   - Automatically discards if under 30s
   - Shows notification when discarded

---

## 📊 User Experience

### **When Recording is UNDER 30 seconds:**

#### **In Web App Sidebar Widget:**
```
┌─────────────────────────┐
│ [Logo] Bluenote    🎤   │
│        ● Recording      │
│                         │
│       00:15             │ ← Current time
│   Meeting Title         │
│                         │
│ ⚠️ Min. 30s required    │ ← Warning badge
│                         │
│  [■ Stop Recording]     │
│                         │
│ Record 15s more to save │ ← Helpful text
└─────────────────────────┘
```

**When user clicks Stop:**
```
┌─────────────────────────────────┐
│          ⚠️                      │
│   Recording Too Short            │
│                                  │
│ Your recording is only 15s long. │
│ Minimum 30s required to save.    │
│                                  │
│ If you stop now, this recording  │
│ will NOT be saved.               │
│                                  │
│  [Continue Recording]            │ ← Primary action
│  [Discard & Stop Anyway]         │ ← Destructive action
└─────────────────────────────────┘
```

#### **In Meeting Page Widget:**
```
Browser confirm dialog:
┌─────────────────────────────────┐
│ Recording is only 15 seconds    │
│ long.                           │
│                                 │
│ Minimum 30 seconds required     │
│ to save.                        │
│                                 │
│ This recording will NOT be      │
│ saved. Continue?                │
│                                 │
│        [Cancel] [OK]            │
└─────────────────────────────────┘
```

### **When Recording is 30+ seconds:**

✅ **No warnings shown**
✅ **Stop button works normally**
✅ **Recording uploads and saves**
✅ **Success notification shown**

---

## 🔧 Technical Details

### **Enforcement Points:**

1. **Frontend Warning (Web App)**
   - Checks duration before stop
   - Shows modal if < 30s
   - Sends `DISCARD_RECORDING` message if user confirms

2. **Frontend Warning (Meeting Page)**
   - Checks duration before stop
   - Shows confirm() if < 30s
   - Sends `DISCARD_RECORDING` message if confirmed

3. **Backend Check (Extension)**
   - Double-checks duration when stopping
   - Automatically sets discard flag if < 30s
   - Skips upload entirely if discarding

4. **Upload Handler**
   - Final safety check before upload
   - Shows notification if discarded
   - Clean cleanup without saving

### **Code Locations:**

| File | Function | Purpose |
|------|----------|---------|
| `SidebarWidget.tsx` | `handleStopClick()` | Check duration, show modal |
| `SidebarWidget.tsx` | `discardRecording()` | Send discard message |
| `service-worker.js` | `handleStopRecording(discard)` | Process stop/discard |
| `service-worker.js` | `handleRecordingComplete()` | Skip upload if discarded |
| `app-bridge.js` | Message forwarding | Bridge web app ↔ extension |

### **Message Flow:**

#### Normal Stop (30+ seconds):
```
User clicks Stop
  ↓
STOP_RECORDING_REQUEST
  ↓
Extension stops recording
  ↓
Upload audio
  ↓
Save to database
  ↓
Success notification
```

#### Discard (<30 seconds):
```
User clicks Stop (< 30s)
  ↓
Warning modal shown
  ↓
User clicks "Discard & Stop"
  ↓
DISCARD_RECORDING_REQUEST
  ↓
Extension stops recording
  ↓
Skip upload (discard = true)
  ↓
Clean up session
  ↓
Discard notification
```

---

## 🎨 Visual Feedback

### **Warning Badge (Under 30s):**
- Amber/yellow background
- Clear message: "Min. 30s required to save"
- Positioned above Stop button
- Only shows when under threshold

### **Dynamic Info Text:**
- **Under 30s:** "Record 15s more to save" (counts down)
- **30+ seconds:** "Auto-saving to dashboard"

### **Modal Dialog:**
- Professional warning icon (⚠️)
- Clear headline: "Recording Too Short"
- Exact duration shown
- Two clear action buttons:
  - **Primary (blue):** Continue Recording
  - **Destructive (red):** Discard & Stop Anyway

### **Notifications:**

**Discarded:**
```
🗑️ Recording Discarded
Recording was too short (15s). Minimum 30s required.
```

**Saved (30+):**
```
✅ Recording Saved!
Your recording has been saved and is being processed.
```

---

## 🧪 Testing Guide

### **Test Case 1: Short Recording (< 30s)**

1. Start recording
2. Wait 15 seconds
3. Try to stop from web app
4. **Expected:** Warning modal appears
5. Click "Continue Recording"
6. **Expected:** Modal closes, recording continues
7. Click Stop again
8. Click "Discard & Stop Anyway"
9. **Expected:** Recording stops, NOT saved, discard notification

### **Test Case 2: Valid Recording (30+ seconds)**

1. Start recording
2. Wait 35 seconds
3. Try to stop from web app
4. **Expected:** No warning, stops immediately
5. **Expected:** Upload starts, success notification

### **Test Case 3: Meeting Page Widget**

1. Start recording in Google Meet
2. Wait 10 seconds
3. Click Stop in floating widget
4. **Expected:** Browser confirm dialog
5. Click "Cancel"
6. **Expected:** Recording continues
7. Click Stop again
8. Click "OK"
9. **Expected:** Recording stops, NOT saved

### **Test Case 4: Exactly 30 Seconds**

1. Start recording
2. Wait exactly 30 seconds
3. Try to stop
4. **Expected:** No warning, saves successfully

---

## 📝 Configuration

### **Change Minimum Duration:**

Edit in 2 places:

**1. Web App Widget** (`src/layout/SidebarWidget.tsx`):
```typescript
const MIN_RECORDING_DURATION = 30; // Change to desired seconds
```

**2. Extension** (`extension/background/service-worker.js`):
```javascript
const MIN_RECORDING_DURATION = 30; // Must match web app
```

**3. Floating Widget** (`extension/background/service-worker.js`):
```javascript
const MIN_DURATION = 30; // In createFloatingWidget function
```

⚠️ **Important:** Keep all 3 values synchronized!

---

## ✨ Benefits

### **For Users:**
- ✅ Clear feedback before losing work
- ✅ Prevents accidental short recordings
- ✅ Saves storage and processing costs
- ✅ Better quality control

### **For System:**
- ✅ Reduces junk recordings
- ✅ Saves bandwidth (no upload)
- ✅ Saves storage space
- ✅ Better transcription quality (longer = better)

### **For Support:**
- ✅ Fewer "why wasn't it saved?" questions
- ✅ Clear user expectations
- ✅ Consistent behavior everywhere

---

## 🚀 Ready to Test!

1. Reload Chrome extension
2. Refresh web app (`localhost:3000`)
3. Start a test recording
4. Try stopping before 30 seconds
5. See the beautiful warning modal! 🎉

**The 30-second rule is now fully enforced across all recording methods!**


