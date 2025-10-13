import React, { useEffect, useState } from 'react';
import { EventFormState } from './types';
import { CSS_CLASSES } from './constants';
import { detectPlatformFromLink } from './utils';

interface SimpleMeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formState: EventFormState;
  onFormChange: (field: keyof EventFormState, value: string) => void;
}

export const SimpleMeetingFormModal: React.FC<SimpleMeetingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formState,
  onFormChange,
}) => {
  const [meetingId, setMeetingId] = useState<string>('');
  const [suggestedTitle, setSuggestedTitle] = useState<string>('');
  const [isParsingLink, setIsParsingLink] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // Function to parse Google Calendar event link
  const parseCalendarLink = async (url: string) => {
    if (!url.includes('calendar.app.google') && !url.includes('calendar.google.com/event')) {
      return null;
    }

    try {
      setIsParsingLink(true);
      const response = await fetch('/api/parse-calendar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setParsedData(result.data);
          
          // Auto-fill form fields
          if (result.data.title) {
            onFormChange('title', result.data.title);
          }
          if (result.data.description) {
            onFormChange('description', result.data.description);
          }
          if (result.data.startTime) {
            const startDate = new Date(result.data.startTime);
            const formatDateTime = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            onFormChange('startDate', formatDateTime(startDate));
          }
          if (result.data.endTime) {
            const endDate = new Date(result.data.endTime);
            const formatDateTime = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            onFormChange('endDate', formatDateTime(endDate));
          }
          if (result.data.meetingLink) {
            // Replace the calendar link with the actual Google Meet link
            onFormChange('meetingLink', result.data.meetingLink);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing calendar link:', error);
    } finally {
      setIsParsingLink(false);
    }
  };

  // Extract meeting ID and auto-fill details when link changes
  useEffect(() => {
    if (formState.meetingLink) {
      // Check if it's a Google Calendar event link
      if (formState.meetingLink.includes('calendar.app.google') || 
          formState.meetingLink.includes('calendar.google.com/event')) {
        parseCalendarLink(formState.meetingLink);
        return;
      }

      const platform = detectPlatformFromLink(formState.meetingLink);
      const platformEnum = platform === 'Google Meet' ? 'GOOGLE_MEET' :
                           platform === 'Zoom' ? 'ZOOM' :
                           platform === 'Microsoft Teams' ? 'MICROSOFT_TEAMS' :
                           platform === 'Slack' ? 'SLACK' : 'OTHER';
      
      onFormChange('platform', platformEnum);

      // Extract meeting ID from URL
      let extractedId = '';
      try {
        const url = new URL(formState.meetingLink);
        
        if (url.hostname.includes('meet.google.com')) {
          // Google Meet: meet.google.com/abc-defg-hij
          extractedId = url.pathname.split('/').pop() || '';
        } else if (url.hostname.includes('zoom.us')) {
          // Zoom: zoom.us/j/123456789 or zoom.us/j/123456789?pwd=xxx
          const parts = url.pathname.split('/');
          extractedId = parts[parts.indexOf('j') + 1] || parts.pop() || '';
        } else if (url.hostname.includes('teams.microsoft.com')) {
          // Teams: complex URL, extract meetup-join ID
          const pathParts = url.pathname.split('/');
          extractedId = pathParts[pathParts.length - 1] || 'Teams Meeting';
        } else if (url.hostname.includes('slack.com')) {
          // Slack: slack.com/call/xxx
          extractedId = url.pathname.split('/').pop() || '';
        }
        
        setMeetingId(extractedId);

        // Generate smart title suggestion if title is empty
        if (!formState.title && formState.startDate) {
          const startTime = new Date(formState.startDate);
          const hour = startTime.getHours();
          const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' });
          
          let suggestedTitle = '';
          
          // Time-based suggestions
          if (hour >= 9 && hour < 10) {
            suggestedTitle = `${dayOfWeek} Standup`;
          } else if (hour >= 10 && hour < 12) {
            suggestedTitle = `${dayOfWeek} Team Sync`;
          } else if (hour >= 13 && hour < 15) {
            suggestedTitle = `${platform} Meeting`;
          } else if (hour >= 15 && hour < 17) {
            suggestedTitle = `${dayOfWeek} Review`;
          } else {
            suggestedTitle = `${platform} Call`;
          }
          
          setSuggestedTitle(suggestedTitle);
        }
      } catch (error) {
        console.log('Could not parse meeting URL');
      }
    }
  }, [formState.meetingLink, formState.startDate, formState.title, onFormChange]);

  const applySuggestedTitle = () => {
    if (suggestedTitle) {
      onFormChange('title', suggestedTitle);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleInputChange = (field: keyof EventFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onFormChange(field, e.target.value);
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      'GOOGLE_MEET': 'Google Meet',
      'ZOOM': 'Zoom',
      'MICROSOFT_TEAMS': 'Microsoft Teams',
      'SLACK': 'Slack',
      'OTHER': 'Other Platform',
    };
    return names[platform] || 'Unknown';
  };

  // Early return after all hooks
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full relative">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Meeting
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Paste your meeting link and add basic details
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Meeting Link - Primary Field */}
            <div>
              <label htmlFor="meeting-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <input
                id="meeting-link"
                type="url"
                value={formState.meetingLink}
                onChange={handleInputChange('meetingLink')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                placeholder="https://meet.google.com/abc-defg-hij or https://calendar.app.google/..."
                required
              />
              
              {/* Loading indicator while parsing */}
              {isParsingLink && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Fetching meeting details from Google Calendar...</span>
                </div>
              )}
              
              {/* Parsed data success */}
              {parsedData && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Meeting details imported from Google Calendar!
                      </p>
                      <ul className="mt-2 text-xs text-green-700 dark:text-green-400 space-y-1">
                        {parsedData.title && <li>✓ Title: {parsedData.title}</li>}
                        {parsedData.description && <li>✓ Description: {parsedData.description}</li>}
                        {parsedData.meetingLink && <li>✓ Google Meet link extracted</li>}
                        {parsedData.startTime && <li>✓ Date & time imported</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {formState.meetingLink && !isParsingLink && !parsedData && (
                <div className="mt-3 space-y-2">
                  {formState.platform && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{getPlatformName(formState.platform)} detected</span>
                      </div>
                      {meetingId && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="font-mono text-[10px]">ID: {meetingId.substring(0, 12)}...</span>
                        </div>
                      )}
                    </div>
                  )}
                  {suggestedTitle && !formState.title && (
                    <button
                      type="button"
                      onClick={applySuggestedTitle}
                      className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Use suggested title: "{suggestedTitle}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Meeting Title */}
            <div>
              <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                id="meeting-title"
                type="text"
                value={formState.title}
                onChange={handleInputChange('title')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                placeholder="e.g., Weekly Team Standup"
                required
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start <span className="text-red-500">*</span>
                </label>
                <input
                  id="start-datetime"
                  type="datetime-local"
                  value={formState.startDate}
                  onChange={handleInputChange('startDate')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="end-datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End <span className="text-red-500">*</span>
                </label>
                <input
                  id="end-datetime"
                  type="datetime-local"
                  value={formState.endDate}
                  onChange={handleInputChange('endDate')}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Optional: Description */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Add optional details
              </summary>
              <div className="mt-4 space-y-4 pl-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formState.description}
                    onChange={handleInputChange('description')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white resize-none"
                    placeholder="Add meeting agenda or notes..."
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Participants
                  </label>
                  <input
                    id="participants"
                    type="text"
                    value={formState.participants}
                    onChange={handleInputChange('participants')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="John, Sarah, Mike"
                  />
                </div>

                <div>
                  <label htmlFor="topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topics
                  </label>
                  <input
                    id="topics"
                    type="text"
                    value={formState.topics}
                    onChange={handleInputChange('topics')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="Planning, Budget, Design"
                  />
                </div>
              </div>
            </details>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-colors"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

