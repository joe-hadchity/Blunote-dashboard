import OpenAI from 'openai';

const apiKey = process.env.AZURE_OPENAI_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

let client: OpenAI | null = null;

if (endpoint && apiKey) {
  client = new OpenAI({
    apiKey: apiKey,
    baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
    defaultQuery: { 'api-version': '2024-02-15-preview' },
    defaultHeaders: { 'api-key': apiKey },
  });
  console.log('✅ Azure OpenAI configured:', deploymentName);
} else {
  console.warn('⚠️ Azure OpenAI not configured. AI features will be disabled.');
}

export function isAzureOpenAIConfigured(): boolean {
  return !!(endpoint && apiKey);
}

/**
 * Generate AI summary from transcript
 */
export async function generateSummary(transcript: string): Promise<string> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  const prompt = `You are an expert meeting assistant. Analyze this meeting transcript and provide a concise, professional summary.

Focus on:
- Main topics discussed
- Key decisions made
- Important points raised

Keep it clear and concise (3-5 sentences).

Transcript:
${transcript}

Summary:`;

  const result = await client.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a professional meeting assistant that creates clear, concise summaries.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return result.choices[0]?.message?.content || 'Unable to generate summary';
}

/**
 * Extract key points from transcript
 */
export async function extractKeyPoints(transcript: string): Promise<string[]> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  const prompt = `You are an expert meeting analyst. Extract the main key points from this meeting transcript.

Return ONLY a JSON array of strings, each being a concise key point. Maximum 8 key points.

Example format:
["Point 1", "Point 2", "Point 3"]

Transcript:
${transcript}

Key points (JSON array only):`;

  const result = await client.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a precise meeting analyst. Return only valid JSON arrays.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.2,
  });

  try {
    const content = result.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing key points:', err);
    return [];
  }
}

/**
 * Extract action items from transcript
 */
export async function extractActionItems(transcript: string): Promise<Array<{ task: string; assignee?: string }>> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  const prompt = `You are an expert meeting assistant. Extract action items from this meeting transcript.

Return ONLY a JSON array of objects with this format:
[
  {"task": "Task description", "assignee": "Person name or null"}
]

Maximum 10 action items. Only include clear, actionable tasks.

Transcript:
${transcript}

Action items (JSON array only):`;

  const result = await client.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a precise meeting assistant. Return only valid JSON arrays.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.2,
  });

  try {
    const content = result.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing action items:', err);
    return [];
  }
}

/**
 * Analyze sentiment of the meeting
 */
export async function analyzeSentiment(transcript: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  const prompt = `Analyze the overall sentiment of this meeting transcript.

Return ONLY one word: POSITIVE, NEUTRAL, or NEGATIVE

Transcript:
${transcript}

Sentiment:`;

  const result = await client.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a sentiment analyzer. Return only: POSITIVE, NEUTRAL, or NEGATIVE.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 10,
    temperature: 0.1,
  });

  const sentiment = result.choices[0]?.message?.content?.trim().toUpperCase();
  
  if (sentiment === 'POSITIVE' || sentiment === 'NEUTRAL' || sentiment === 'NEGATIVE') {
    return sentiment;
  }
  
  return 'NEUTRAL';
}

/**
 * Chat with AI about the meeting (ask questions)
 */
export async function chatAboutMeeting(
  transcript: string,
  question: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  const systemPrompt = `You are an AI meeting assistant with access to a meeting transcript. 
Answer questions about the meeting based ONLY on the transcript provided. 
Be concise, accurate, and helpful.
If the answer is not in the transcript, say so clearly.

Meeting Transcript:
${transcript}`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: question }
  ];

  const result = await client.chat.completions.create({
    messages: messages,
    max_tokens: 500,
    temperature: 0.5,
  });

  return result.choices[0]?.message?.content || 'Unable to generate response';
}

/**
 * Generate comprehensive analytics
 */
export async function generateAnalytics(transcript: string): Promise<{
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ task: string; assignee?: string }>;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}> {
  if (!client) {
    throw new Error('Azure OpenAI not configured');
  }

  console.log('Generating AI analytics...');

  // Run all analyses in parallel for speed
  const [summary, keyPoints, actionItems, sentiment] = await Promise.all([
    generateSummary(transcript),
    extractKeyPoints(transcript),
    extractActionItems(transcript),
    analyzeSentiment(transcript)
  ]);

  console.log('✅ Analytics generated:', {
    summaryLength: summary.length,
    keyPointsCount: keyPoints.length,
    actionItemsCount: actionItems.length,
    sentiment
  });

  return {
    summary,
    keyPoints,
    actionItems,
    sentiment
  };
}

