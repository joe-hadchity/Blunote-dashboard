# 🎙️ Azure Speech Recognition Setup

## 🚀 Quick Setup (5 minutes)

### **Step 1: Create Azure Speech Resource**

1. **Go to Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Create Speech Service:**
   - Click "Create a resource"
   - Search for "Speech"
   - Click "Speech Services"
   - Click "Create"

3. **Configure:**
   - **Subscription:** Select your subscription
   - **Resource Group:** Create new or use existing
   - **Region:** Choose closest to you (e.g., East US, West Europe)
   - **Name:** `bluenote-speech` (or any name)
   - **Pricing tier:** F0 (Free) or S0 (Standard)
   - Click "Review + Create"

4. **Get Credentials:**
   - After deployment, go to resource
   - Click "Keys and Endpoint" (left sidebar)
   - Copy **KEY 1** and **REGION**

---

### **Step 2: Add to .env.local**

Add these lines to your `.env.local` file:

```bash
# Azure Speech Service
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=eastus
```

**Example:**
```bash
AZURE_SPEECH_KEY=abc123def456ghi789jkl012mno345pqr
AZURE_SPEECH_REGION=eastus
```

---

### **Step 3: Install Azure SDK**

Run in your terminal:
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

---

### **Step 4: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🎯 **What You'll Get**

✅ **Automatic Transcription** - Starts as soon as recording uploads  
✅ **Word-level timestamps** - Know when each word was said  
✅ **Speaker diarization** - Identify different speakers (optional)  
✅ **High accuracy** - Azure has industry-leading accuracy  
✅ **Multiple languages** - Auto-detects language  

---

## 💰 **Pricing**

### **Free Tier (F0):**
- 5 audio hours free per month
- Standard transcription
- Perfect for testing!

### **Standard Tier (S0):**
- $1 per audio hour
- Same features as free
- No monthly limit

**Estimate:** 100 recordings × 5 minutes each = ~8 hours/month = $8/month

---

## 🔑 **Finding Your Credentials**

### **Azure Speech Key:**
```
Portal → Speech Service → Keys and Endpoint → KEY 1
```

### **Azure Speech Region:**
```
Portal → Speech Service → Keys and Endpoint → Location/Region
```

Common regions:
- `eastus` - East US
- `westus` - West US  
- `westeurope` - West Europe
- `southeastasia` - Southeast Asia
- `australiaeast` - Australia East

---

## ✅ **Verification**

After adding credentials, the backend will log:
```
✅ Azure Speech configured: eastus
```

After first transcription:
```
Starting transcription for recording: abc-123-uuid
Transcription completed: 1234 words, 5.2 minutes
```

---

## 🐛 **Troubleshooting**

### **Error: "Invalid subscription key"**
- Check if key is correct (no spaces)
- Make sure you copied KEY 1 (not KEY 2)
- Check if service is active

### **Error: "Invalid region"**
- Region must match where you created the service
- No spaces, lowercase only
- Common: `eastus`, `westeurope`

### **No transcription happening:**
- Check `.env.local` has both variables
- Restart dev server
- Check backend logs for errors

---

## 📖 **Next Steps**

After adding credentials:
1. Upload a new recording via extension
2. Check backend logs
3. Should see "Starting transcription..."
4. Wait ~30 seconds for short recording
5. Refresh recording page
6. Transcript should appear! 🎉

---

**Add the credentials to .env.local now!** 🔑




