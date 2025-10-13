# 🤖 Azure OpenAI Setup - AI Analytics & Chat

## 🎯 **What You'll Get**

After setup, every recording will have:

✅ **AI Summary** - Concise meeting summary  
✅ **Key Points** - Main topics discussed  
✅ **Action Items** - Tasks mentioned with assignees  
✅ **Sentiment Analysis** - POSITIVE/NEUTRAL/NEGATIVE  
✅ **AI Chat** - Ask questions about the meeting  

---

## 🚀 **Quick Setup (10 minutes)**

### **Step 1: Create Azure OpenAI Resource**

1. **Go to Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Create Azure OpenAI:**
   - Click "Create a resource"
   - Search for "Azure OpenAI"
   - Click "Azure OpenAI" → "Create"

3. **Configure:**
   - **Subscription:** Your subscription
   - **Resource Group:** Create new or use existing
   - **Region:** East US or West Europe (GPT-4 available)
   - **Name:** `bluenote-openai`
   - **Pricing tier:** S0 (Standard)

4. **Click:** "Review + Create" → "Create"

5. **Wait for deployment** (~2 minutes)

---

### **Step 2: Deploy GPT-4 Model**

1. **After deployment, go to resource**

2. **Click "Model deployments"** (left sidebar)

3. **Click "+ Create new deployment"**

4. **Configure deployment:**
   - **Select model:** `gpt-4` (or `gpt-4-turbo` if available)
   - **Deployment name:** `gpt-4` (remember this!)
   - **Version:** Latest
   - **Deployment type:** Standard
   - Click "Create"

5. **Wait for deployment** (~1 minute)

---

### **Step 3: Get Credentials**

1. **In your Azure OpenAI resource:**
   - Click "Keys and Endpoint" (left sidebar)

2. **Copy these 3 values:**
   - **KEY 1** (long string)
   - **Endpoint** (URL like: https://your-resource.openai.azure.com/)
   - **Deployment name** (what you named it, e.g., `gpt-4`)

---

### **Step 4: Add to .env.local**

Add these lines to your `.env.local` file:

```bash
# Azure OpenAI Service
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your_key_1_here
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**Example:**
```bash
AZURE_OPENAI_ENDPOINT=https://bluenote-openai.openai.azure.com/
AZURE_OPENAI_KEY=abc123def456ghi789jkl012mno345pqr678stu
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

---

### **Step 5: Restart Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

Should see in terminal:
```
✅ Azure OpenAI configured: gpt-4
```

---

## ✨ **How It Works**

### **Automatic After Transcription:**

```
1. Recording uploaded
   ↓
2. Audio transcribed (Azure Speech)
   ↓
3. Transcript saved with speakers
   ↓
4. User clicks "Generate AI Insights"
   ↓
5. Azure OpenAI analyzes transcript:
   - Generates summary
   - Extracts key points
   - Identifies action items
   - Analyzes sentiment
   ↓
6. Results displayed on page
   ↓
7. User can chat with AI about meeting
```

---

## 🎨 **UI Features**

### **1. Generate Insights Button**

After transcript is ready:
```
┌────────────────────────────────────┐
│         ✨                          │
│   AI-Powered Insights              │
│                                    │
│ Generate summary, key points,      │
│ action items, and sentiment        │
│                                    │
│   [✨ Generate AI Insights]        │
└────────────────────────────────────┘
```

### **2. Analytics Display**

After generation:
```
┌────────────────────────────────────┐
│ AI Summary              POSITIVE    │
│                                    │
│ This productive Q4 planning        │
│ meeting covered the product        │
│ roadmap, timelines, and key        │
│ milestones. Team aligned on...     │
└────────────────────────────────────┘

┌──────────────┐ ┌───────────────────┐
│ Key Points   │ │ Action Items      │
│              │ │                   │
│ • Q4 roadmap │ │ ☐ Prepare spec    │
│ • Timeline   │ │   → Michael       │
│ • Milestones │ │ ☐ Design review   │
│ • Resources  │ │   → Sarah         │
└──────────────┘ └───────────────────┘
```

### **3. AI Chat**

```
┌────────────────────────────────────┐
│ 🤖 Chat with AI                 ▼  │
│────────────────────────────────────│
│                                    │
│ [You] What were the main           │
│       decisions?                   │
│                                    │
│ [AI] The team decided to focus     │
│      on three main areas: multi-   │
│      language support, real-time   │
│      transcription, and AI         │
│      summaries.                    │
│                                    │
│ [Ask about the meeting...]    [→]  │
└────────────────────────────────────┘
```

---

## 💰 **Pricing**

### **Azure OpenAI (GPT-4):**

| Model | Input | Output | Est. per Meeting |
|-------|-------|--------|------------------|
| GPT-4 | $0.03/1K tokens | $0.06/1K tokens | $0.10 - $0.30 |
| GPT-4 Turbo | $0.01/1K tokens | $0.03/1K tokens | $0.03 - $0.10 |

**Typical 15-minute meeting:**
- Transcript: ~1,500 words = ~2,000 tokens
- Analytics generation: ~3,000 tokens total
- **Cost:** ~$0.15 per meeting with GPT-4

**100 meetings/month:**
- GPT-4: ~$15/month
- GPT-4 Turbo: ~$5/month

**Recommendation:** Use **GPT-4 Turbo** for lower costs!

---

## 🧪 **Test It**

### **After adding credentials:**

1. **Record a meeting** (with audio/talking)
2. **Wait for transcription** to complete
3. **Open recording page**
4. **Click "✨ Generate AI Insights"**
5. **Wait ~10-30 seconds**
6. **See:**
   - Summary
   - Key points
   - Action items
   - Sentiment badge

7. **Click "Chat with AI"**
8. **Ask:** "What were the main decisions?"
9. **Get AI response** based on transcript!

---

## 📋 **Features Breakdown**

### **1. AI Summary**
```
Example:
"This productive Q4 planning meeting covered three 
main priorities: multi-language noise cancellation, 
real-time transcription features, and AI-powered 
summary generation. The team discussed timelines, 
resource allocation, and cost optimization strategies."
```

### **2. Key Points**
```
• Q4 priorities: languages, real-time, AI features
• Timeline: 6-8 weeks per language
• Cost optimization: tiered approach with GPT-3.5/4
• Technical approach: sliding window with local caching
• Dependencies: UI internationalization needed
```

### **3. Action Items**
```
☐ Prepare technical spec for real-time transcription
  → Michael (Due: Next Friday)

☐ Create AI summary prototype with cost estimates
  → Sarah (Due: Next Wednesday)

☐ Review UI implications for RTL languages
  → Design Team
```

### **4. Sentiment**
```
POSITIVE - Productive, collaborative tone
NEUTRAL - Factual discussion
NEGATIVE - Concerns raised, issues discussed
```

### **5. AI Chat Examples**

**Question:** "What did Speaker 2 say about the API?"

**Answer:** "Speaker 2 mentioned that 60% of existing customers have migrated to the new API, with average response times under 200ms. They also noted receiving requests for additional endpoints which have been documented."

**Question:** "What are the next steps?"

**Answer:** "The next steps are: 1) Michael will prepare a technical spec by next Friday, 2) Sarah will share an AI summary prototype by next Wednesday, and 3) The team will reconvene in two weeks to review progress."

---

## 🔍 **Debugging**

### **Check if configured:**

Backend logs should show:
```
✅ Azure OpenAI configured: gpt-4
```

If you see:
```
⚠️ Azure OpenAI not configured
```

Then:
1. Check .env.local has all 3 variables
2. Restart server
3. Check for typos in endpoint URL

### **Analytics not generating:**

**Check:**
1. Transcript exists? (has_transcript = true)
2. Azure OpenAI configured?
3. Model deployed in Azure?
4. Correct deployment name in .env.local?

**Backend logs:**
```
Generating analytics for recording: abc-123
Generating AI analytics...
✅ Analytics generated: {summaryLength: 234, ...}
```

---

## 📝 **Files Created**

1. ✅ `src/lib/azure-openai.ts` - Azure OpenAI integration
2. ✅ `src/app/api/recordings/[id]/analytics/route.ts` - Generate analytics API
3. ✅ `src/app/api/recordings/[id]/chat/route.ts` - AI chat API
4. ✅ `src/components/recording/AIAnalytics.tsx` - UI component
5. ✅ `AZURE_OPENAI_SETUP.md` - This guide!

---

## 🎯 **Quick Setup Checklist**

- [ ] Create Azure OpenAI resource
- [ ] Deploy GPT-4 or GPT-4 Turbo model
- [ ] Copy Endpoint, Key, Deployment name
- [ ] Add to .env.local
- [ ] Restart server (npm run dev)
- [ ] Check logs for "✅ Azure OpenAI configured"
- [ ] Record & transcribe a meeting
- [ ] Click "Generate AI Insights"
- [ ] Test AI chat feature

---

## 🚀 **What's Next**

Once AI analytics works:

1. **Auto-generate on transcription** - No manual click needed
2. **Save to database** - Persist insights
3. **Email summaries** - Send to participants
4. **Export reports** - PDF with all insights
5. **Compare meetings** - Track trends over time
6. **Custom prompts** - User-defined analysis

---

## 💡 **Pro Tips**

1. **Use GPT-4 Turbo** - 70% cheaper, similar quality
2. **Cache analytics** - Don't regenerate unnecessarily
3. **Batch process** - Process multiple recordings together
4. **Monitor costs** - Track token usage in Azure
5. **Test thoroughly** - Ensure prompts work for your meetings

---

**Add your Azure OpenAI credentials to `.env.local` and restart!** 🤖

Then generate AI insights for your first recording! ✨




