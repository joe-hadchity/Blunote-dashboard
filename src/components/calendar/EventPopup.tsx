import React from 'react';
import { EventPopupProps } from './types';
import { CloseIcon } from './PlatformIcons';
import { formatDateTime, detectPlatformFromLink, openInNewTab } from './utils';
import { CSS_CLASSES, ARIA_LABELS } from './constants';
import { ExternalLink, Edit3, Calendar, Clock } from '@/components/common/Icons';

export const EventPopup: React.FC<EventPopupProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onGoToMeeting,
}) => {
  if (!isOpen || !event) return null;

  const handleGoToMeeting = () => {
    if (event.extendedProps.meetingLink && onGoToMeeting) {
      onGoToMeeting();
    }
  };

  const platform = event.extendedProps.meetingLink 
    ? detectPlatformFromLink(event.extendedProps.meetingLink)
    : 'Other';

  const getPlatformIcon = () => {
    if (event.extendedProps.meetingLink?.includes('meet.google.com')) {
      return (
        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="#00832d" d="M19.2 8.4c-.2-.1-.4-.2-.6-.2H5.4c-.2 0-.4.1-.6.2-.2.1-.3.3-.3.5v6.2c0 .2.1.4.3.5.2.1.4.2.6.2h13.2c.2 0 .4-.1.6-.2.2-.1.3-.3.3-.5V8.9c0-.2-.1-.4-.3-.5z"/>
            <path fill="#34a853" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </div>
      );
    }
    
    if (event.extendedProps.meetingLink?.includes('zoom.us')) {
      return (
        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="#2D8CFF" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#2D8CFF" d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        </div>
      );
    }
    
    if (event.extendedProps.meetingLink?.includes('teams.microsoft.com')) {
      return (
        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="#6264A7" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#6264A7" d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
          </svg>
        </div>
      );
    }
    
    if (event.extendedProps.meetingLink) {
      return (
        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="#4A154B" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
          </svg>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-popup-title"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 
                id="event-popup-title"
                className="font-semibold text-gray-900 dark:text-white pr-8"
              >
                {event.title}
              </h5>
              {event.extendedProps.meetingLink && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {platform}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {event.start ? formatDateTime(new Date(event.start.toString())) : 'Not set'}
              {event.end && ` - ${new Date(event.end.toString()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
          
          {event.extendedProps.meetingLink && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">Meeting link available</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
          {event.extendedProps.meetingLink && (
            <button
              onClick={handleGoToMeeting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
