import React from 'react';
import { getPlatformIcon, CloseIcon } from './PlatformIcons';
import { formatFullDate, copyToClipboard, openInNewTab } from './utils';
import { CSS_CLASSES, ARIA_LABELS } from './constants';
import { Meeting } from '@/components/tables/BasicTableOne';
import { ExternalLink, FileText, Video, Calendar } from '@/components/common/Icons';

interface MeetingPopupProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails?: () => void;
  onGoToMeeting?: () => void;
  isSynced?: boolean;
}

export const MeetingPopup: React.FC<MeetingPopupProps> = ({
  meeting,
  isOpen,
  onClose,
  onViewDetails,
  onGoToMeeting,
  isSynced = false,
}) => {
  if (!isOpen || !meeting) return null;

  const handleGoToMeeting = () => {
    if (onGoToMeeting) {
      onGoToMeeting();
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  // For synced events, show quick join popup
  if (isSynced) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-popup-title"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 flex-shrink-0">
                  {getPlatformIcon(meeting.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 
                    id="meeting-popup-title"
                    className="font-semibold text-gray-900 dark:text-white truncate"
                  >
                    {meeting.title}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {meeting.platform}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 ml-2"
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
              <span>{formatFullDate(new Date(meeting.date))}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{meeting.duration}</span>
            </div>
            
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <img src="/images/icon/google-calendar.svg" alt="" className="w-4 h-4" />
                Synced from Google Calendar
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => {
                handleGoToMeeting();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Meeting Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if meeting has a recording
  const hasRecording = (meeting as any).recordingId || meeting.features?.includes('Video File') || meeting.features?.includes('Transcript');
  
  // For non-synced events, show detailed popup
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-popup-title"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0">
                {getPlatformIcon(meeting.platform)}
              </div>
              <div>
                <h5 
                  id="meeting-popup-title"
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  {meeting.title}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {meeting.platform}
                </p>
              </div>
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
            <span>{formatFullDate(new Date(meeting.date))}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{meeting.duration}</span>
          </div>
          
          {meeting.features && meeting.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {meeting.features.includes('Transcript') && (
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Transcript
                </span>
              )}
              {meeting.features.includes('Video File') && (
                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Video
                </span>
              )}
              {meeting.features.includes('Summary') && (
                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-md flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Summary
                </span>
              )}
            </div>
          )}
          
          {/* Show message if no recording */}
          {!hasRecording && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This meeting doesn't have a recording yet
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
          {meeting.platform === 'Scheduled Meeting' && onGoToMeeting ? (
            <button
              onClick={handleGoToMeeting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </button>
          ) : hasRecording ? (
            <button
              onClick={handleViewDetails}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Video className="w-4 h-4" />
              View Recording
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
