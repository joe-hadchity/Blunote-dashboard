# 🔧 Audio Level Showing 0% - Quick Fixes

## The Problem

Audio level shows 0% which means:
- ❌ No audio is being detected by the analyzer
- ❌ Either microphone has no audio OR tab has no audio OR both

---

## ✅ MOST COMMON FIX: Microphone Permission

### Check This First:

**On the Google Meet page:**
1. Look at Chrome's address bar
2. Do you see a camera icon 🎥 or mic icon 🎙️?
3. Click it
4. Check "Microphone" setting
5. Make sure it says "Allow" (not "Block")

**If it says "Block":**
```
1. Change to "Allow"
2. Reload the Google Meet page
3. Try recording again
4. Chrome should ask permission again
5. Click "Allow" this time!
```

---

## ✅ Quick Checklist

Before recording, verify ALL of these:

- [ ] **Google Meet mic is UNMUTED** (no red slash on mic icon in Meet)
- [ ] **Chrome mic permission is ALLOWED** (check address bar camera/mic icon)
- [ ] **You're in an active call** (not just on the homepage)
- [ ] **You talk LOUDLY** into mic (test: do others hear you?)
- [ ] **Extension is reloaded** (chrome://extensions → Reload)
- [ ] **Offscreen console is open** (to see debug logs)

---

## 🧪 Test Sequence

### Test 1: Check if Mic Works in Meet

```
1. Join Google Meet call
2. Unmute your mic in Meet
3. Talk - do you see your name/picture highlighted?
4. Ask others - can they hear you?
5. If YES → Mic is working in Meet ✅
6. If NO → Fix your mic in system settings
```

### Test 2: Grant Mic Permission to Extension

```
1. Reload extension
2. Join Meet
3. Start recording
4. Watch for Chrome popup asking for mic permission
5. Click "Allow" (NOT "Block"!)
6. If popup doesn't appear → permission already denied, need to reset
```

### Test 3: Check Console

**In offscreen console, look for:**

```
✅ GOOD (mic permission granted):
✅ Microphone stream obtained: 1 tracks

❌ BAD (mic permission denied):
⚠️ Could not access microphone: NotAllowedError
```

---

## 🎵 Expected Audio Levels

When working properly:

| Scenario | Audio Level |
|----------|-------------|
| **Silence** | 0-5% |
| **Background noise** | 5-15% |
| **Talking quietly** | 20-40% |
| **Talking normally** | 40-60% |
| **Talking loudly** | 60-80% |
| **Shouting** | 80-100% |

---

## 🚨 Emergency Fix: Reset Mic Permission

If you accidentally clicked "Block":

### Method 1: Reset for Google Meet

```
1. On Google Meet page, click padlock 🔒 in address bar
2. Click "Site settings"
3. Find "Microphone"
4. Set to "Allow"
5. Reload page
```

### Method 2: Reset in Chrome Settings

```
1. Go to: chrome://settings/content/microphone
2. Look under "Blocked"
3. Find Google Meet or your extension
4. Remove it from blocked list
5. Try again
```

---

## 📊 What to Share With Me

If audio level is still 0% after trying everything:

**Share these details:**

1. **Console output** (complete log from offscreen console)
2. **Does console say** "Microphone stream obtained"? (YES/NO)
3. **Does console say** "🎵 Audio level: 0%"? (or no audio level messages?)
4. **Microphone status in Meet** (muted/unmuted)
5. **Chrome mic permission** (allowed/blocked)
6. **Can others hear you in Meet?** (YES/NO)

---

## 🎯 Next Steps

1. ✅ Reload extension
2. ✅ Check mic permissions
3. ✅ Start recording (allow mic when asked)
4. ✅ Talk into mic
5. ✅ Share console output with me

**The console will tell us exactly what's wrong!** 🔍

