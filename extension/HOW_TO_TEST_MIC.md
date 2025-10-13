# 🎙️ How to Test Microphone

## 🚨 IMPORTANT: Do This First

Your recordings are empty because audio is not being detected. Let's test if the problem is:
- Your microphone
- Chrome permissions
- The extension code

---

## 🧪 Test Option 1: Use Test Page

### Step 1: Open Test Page

```
1. In your extension folder, find: test-microphone.html
2. Right-click it → "Open with" → Chrome
3. Or just drag the file into Chrome
```

### Step 2: Run Test

```
1. Click "Start Test"
2. Chrome will ask: "Allow microphone?" → Click "Allow"
3. TALK LOUDLY into your mic: "Testing one two three"
4. Watch the bars and level percentage
```

### Step 3: Results

**✅ If bars move and level goes above 0%:**
- Your microphone WORKS!
- Chrome CAN access it!
- Problem is in the extension code

**❌ If bars stay flat and level stays 0%:**
- Microphone permission denied
- OR microphone is muted/disabled
- OR wrong microphone selected

**❌ If you get "NotAllowedError":**
- Chrome blocked microphone access
- Need to allow it in settings

---

## 🧪 Test Option 2: Run Code in Console

### Step 1: Open Offscreen Console

```
chrome://extensions → Bluenote → "Inspect views: offscreen"
```

### Step 2: Paste This Code

Copy and paste this in the console:

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ MIC WORKS!');
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    
    console.log('TALK INTO MIC NOW!');
    
    setInterval(() => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const level = Math.round((sum / data.length / 255) * 100);
      console.log('MIC LEVEL:', level + '%');
    }, 500);
  })
  .catch(err => console.error('❌ MIC FAILED:', err.name, err.message));
```

### Step 3: Talk and Watch

- Talk loudly into mic
- Watch console for "MIC LEVEL: X%"
- Should go above 0% when you talk!

---

## 🎯 What Each Result Means

### Result 1: "✅ MIC WORKS!" and levels > 0%
```
Meaning: Microphone is fine, Chrome can access it
Next: Problem is in extension code
Action: Share this result with me
```

### Result 2: "✅ MIC WORKS!" but levels stay 0%
```
Meaning: Permission OK but no audio detected
Causes:
- Microphone muted in system
- Wrong microphone selected
- Microphone hardware issue
Action: Check Windows/Mac sound settings
```

### Result 3: "❌ MIC FAILED: NotAllowedError"
```
Meaning: Chrome permission denied
Action: 
1. chrome://settings/content/microphone
2. Add site to "Allowed"
3. Try again
```

### Result 4: "❌ MIC FAILED: NotFoundError"
```
Meaning: No microphone found
Action: Connect a microphone to your computer
```

---

## 📊 Checklist Before Testing

- [ ] Microphone is plugged in (if external)
- [ ] Microphone is not muted in system settings
- [ ] Correct microphone is selected in system
- [ ] Google Meet can access your mic (you can talk in Meet)
- [ ] Chrome is updated to latest version

---

## 🚀 Do This NOW

1. ✅ Open `extension/test-microphone.html` in Chrome
2. ✅ Click "Start Test"
3. ✅ Allow microphone
4. ✅ Talk loudly
5. ✅ Share screenshot or result with me

OR

1. ✅ Paste the code in offscreen console
2. ✅ Talk loudly
3. ✅ Share console output with me

**This will tell us if it's a mic/permission issue or code issue!** 🔍

