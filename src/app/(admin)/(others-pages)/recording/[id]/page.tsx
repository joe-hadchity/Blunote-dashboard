"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meeting as ApiMeeting } from "@/components/tables/MeetingsTable";
import { MeetingDetailShimmer } from "@/components/common/ShimmerLoader";
import AIAnalytics from "@/components/recording/AIAnalytics";

// Icons
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const TranscriptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const AIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

// Platform logos
const GoogleMeetLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#00832d" d="M12.43 14.99H18.5v-3.52h-6.07Z"/><path fill="#0066da" d="M6.54 18.5v-9.45l6.07 4.72Z"/><path fill="#e53935" d="M6.54 9.05V5.5h11.96v9.56l-5.89-4.51Z"/><path fill="#ffb400" d="M5.5 12.43v6.07h9.45Z"/><path fill="none" d="M0 0h24v24H0Z"/></svg>;
const ZoomLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#2D8CFF" d="M5,3C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5c0-1.105-0.895-2-2-2H5z M17.211,15.293l-2.296-2.296l2.296-2.296c0.391-0.391,0.391-1.024,0-1.414s-1.024-0.391-1.414,0l-2.296,2.296L11.204,9.293c-0.391-0.391-1.024-0.391-1.414,0s-0.391,1.024,0,1.414l2.296,2.296L9.79,15.293c-0.391,0.391-0.391,1.024,0,1.414s1.024,0.391,1.414,0l2.296-2.296l2.296,2.296c0.391,0.391,1.024,0.391,1.414,0S17.602,15.684,17.211,15.293z"/></svg>;
const TeamsLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4F52B2" d="M13.04,14.28h-3.9v-2.07c0-1.28.62-1.9,1.95-1.9s1.95.62,1.95,1.9v2.07Zm-1.46-4.54a.75.75,0,1,1,.75-.75a.75.75,0,0,1-.75-.75Z"/><path fill="#4F52B2" d="M22.5,9.63a1,1,0,0,0-1-1H16V5.8a1,1,0,0,0-1-1H3.5a1,1,0,0,0-1,1v12.4a1,1,0,0,0,1,1h11.4a1,1,0,0,0,1-1V13.12h5.53a1,1,0,0,0,1-1v-2.5Zm-10-2.35c0-2.4,1.38-3.79,3.8-3.79s3.8,1.39,3.8,3.79v1.89h-7.6Z"/></svg>;
const SlackLogo = () => <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#36C5F0" d="M9.7,14.25a2.5,2.5,0,0,1-2.5,2.5V19a5,5,0,0,0,5-5h-2.25A2.5,2.5,0,0,1,9.7,14.25Z"/><path fill="#2EB67D" d="M9.75,9.7a2.5,2.5,0,0,1-2.5-2.5V5a5,5,0,0,0,5,5V7.25A2.5,2.5,0,0,1,9.75,9.7Z"/><path fill="#ECB22E" d="M14.25,9.7a2.5,2.5,0,0,1,2.5-2.5h2.25a5,5,0,0,0-5,5v2.25A2.5,2.5,0,0,1,14.25,9.7Z"/><path fill="#E01E5A" d="M14.3,14.25a2.5,2.5,0,0,1,2.5,2.5V19a5,5,0,0,0-5-5V11.75a2.5,2.5,0,0,1,2.5,2.5Z"/></svg>;

export default function RecordingPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<ApiMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'insights'>('overview');

  // Fetch recording details from API
  useEffect(() => {
    const fetchRecording = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/recordings/${params.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Recording not found');
          } else {
            setError('Failed to load recording');
          }
          return;
        }

        const data = await response.json();
        setMeeting(data.meeting); // API returns as 'meeting' for compatibility
        setIsFavorite(data.meeting.isFavorite || false);
        setEditedTitle(data.meeting.title || '');
        setEditedDescription(data.meeting.description || '');
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError('Failed to load recording');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRecording();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push('/recordings');
  };

  const handleDelete = async () => {
    if (!meeting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/recordings/${meeting.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to delete recording');
      }

      // Success - redirect
      window.location.href = '/recordings';
    } catch (err: any) {
      console.error('Error deleting recording:', err);
      alert('Failed to delete recording: ' + err.message);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!meeting || !editedTitle.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/recordings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editedTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      setMeeting({ ...meeting, title: editedTitle.trim() });
      setIsEditingTitle(false);
    } catch (err: any) {
      alert('Failed to update title: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!meeting) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/recordings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: editedDescription.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update description');
      }

      setMeeting({ ...meeting, description: editedDescription.trim() });
      setIsEditingDescription(false);
    } catch (err: any) {
      alert('Failed to update description: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!meeting) return;
    
    const newFavoriteState = !isFavorite;
    
    try {
      const response = await fetch(`/api/recordings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isFavorite: newFavoriteState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setIsFavorite(newFavoriteState);
      setMeeting({ ...meeting, isFavorite: newFavoriteState });
    } catch (err: any) {
      alert('Failed to update favorite: ' + err.message);
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
      'OTHER': 'Other',
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
            {error || 'Recording Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The recording you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon />
            Go Back to Recordings
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
      {/* Clean Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Back button + Actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon />
              <span>Back to Recordings</span>
            </button>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-lg text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <svg className="w-5 h-5 fill-yellow-500 text-yellow-500" viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {/* Title - Editable */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-3xl font-bold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-white focus:outline-none pb-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditedTitle(meeting.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
              <button onClick={handleSaveTitle} disabled={isSaving} className="p-1.5 text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button onClick={() => { setEditedTitle(meeting.title); setIsEditingTitle(false); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-3xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
              title="Click to edit"
            >
              {meeting.title}
            </h1>
          )}

          {/* Description - Editable */}
          {isEditingDescription ? (
            <div className="flex items-start gap-2 mb-4">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="flex-1 text-sm bg-transparent border-b border-blue-500 text-gray-600 dark:text-gray-400 focus:outline-none resize-none pb-1"
                rows={2}
                autoFocus
                placeholder="Add description..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                  if (e.key === 'Escape') {
                    setEditedDescription(meeting.description || '');
                    setIsEditingDescription(false);
                  }
                }}
              />
              <button onClick={handleSaveDescription} disabled={isSaving} className="p-1.5 text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button onClick={() => { setEditedDescription(meeting.description || ''); setIsEditingDescription(false); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
              title="Click to edit"
            >
              {meeting.description || 'Add description...'}
            </p>
          )}

          {/* Metadata - Minimalistic */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            {meeting.platform && (
              <div className="flex items-center gap-1.5">
                <PlatformLogo />
                <span>{getPlatformName(meeting.platform)}</span>
              </div>
            )}
            {meeting.duration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(meeting.duration)}</span>
              </>
            )}
            {meeting.startTime && (
              <>
                <span>•</span>
                <span>{new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section Navigation - 2 Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveSection('overview')}
              className={`py-4 border-b-2 transition-colors ${
                activeSection === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Recording & Transcript</span>
                {(meeting as any).speakerCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {(meeting as any).speakerCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveSection('insights')}
              className={`py-4 border-b-2 transition-colors ${
                activeSection === 'insights'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Insights</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Section Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Section 1: Overview (Recording + Transcript Together) */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Video Player */}
            {meeting.hasVideo && meeting.recordingUrl && (
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <div className="relative aspect-video">
                  <video
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    <source src={meeting.recordingUrl} type="video/mp4" />
                    <source src={meeting.recordingUrl} type="video/webm" />
                    <source src={meeting.recordingUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {(!meeting.hasVideo && (meeting.audioUrl || meeting.recordingUrl)) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m-2.828-9.9a9 9 0 000 12.728" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Audio Recording
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDuration(meeting.duration)}
                    </p>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/webm" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/ogg" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/mpeg" />
                    <source src={meeting.audioUrl || meeting.recordingUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Transcript - Right Below Player */}
            {meeting.hasTranscript && (meeting as any).transcriptSegments ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Conversation Transcript
                    </h2>
                    {(meeting as any).speakerCount > 0 && (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                        {(meeting as any).speakerCount} {(meeting as any).speakerCount === 1 ? 'speaker' : 'speakers'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-8 space-y-6 max-h-[700px] overflow-y-auto">
                  {(meeting as any).transcriptSegments.map((segment: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Speaker {segment.speaker}
                        </span>
                      </div>
                      <p className="flex-1 text-sm text-gray-900 dark:text-gray-100 leading-relaxed pt-1.5">
                        {segment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : !meeting.hasTranscript && (meeting as any).transcriptionStatus ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center">
                {(meeting as any).transcriptionStatus === 'PROCESSING' ? (
                  <>
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Transcribing Audio
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Using AI to detect speakers and transcribe conversation...
                    </p>
                  </>
                ) : (
                  <>
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Transcript Pending
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Transcript will appear here after transcription completes.
                    </p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Section 2: AI Insights */}
        {activeSection === 'insights' && (
          <AIAnalytics
            recordingId={meeting.id}
            hasTranscript={meeting.hasTranscript}
            initialSummary={(meeting as any).aiSummary}
            initialKeyPoints={(meeting as any).keyPoints}
            initialActionItems={(meeting as any).actionItems}
            initialSentiment={(meeting as any).sentiment}
          />
        )}
      </div>

      {/* Delete Modal - Clean & Minimal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Delete this recording?
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

