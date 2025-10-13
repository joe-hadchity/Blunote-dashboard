"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meeting as ApiMeeting } from "@/components/tables/MeetingsTable";
import { MeetingDetailShimmer } from "@/components/common/ShimmerLoader";

// Icons
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const TranscriptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const AIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;

// Platform logos
const GoogleMeetLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#00832d" d="M12.43 14.99H18.5v-3.52h-6.07Z"/><path fill="#0066da" d="M6.54 18.5v-9.45l6.07 4.72Z"/><path fill="#e53935" d="M6.54 9.05V5.5h11.96v9.56l-5.89-4.51Z"/><path fill="#ffb400" d="M5.5 12.43v6.07h9.45Z"/><path fill="none" d="M0 0h24v24H0Z"/></svg>;
const ZoomLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#2D8CFF" d="M5,3C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5c0-1.105-0.895-2-2-2H5z M17.211,15.293l-2.296-2.296l2.296-2.296c0.391-0.391,0.391-1.024,0-1.414s-1.024-0.391-1.414,0l-2.296,2.296L11.204,9.293c-0.391-0.391-1.024-0.391-1.414,0s-0.391,1.024,0,1.414l2.296,2.296L9.79,15.293c-0.391,0.391-0.391,1.024,0,1.414s1.024,0.391,1.414,0l2.296-2.296l2.296,2.296c0.391,0.391,1.024,0.391,1.414,0S17.602,15.684,17.211,15.293z"/></svg>;
const TeamsLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4F52B2" d="M13.04,14.28h-3.9v-2.07c0-1.28.62-1.9,1.95-1.9s1.95.62,1.95,1.9v2.07Zm-1.46-4.54a.75.75,0,1,1,.75-.75a.75.75,0,0,1-.75-.75Z"/><path fill="#4F52B2" d="M22.5,9.63a1,1,0,0,0-1-1H16V5.8a1,1,0,0,0-1-1H3.5a1,1,0,0,0-1,1v12.4a1,1,0,0,0,1,1h11.4a1,1,0,0,0,1-1V13.12h5.53a1,1,0,0,0,1-1v-2.5Zm-10-2.35c0-2.4,1.38-3.79,3.8-3.79s3.8,1.39,3.8,3.79v1.89h-7.6Z"/></svg>;
const SlackLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#36C5F0" d="M9.7,14.25a2.5,2.5,0,0,1-2.5,2.5V19a5,5,0,0,0,5-5h-2.25A2.5,2.5,0,0,1,9.7,14.25Z"/><path fill="#2EB67D" d="M9.75,9.7a2.5,2.5,0,0,1-2.5-2.5V5a5,5,0,0,0,5,5V7.25A2.5,2.5,0,0,1,9.75,9.7Z"/><path fill="#ECB22E" d="M14.25,9.7a2.5,2.5,0,0,1,2.5-2.5h2.25a5,5,0,0,0-5,5v2.25A2.5,2.5,0,0,1,14.25,9.7Z"/><path fill="#E01E5A" d="M14.3,14.25a2.5,2.5,0,0,1,2.5,2.5V19a5,5,0,0,0-5-5V11.75a2.5,2.5,0,0,1,2.5,2.5Z"/></svg>;

// Mock transcript data
const mockTranscript = [
  { time: "00:00", speaker: "John", text: "Welcome everyone to today's weekly project sync meeting." },
  { time: "00:15", speaker: "Sarah", text: "Thanks John. I'd like to start by reviewing our progress on the Q4 deliverables." },
  { time: "00:32", speaker: "Mike", text: "We've completed 80% of the user interface updates. The remaining work should be done by Friday." },
  { time: "01:05", speaker: "John", text: "That's great progress Mike. Sarah, how are we looking on the backend integration?" },
  { time: "01:18", speaker: "Sarah", text: "The API endpoints are ready, but we're still waiting for the third-party service to approve our integration request." },
  { time: "01:45", speaker: "Mike", text: "I can follow up with them today. We have a good relationship with their technical team." },
  { time: "02:12", speaker: "John", text: "Perfect. Let's also discuss the upcoming client presentation next week." },
  { time: "02:28", speaker: "Sarah", text: "I've prepared the demo environment and all the key features are working smoothly." },
  { time: "02:55", speaker: "Mike", text: "I'll have the updated documentation ready by Monday for the client review." },
  { time: "03:20", speaker: "John", text: "Excellent work everyone. Let's schedule our next check-in for Wednesday at the same time." },
];

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<ApiMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'audio-transcript' | 'ai'>('audio-transcript');
  const [activeAITab, setActiveAITab] = useState<'summary' | 'chat'>('summary');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'ai', message: string, timestamp: Date}>>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowMoreActions(false);
      }
    };

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreActions]);

  // Fetch meeting details from API
  useEffect(() => {
    const fetchMeeting = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/meetings/${params.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Meeting not found');
          } else {
            setError('Failed to load meeting');
          }
          return;
        }

        const data = await response.json();
        setMeeting(data.meeting);
        setIsFavorite(data.meeting.isFavorite);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Failed to load meeting');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMeeting();
    }
  }, [params.id]);

  // Action functions
  const handleToggleFavorite = async () => {
    if (!meeting) return;
    
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/favorite`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.meeting.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCopyLink = () => {
    const meetingUrl = window.location.href;
    navigator.clipboard.writeText(meetingUrl).then(() => {
      // You could replace this with a toast notification
      console.log('Meeting link copied to clipboard!');
    }).catch(() => {
      console.error('Failed to copy link');
    });
  };

  const handleCopyTranscript = () => {
    const transcriptText = mockTranscript.map(item => 
      `[${item.time}] ${item.speaker}: ${item.text}`
    ).join('\n');
    
    navigator.clipboard.writeText(transcriptText).then(() => {
      // You could replace this with a toast notification
      console.log('Transcript copied to clipboard!');
    }).catch(() => {
      console.error('Failed to copy transcript');
    });
  };

  const handleExportTranscript = () => {
    const transcriptText = mockTranscript.map(item => 
      `[${item.time}] ${item.speaker}: ${item.text}`
    ).join('\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting?.title || 'meeting'}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRecording = () => {
    // Mock download - in real app, this would download the actual recording
    console.log('Downloading recording...');
    // You could replace this with a toast notification
  };

  const handleDeleteMeeting = async () => {
    if (!meeting) return;
    
    if (confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/meetings/${meeting.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          router.push('/recordings');
        } else {
          alert('Failed to delete meeting');
        }
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting');
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (type: 'video' | 'audio' | 'transcript') => {
    console.log(`Downloading ${type} for meeting ${meeting?.id}`);
    // In a real app, this would trigger an actual download
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: chatMessage,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: `Based on the meeting data, I can help you with that. The meeting covered topics like project progress, backend integration, and client presentation planning. How can I assist you further?`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format duration from minutes to readable string
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Helper function to get platform name
  const getPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      'GOOGLE_MEET': 'Google Meet',
      'ZOOM': 'Zoom',
      'MICROSOFT_TEAMS': 'Microsoft Teams',
      'SLACK': 'Slack',
    };
    return names[platform] || platform;
  };

  // Loading state
  if (isLoading) {
    return <MeetingDetailShimmer />;
  }

  // Error state
  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Meeting Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The meeting you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon />
            Go Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  const PlatformLogo = () => {
    const platform = getPlatformName(meeting.platform);
    switch (platform) {
      case 'Google Meet': return <GoogleMeetLogo />;
      case 'Zoom': return <ZoomLogo />;
      case 'Microsoft Teams': return <TeamsLogo />;
      case 'Slack': return <SlackLogo />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.title}</h1>
                {meeting.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{meeting.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <PlatformLogo />
                    <span>{getPlatformName(meeting.platform)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.type === 'VIDEO' ? <VideoIcon /> : <AudioIcon />}
                    <span className="capitalize">{meeting.type.toLowerCase()}</span>
                  </div>
                  <span>{formatDuration(meeting.duration)}</span>
                  <span>{new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {meeting.hasTranscript && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  Transcript
                </span>
              )}
              {meeting.hasSummary && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                  AI Summary
                </span>
              )}
              {meeting.hasVideo && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                  Video File
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-6">
              {/* Primary Actions */}
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <StarIcon />
              </button>
              
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Copy meeting link"
              >
                <LinkIcon />
              </button>
              
              <button
                onClick={handleCopyTranscript}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Copy transcript"
              >
                <CopyIcon />
              </button>
              
              {/* More Actions Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="More actions"
                >
                  <MoreVerticalIcon />
                </button>
                
                {showMoreActions && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          handleExportTranscript();
                          setShowMoreActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <FileTextIcon />
                        Export Transcript (.txt)
                      </button>
                      
                      <button
                        onClick={() => {
                          handleDownloadRecording();
                          setShowMoreActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <DownloadIcon />
                        Download Recording
                      </button>
                      
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={() => {
                          handleDeleteMeeting();
                          setShowMoreActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                      >
                        <TrashIcon />
                        Delete Meeting
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {meeting.hasVideo && meeting.type === 'VIDEO' && (
              <button
                onClick={() => setActiveTab('video')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'video'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <VideoIcon />
                  Video
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('audio-transcript')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audio-transcript'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AudioIcon />
                Audio & Transcript
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AIIcon />
                AI Analytics
              </div>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        {activeTab === 'video' && meeting.hasVideo && meeting.type === 'VIDEO' && (
          <div className="bg-black rounded-lg overflow-hidden">
            {meeting.recordingUrl ? (
              <div className="relative aspect-video">
                {/* HTML5 Video Player */}
                <video
                  controls
                  className="w-full h-full"
                  poster=""
                  preload="metadata"
                >
                  <source src={meeting.recordingUrl} type="video/mp4" />
                  <source src={meeting.recordingUrl} type="video/webm" />
                  <source src={meeting.recordingUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="relative aspect-video">
                {/* No Video Available */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                      <VideoIcon />
                    </div>
                    <p className="text-lg font-medium">No Video File</p>
                    <p className="text-sm text-gray-400">Video not available for this meeting</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audio-transcript' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Player */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audio Player</h3>
              {(meeting.audioUrl || meeting.recordingUrl) ? (
                <div className="w-full">
                  {/* HTML5 Audio Player */}
                  <audio
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/mpeg" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/wav" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/ogg" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/webm" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/m4a" />
                    Your browser does not support the audio element.
                  </audio>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Audio extracted from the meeting recording
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <AudioIcon />
                  </div>
                  <p className="font-medium">No Audio File</p>
                  <p className="text-sm mt-1">Audio not available for this meeting</p>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Transcript</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {meeting.hasTranscript ? 'Synchronized with audio playback' : 'Transcript not available'}
                </p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {meeting.hasTranscript ? (
                  <>
                    {mockTranscript.map((entry, index) => (
                      <div key={index} className={`mb-4 last:mb-0 p-3 rounded-lg transition-colors ${
                        index === 2 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {entry.time}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 dark:text-white">{entry.speaker}:</span>
                            <p className="text-gray-700 dark:text-gray-300 mt-1">{entry.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        📝 This is sample transcript data. Real transcript parsing will be available soon.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <TranscriptIcon />
                    <p className="mt-2">No transcript available for this meeting</p>
                    <p className="text-sm mt-1">Transcription can be added after the meeting is recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg">
                {/* AI Tab Navigation */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-6">
                    <button
                      onClick={() => setActiveAITab('summary')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeAITab === 'summary'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <SummaryIcon />
                        Summary
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveAITab('chat')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeAITab === 'chat'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ChatIcon />
                        Chat
                      </div>
                    </button>
                  </nav>
                </div>

                {/* AI Content */}
                <div className="p-6">
                  {activeAITab === 'summary' && (
                    <div className="space-y-6">
                      {meeting.aiSummary && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Meeting Summary</h4>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300">
                              {meeting.aiSummary}
                            </p>
                          </div>
                        </div>
                      )}

                      {meeting.keyPoints && meeting.keyPoints.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Points</h4>
                          <ul className="space-y-2">
                            {meeting.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-gray-700 dark:text-gray-300">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meeting.actionItems && meeting.actionItems.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Action Items</h4>
                          <ul className="space-y-2">
                            {meeting.actionItems.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(!meeting.aiSummary && (!meeting.keyPoints || meeting.keyPoints.length === 0) && (!meeting.actionItems || meeting.actionItems.length === 0)) && (
                        <div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
                            <AIIcon />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            AI Analytics Coming Soon
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            AI-powered meeting analytics will automatically generate summaries, extract key points, and identify action items.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="text-blue-600 dark:text-blue-400 mb-2">📝</div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Auto Summaries</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">AI generates concise meeting summaries</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="text-green-600 dark:text-green-400 mb-2">✅</div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Action Items</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Extracts tasks and responsibilities</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="text-purple-600 dark:text-purple-400 mb-2">🎯</div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Key Insights</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Identifies important discussion points</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeAITab === 'chat' && (
                    <div className="h-96 flex flex-col">
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {chatHistory.length === 0 ? (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <ChatIcon />
                            <p className="mt-2">Start a conversation about this meeting</p>
                          </div>
                        ) : (
                          chatHistory.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="flex gap-2">
                        <textarea
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about this meeting..."
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          rows={2}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <SendIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Sidebar */}
            <div className="space-y-6">
              {/* Meeting Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meeting Insights</h3>
                <div className="space-y-4">
                  {meeting.sentiment && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sentiment</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{meeting.sentiment}</p>
                    </div>
                  )}
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{meeting.participants.join(', ')}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDuration(meeting.duration)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{meeting.status.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  {meeting.topics && meeting.topics.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Topics</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {meeting.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Downloads</h3>
                <div className="space-y-3">
                  {meeting.recordingUrl && meeting.hasVideo && (
                    <a
                      href={meeting.recordingUrl}
                      download
                      className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <VideoIcon />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Video File</span>
                      </div>
                      <DownloadIcon />
                    </a>
                  )}
                  {meeting.audioUrl && (
                    <a
                      href={meeting.audioUrl}
                      download
                      className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AudioIcon />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Audio File</span>
                      </div>
                      <DownloadIcon />
                    </a>
                  )}
                  {meeting.transcriptUrl && meeting.hasTranscript && (
                    <a
                      href={meeting.transcriptUrl}
                      download
                      className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TranscriptIcon />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Transcript</span>
                      </div>
                      <DownloadIcon />
                    </a>
                  )}
                  {!meeting.recordingUrl && !meeting.audioUrl && !meeting.transcriptUrl && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No files available for download
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
