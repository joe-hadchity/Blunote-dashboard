# 🚨 FINAL DEBUG STEPS - Please Follow EXACTLY

## ⚠️ Current Situation
- Audio level shows 0%
- Recordings are empty
- Mic works in Google Meet

---

## 🎯 Let's Find the Problem

I've created multiple ways to test. Please try these IN ORDER:

---

## ✅ TEST 1: Standalone Microphone Test (Easiest)

### Do This:

1. **Open the test file:**
   ```
   extension/test-microphone.html
   ```
   - Right-click → Open with Chrome
   - OR drag it into Chrome browser

2. **Click "Start Test"**

3. **Allow microphone** when Chrome asks

4. **Talk loudly** into your mic

5. **Take a screenshot** of the result and share with me

**Expected:**
- Bars should move up when you talk
- Audio Level should show 30-60% when talking
- Should show 0-5% when silent

**If this works:** Mic is fine, problem is in extension
**If this doesn't work:** Mic permission or system issue

---

## ✅ TEST 2: Console Test (Quick)

### Do This:

1. **Open offscreen console:**
   ```
   chrome://extensions → Bluenote → "Inspect views: offscreen"
   ```

2. **Paste this code** and press Enter:

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(s => {
    console.log('✅ MIC WORKS');
    const c = new AudioContext();
    const a = c.createAnalyser();
    c.createMediaStreamSource(s).connect(a);
    const d = new Uint8Array(a.frequencyBinCount);
    setInterval(() => {
      a.getByteFrequencyData(d);
      const l = Math.round((d.reduce((a,b)=>a+b,0)/d.length/255)*100);
      console.log('LEVEL:', l + '% - TALK NOW!');
    }, 500);
  })
  .catch(e => console.error('❌ FAILED:', e.name, e.message));
```

3. **TALK LOUDLY** into your mic

4. **Share the output** - does it show level > 0%?

---

## ✅ TEST 3: Check What Console Actually Says

### Do This:

1. **Reload extension**
2. **Open offscreen console** (keep it open!)
3. **Join Google Meet**
4. **Start recording** in extension
5. **IMMEDIATELY copy ALL the text** from console
6. **Paste it here** so I can see

I need to see the EXACT messages, specifically:
- Does it say "✅ Microphone stream obtained"?
- Does it say "✅ Mixed stream created"?
- Does it show any "🎵 Audio level:" messages?
- Does it show "📼 Audio chunk:" messages?
- What are the actual numbers?

---

## 📋 Quick Diagnosis

**Answer these YES/NO questions:**

1. Did you reload the extension? (YES/NO)
2. Did Chrome ask for microphone permission? (YES/NO)
3. Did you click "Allow"? (YES/NO)
4. Can you see "Inspect views: offscreen" under Bluenote? (YES/NO)
5. Did you open that offscreen console? (YES/NO)
6. Are you in an active Google Meet call? (YES/NO)
7. Is your mic unmuted in Meet? (YES/NO)
8. When you talk, do others in Meet hear you? (YES/NO)

---

## 🚨 Most Likely Causes

### Cause 1: Extension Doesn't Have Mic Permission
**Check:** On Google Meet page, click camera icon 🎥 in address bar
**Fix:** Make sure microphone is "Allowed" for the page

### Cause 2: Offscreen Document Can't Access Mic
**Check:** Did you see a Chrome popup asking for mic when you started recording?
**Fix:** If no popup appeared, permission was auto-denied

### Cause 3: Audio Context Not Working
**Check:** Console shows errors about AudioContext
**Fix:** Share console output with me

### Cause 4: Wrong Microphone Selected
**Check:** Windows Sound Settings → Input → Test your microphone
**Fix:** Select the correct microphone

---

## 💡 Emergency: Just Make Recording Work

If you just want recordings to work RIGHT NOW (without your mic):

**Edit extension/offscreen.js, find line 66-78:**

```javascript
// 2. Get MICROPHONE stream (your voice)
let micStream = null;
try {
  micStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
  console.log('✅ Microphone stream obtained:', micStream.getAudioTracks().length, 'tracks');
} catch (micError) {
  console.warn('⚠️ Could not access microphone:', micError.message);
  console.log('Continuing with tab audio only (you won\'t hear your own voice in recording)');
}
```

**Replace with:**

```javascript
// Skip microphone for now - just record tab audio
let micStream = null;
console.log('⚠️ Microphone disabled - recording tab audio only');
```

This will:
- ✅ Record tab audio (others talking)
- ❌ NOT record your voice
- ✅ At least recordings won't be empty

---

## 🎯 What I Need From You

**Please do ONE of these and share the result:**

1. Open `test-microphone.html` and share screenshot
2. OR run the console test code and share output
3. OR copy the COMPLETE offscreen console log and paste it

**I can't help further without seeing what's actually happening!** 🔍

---

**Which test will you try?** Tell me and I'll guide you through it!

