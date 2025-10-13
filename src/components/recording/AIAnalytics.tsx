"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AIAnalyticsProps {
  recordingId: string;
  hasTranscript: boolean;
  initialSummary?: string;
  initialKeyPoints?: string[];
  initialActionItems?: Array<{ task: string; assignee?: string }>;
  initialSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export default function AIAnalytics({
  recordingId,
  hasTranscript,
  initialSummary,
  initialKeyPoints,
  initialActionItems,
  initialSentiment
}: AIAnalyticsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [keyPoints, setKeyPoints] = useState(initialKeyPoints || []);
  const [actionItems, setActionItems] = useState(initialActionItems || []);
  const [sentiment, setSentiment] = useState(initialSentiment);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenChat, setHasSeenChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if analytics exist (either from initial props or generated)
  const hasAnalytics = summary || keyPoints.length > 0 || actionItems.length > 0;

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  // Show tooltip briefly when component mounts (first time user sees it)
  useEffect(() => {
    if (hasAnalytics && hasTranscript && !hasSeenChat) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Hide after 5 seconds
        setTimeout(() => setShowTooltip(false), 5000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasAnalytics, hasTranscript, hasSeenChat]);
  
  // Show existing analytics if available
  const shouldShowGenerateButton = !hasAnalytics && hasTranscript;

  const handleGenerateAnalytics = async () => {
    if (!hasTranscript) {
      setError('Please wait for transcription to complete first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/recordings/${recordingId}/analytics`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate analytics');
      }

      const data = await response.json();
      
      setSummary(data.analytics.summary);
      setKeyPoints(data.analytics.keyPoints);
      setActionItems(data.analytics.actionItems);
      setSentiment(data.analytics.sentiment);

    } catch (err: any) {
      setError(err.message);
      console.error('Analytics error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !hasTranscript) return;

    const question = chatInput.trim();
    setChatInput('');
    setIsChatting(true);

    // Add user message
    const newMessages = [...chatMessages, { role: 'user' as const, content: question }];
    setChatMessages(newMessages);

    try {
      const response = await fetch(`/api/recordings/${recordingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          question,
          conversationHistory: chatMessages
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response
      setChatMessages([...newMessages, { role: 'assistant', content: data.answer }]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages([...newMessages, { 
        role: 'assistant', 
        content: `❌ ${err.message || 'Sorry, I encountered an error. Please try again.'}` 
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'NEGATIVE': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Generate/Regenerate Analytics Button */}
        {shouldShowGenerateButton && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generate AI Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Get AI-powered summary, key points, action items, and sentiment analysis
              </p>
              <button
                onClick={handleGenerateAnalytics}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Insights'
                )}
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Unable to Generate Insights</p>
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show placeholder if no transcript yet */}
        {!hasTranscript && !hasAnalytics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Transcript Required
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI insights will be available after transcription completes
            </p>
          </div>
        )}

        {/* Analytics Display */}
        {hasAnalytics && (
          <div className="space-y-6">
            {/* Summary Card - Full Width */}
            {summary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Summary
                      </h3>
                      {sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getSentimentColor()}`}>
                          {sentiment}
                        </span>
                      )}
                    </div>
                    {hasTranscript && (
                      <button
                        onClick={handleGenerateAnalytics}
                        disabled={isGenerating}
                        className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        title="Regenerate insights"
                      >
                        {isGenerating ? (
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            )}

            {/* Key Points & Action Items - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Key Points */}
              {keyPoints.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Key Points
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {keyPoints.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <ul className="space-y-3">
                      {keyPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 text-gray-400 dark:text-gray-500 text-sm font-medium mt-0.5">
                            {idx + 1}.
                          </span>
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Items */}
              {actionItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Action Items
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {actionItems.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <ul className="space-y-3.5">
                      {actionItems.map((item, idx) => (
                        <li key={idx} className="flex gap-3">
                          <input 
                            type="checkbox" 
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" 
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{item.task}</p>
                            {item.assignee && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.assignee}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Button - Bottom Right */}
      {hasAnalytics && hasTranscript && (
        <>
          {/* Chat Button */}
          <div 
            className={`fixed bottom-8 right-8 z-40 group ${showChat ? 'hidden' : 'block'}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Subtle pulse ring */}
            <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-pulse"></div>
            
            {/* Tooltip - appears on hover */}
            <div className={`absolute bottom-full right-0 mb-3 transition-all duration-200 ${
              showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}>
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                Ask AI about your meeting
                <div className="absolute top-full right-6 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
              </div>
            </div>
            
            {/* Main button */}
            <button
              onClick={() => {
                setShowChat(true);
                setHasSeenChat(true);
              }}
              className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Chat with AI"
            >
              {/* Chat icon */}
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              
              {/* Small AI badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-blue-600">
                <span className="text-[8px] font-bold text-blue-600">AI</span>
              </div>
              
              {/* Message count */}
              {chatMessages.length > 0 && (
                <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-md">
                  {chatMessages.length}
                </span>
              )}
            </button>
          </div>

          {/* Slide-in Chat Panel */}
          <div className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">AI Chat</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ask about this meeting</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/30">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Ask a question to get started
                  </p>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <button
                      onClick={() => setChatInput('What were the main decisions made?')}
                      className="px-4 py-2.5 text-left text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      What were the main decisions?
                    </button>
                    <button
                      onClick={() => setChatInput('Who participated the most?')}
                      className="px-4 py-2.5 text-left text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      Who spoke the most?
                    </button>
                    <button
                      onClick={() => setChatInput('What are the next steps?')}
                      className="px-4 py-2.5 text-left text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      What are the next steps?
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="bg-white dark:bg-gray-800 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Thinking...</p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400"
                  disabled={isChatting}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatting}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Backdrop when chat is open */}
          {showChat && (
            <div 
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
              onClick={() => setShowChat(false)}
            />
          )}
        </>
      )}
    </>
  );
}

