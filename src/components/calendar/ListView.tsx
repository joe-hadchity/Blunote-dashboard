"use client";
import React, { useMemo, useState } from "react";
import { CalendarEvent } from "./types";
import { getPlatformIcon } from "./PlatformIcons";
import { CalendarDays, Clock, Video, Mic, Link as LinkIcon, Star, FileText, MessageSquare, Film } from "lucide-react";

interface ListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

type ViewMode = 'all' | 'upcoming' | 'past';

const ListView: React.FC<ListViewProps> = ({ events, onEventClick, onAddEvent }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');

  // Get current time for filtering
  const now = new Date();

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    
    // Filter by view mode
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(event => {
        const eventDate = event.start ? new Date(event.start) : null;
        return eventDate && eventDate >= now;
      });
    } else if (viewMode === 'past') {
      filtered = filtered.filter(event => {
        const eventDate = event.start ? new Date(event.start) : null;
        return eventDate && eventDate < now;
      });
    }
    
    // Sort by date (upcoming = ascending, past = descending, all = ascending)
    filtered.sort((a, b) => {
      const dateA = a.start ? new Date(a.start).getTime() : 0;
      const dateB = b.start ? new Date(b.start).getTime() : 0;
      return viewMode === 'past' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [events, viewMode, now]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    
    filteredEvents.forEach(event => {
      if (!event.start) return;
      
      const date = new Date(event.start);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(event);
    });
    
    return Array.from(groups.entries());
  }, [filteredEvents]);

  // Format date for display
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format time
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate duration
  const getDuration = (start: Date | string | undefined, end: Date | string | undefined) => {
    if (!start || !end) return '';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg">
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          {/* View Mode Tabs */}
          <div className="inline-flex gap-1">
            {(['upcoming', 'past', 'all'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors rounded-lg ${
                  viewMode === mode
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onAddEvent}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Event
          </button>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
            <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            No {viewMode === 'all' ? '' : viewMode} meetings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {viewMode === 'upcoming' 
              ? 'You have no upcoming meetings scheduled'
              : viewMode === 'past'
              ? 'No past meetings found'
              : 'No meetings found'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {groupedEvents.map(([dayKey, dayEvents]) => (
            <div key={dayKey}>
              {/* Date Header */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {formatDateHeader(dayKey)}
                </h3>
              </div>

              {/* Events for this day */}
              <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {dayEvents.map((event) => {
                  const meeting = event.extendedProps?.meeting;
                  const isSynced = event.extendedProps?.syncedFromGoogle;
                  const meetingLink = event.extendedProps?.meetingLink;
                  const features = meeting?.features || [];

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Time and Content */}
                        <div className="flex gap-4 flex-1 min-w-0">
                          {/* Time */}
                          <div className="flex-shrink-0 w-20 pt-0.5">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTime(event.start)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getDuration(event.start, event.end)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Icons */}
                            <div className="flex items-start gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                                {event.title}
                              </h4>
                              {meeting?.isFavorite && (
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                              )}
                            </div>

                            {/* Platform and Type */}
                            <div className="flex items-center gap-2 mb-2">
                              {meeting?.platform && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-4 h-4">
                                    {getPlatformIcon(meeting.platform)}
                                  </div>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {meeting.platform}
                                  </span>
                                </div>
                              )}
                              {meeting?.type && (
                                <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                  {meeting.type === 'video' ? (
                                    <Video className="w-3.5 h-3.5" />
                                  ) : (
                                    <Mic className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              )}
                              {isSynced && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
                                  </svg>
                                  Synced
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            {features.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                {features.includes('Transcript') && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                                    <FileText className="w-3 h-3" />
                                    Transcript
                                  </span>
                                )}
                                {features.includes('Summary') && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                                    <MessageSquare className="w-3 h-3" />
                                    Summary
                                  </span>
                                )}
                                {features.includes('Video File') && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                                    <Film className="w-3 h-3" />
                                    Recording
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Join Meeting Link */}
                        {meetingLink && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(meetingLink, '_blank', 'noopener,noreferrer');
                            }}
                            className="flex-shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Join Meeting"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {filteredEvents.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-white/[0.05]">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'meeting' : 'meetings'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ListView;
