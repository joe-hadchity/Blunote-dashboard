# 🧪 RUN THIS TEST IN CONSOLE

## 🎯 Copy and Paste This Code

### Step 1: Open Offscreen Console
```
chrome://extensions → Bluenote → "Inspect views: offscreen"
```

### Step 2: Copy This ENTIRE Code Block

**Paste this in the console and press Enter:**

```javascript
console.log('=== AUDIO TEST STARTING ===');

// Test 1: Can we get microphone?
console.log('\n--- TEST 1: Microphone Access ---');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(micStream => {
    console.log('✅ MICROPHONE WORKS!');
    console.log('Mic tracks:', micStream.getAudioTracks().length);
    const micTrack = micStream.getAudioTracks()[0];
    console.log('Mic track state:', {
      enabled: micTrack.enabled,
      muted: micTrack.muted,
      readyState: micTrack.readyState,
      label: micTrack.label
    });
    
    // Test 2: Can we analyze microphone audio?
    console.log('\n--- TEST 2: Microphone Audio Analysis ---');
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(micStream);
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    console.log('✅ ANALYZER CREATED');
    console.log('NOW TALK INTO YOUR MIC LOUDLY!');
    console.log('Checking audio levels for 10 seconds...\n');
    
    let checkCount = 0;
    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      let max = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
        if (dataArray[i] > max) max = dataArray[i];
      }
      const avg = sum / dataArray.length;
      const level = Math.round((avg / 255) * 100);
      
      console.log(`Sample ${checkCount + 1}: Level ${level}%, Avg ${avg.toFixed(1)}, Max ${max}`);
      
      checkCount++;
      if (checkCount >= 20) {
        clearInterval(interval);
        micStream.getTracks().forEach(t => t.stop());
        ctx.close();
        console.log('\n=== TEST COMPLETE ===');
        console.log('Did you see levels > 0 when talking? If YES, mic is working!');
        console.log('If levels stayed at 0, your mic has a problem or is muted.');
      }
    }, 500);
    
  })
  .catch(err => {
    console.error('❌ MICROPHONE FAILED!');
    console.error('Error:', err.name, '-', err.message);
    console.error('\nThis means:');
    console.error('- Permission was denied (NotAllowedError)');
    console.error('- OR no mic found (NotFoundError)');
    console.error('- OR mic is being used by another app');
    console.log('\n=== TEST FAILED ===');
  });
```

### Step 3: What to Do

After pasting and pressing Enter:

1. **TALK LOUDLY** into your microphone
2. Say "Testing one two three" repeatedly for 10 seconds
3. Watch the console output

---

## 📊 What You'll See

### ✅ **IF MICROPHONE WORKS:**

```
=== AUDIO TEST STARTING ===

--- TEST 1: Microphone Access ---
✅ MICROPHONE WORKS!
Mic tracks: 1
Mic track state: { enabled: true, muted: false, readyState: "live", label: "..." }

--- TEST 2: Microphone Audio Analysis ---
✅ ANALYZER CREATED
NOW TALK INTO YOUR MIC LOUDLY!
Checking audio levels for 10 seconds...

Sample 1: Level 0%, Avg 0.0, Max 0
Sample 2: Level 0%, Avg 0.0, Max 0
Sample 3: Level 42%, Avg 107.3, Max 198  ← WHEN YOU TALK!
Sample 4: Level 38%, Avg 96.8, Max 175   ← TALKING!
Sample 5: Level 5%, Avg 12.1, Max 34     ← STOPPED TALKING
Sample 6: Level 0%, Avg 0.0, Max 0
...

=== TEST COMPLETE ===
Did you see levels > 0 when talking? If YES, mic is working!
```

### ❌ **IF MICROPHONE BLOCKED:**

```
=== AUDIO TEST STARTING ===

--- TEST 1: Microphone Access ---
❌ MICROPHONE FAILED!
Error: NotAllowedError - Permission denied

This means:
- Permission was denied (NotAllowedError)

=== TEST FAILED ===
```

### ❌ **IF MIC WORKS BUT LEVELS STAY 0%:**

```
✅ MICROPHONE WORKS!
...
Sample 1: Level 0%, Avg 0.0, Max 0
Sample 2: Level 0%, Avg 0.0, Max 0
Sample 3: Level 0%, Avg 0.0, Max 0  ← STILL 0% EVEN WHEN TALKING!
...
```

This means:
- Mic permission is OK
- But mic is muted/disabled in system
- Or wrong mic is selected

---

## 🎯 After Running Test

**Tell me:**
1. Did you get "✅ MICROPHONE WORKS!" or "❌ MICROPHONE FAILED!"?
2. What error did you get (if any)?
3. When you talked, did levels go above 0%?
4. Share the complete console output from the test

---

## 💡 Common Solutions

### If "NotAllowedError":
```
Fix: Allow microphone permission
1. chrome://settings/content/microphone
2. Add to "Allowed" list
3. Try test again
```

### If levels stay 0% even when talking:
```
Fix: Check system mic settings
1. Windows: Settings → Sound → Input → Test your microphone
2. Mac: System Preferences → Sound → Input → Check levels
3. Make sure correct mic is selected
4. Make sure mic isn't muted in system
```

---

**RUN THE TEST ABOVE AND SHARE THE OUTPUT!** 🔍

This will tell us exactly what's wrong!

