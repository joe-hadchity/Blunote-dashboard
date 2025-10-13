# 🚨 CRITICAL: Debug Audio Level at 0%

## ⚠️ Issue: Audio level shows 0%

This means the audio analyzer is not detecting any audio. Let's find out why.

---

## 🔍 Step 1: Check Console Output

After reloading and starting recording, look in **offscreen console** for:

### **What you MUST see:**

```
🎙️ Starting recording with TAB + MICROPHONE for tab: 123
✅ Tab audio stream obtained: 1 tracks
✅ Microphone stream obtained: 1 tracks  ← IMPORTANT!
🔧 Mixing tab audio + microphone...
✅ Mixed stream created (tab + mic)
Mixed stream tracks: 1  ← MUST BE 1 or more!
✅ Audio visualization started
🎵 Starting audio level monitoring, buffer length: 128
✅ Audio monitoring interval started
🎬 MediaRecorder start() called

Then every second:
🎵 Audio level: X% (avg: XX, max: XX)  ← SHOULD BE > 0 when audio plays!
```

### **If you see:**

```
❌ PROBLEM 1: Microphone not obtained
✅ Tab audio stream obtained: 1 tracks
⚠️ Could not access microphone: NotAllowedError  ← Permission denied!

Solution: Chrome didn't grant mic permission. You need to allow it!
```

```
❌ PROBLEM 2: No audio level logs
(No "🎵 Audio level: X%" messages appear)

Solution: Analyzer not working or not connected properly
```

```
❌ PROBLEM 3: Audio level always 0%
🎵 Audio level: 0% (avg: 0.0, max: 0)  ← No audio detected!

Solution: 
- Make sure audio is PLAYING
- Make sure you're TALKING into mic
- Make sure mic is not muted
```

---

## 🧪 Step 2: Test Audio Sources

### Test A: Is Microphone Working?

**In Google Meet:**
1. Look at the microphone icon
2. Is it muted? (red slash icon) ❌
3. Unmute it
4. Talk - do you see your profile picture light up?
5. If YES → mic is working ✅

### Test B: Is Tab Audio Working?

**In Google Meet:**
1. Ask someone to talk
2. Can you HEAR them?
3. If YES → tab audio works ✅
4. If NO → check your speakers/headphones

---

## 🔧 Step 3: Check Microphone Permission

### **Option A: Check Chrome Settings**

```
1. Click the padlock 🔒 icon in address bar (Google Meet page)
2. Look for "Microphone"
3. Should say "Allow" (not "Block")
4. If blocked, change to "Allow"
5. Reload the page
```

### **Option B: Check chrome://settings**

```
1. Go to: chrome://settings/content/microphone
2. Look under "Allowed"
3. Make sure Google Meet is listed
4. Also check if extension needs permission
```

---

## 💡 Step 4: Manual Test

In the **offscreen console**, run this test:

```javascript
// Test if we can get microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ MIC TEST SUCCESS:', stream.getAudioTracks().length, 'tracks');
    const track = stream.getAudioTracks()[0];
    console.log('Track:', {
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    });
    
    // Test analyzer
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const data = new Uint8Array(analyser.frequencyBinCount);
    
    setInterval(() => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      console.log('MIC LEVEL:', Math.round((avg / 255) * 100) + '%');
    }, 500);
    
  })
  .catch(err => {
    console.error('❌ MIC TEST FAILED:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
  });
```

**Run this in offscreen console, then TALK into your mic.**

**Expected result:**
```
✅ MIC TEST SUCCESS: 1 tracks
Track: { label: "...", enabled: true, muted: false, readyState: "live" }
MIC LEVEL: 0%
MIC LEVEL: 45%  ← When you talk!
MIC LEVEL: 38%
MIC LEVEL: 0%  ← When silent
```

**If you get error:**
```
❌ MIC TEST FAILED: NotAllowedError
→ Microphone permission denied!
```

---

## 🎯 Step 5: Test Tab Capture

In **offscreen console**, also test tab capture:

```javascript
// You need a streamId first - get it from background
// Then test:
navigator.mediaDevices.getUserMedia({
  audio: {
    mandatory: {
      chromeMediaSource: 'tab',
      chromeMediaSourceId: 'PASTE_STREAM_ID_HERE'
    }
  }
}).then(stream => {
  console.log('✅ TAB TEST SUCCESS');
  const track = stream.getAudioTracks()[0];
  console.log('Tab track:', {
    enabled: track.enabled,
    muted: track.muted,
    readyState: track.readyState
  });
}).catch(err => {
  console.error('❌ TAB TEST FAILED:', err);
});
```

---

## 📊 Likely Causes of 0%

| Cause | How to Check | Fix |
|-------|--------------|-----|
| **Mic permission denied** | Console shows "NotAllowedError" | Allow mic in Chrome settings |
| **Mic is muted in Meet** | Red slash on mic icon | Unmute in Google Meet |
| **No one is talking** | Silent meeting | Talk or have someone talk |
| **Analyser not connected** | No "🎵 Audio level" logs | Code issue - share console |
| **AudioContext suspended** | Check audioContext.state | Should auto-resume now |

---

## 🚀 Quick Test Sequence

1. **Reload extension** ✅
2. **Join Google Meet** ✅
3. **Unmute your mic in Meet** ✅
4. **Open offscreen console** ✅
5. **Start recording** ✅
6. **Chrome asks for mic permission** → Click "Allow" ✅
7. **TALK LOUDLY into mic** 🗣️
8. **Watch console** - should see audio levels > 0%
9. **Watch popup bars** - should move when you talk

---

## 📞 If Still 0%

**Copy and paste the COMPLETE output from offscreen console and share with me.**

Look for:
- Did it say "Microphone stream obtained"?
- Did it say "Mixed stream created"?
- Do you see "🎵 Audio level: X%" messages?
- What do the numbers show?

**Also share:**
- Are you in an active Google Meet call?
- Is your mic unmuted in Meet?
- Did Chrome ask for mic permission?
- Did you click "Allow"?

---

**Test now and share the console output!** 🔍

