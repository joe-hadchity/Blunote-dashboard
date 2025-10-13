"use client";
import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { Meeting as OldMeeting } from "@/components/tables/BasicTableOne";
import { Meeting as ApiMeeting } from "@/components/tables/MeetingsTable";

// Import our extracted components and utilities
import { CalendarEvent } from './types';
import { CALENDAR_CONFIG, CSS_CLASSES, ARIA_LABELS } from './constants';
import { 
  convertMeetingToEvent, 
  createScheduledMeetingEvent, 
  validateEventForm,
  copyToClipboard,
  openInNewTab,
  generateId,
  getTodayInputFormat,
  getTomorrowInputFormat,
  detectPlatformFromLink
} from './utils';
import { getPlatformIcon, VideoIcon, AudioIcon, MeetingLinkIcon } from './PlatformIcons';
import { MeetingPopup } from './MeetingPopup';
import { EventPopup } from './EventPopup';
import { EventModal } from './EventModal';
import { SimpleMeetingFormModal } from './SimpleMeetingFormModal';
import { useCalendarState } from './useCalendarState';
import { useErrorHandling, ErrorBoundary, LoadingSpinner, Notification } from './ErrorHandling';
import { RefreshCw } from '@/components/common/Icons';
import ListView from './ListView';
import { CalendarShimmer, CalendarListShimmer } from '@/components/common/ShimmerLoader';

type ViewType = 'calendar' | 'list';

interface CalendarProps {
  initialView?: ViewType;
}

const Calendar: React.FC<CalendarProps> = ({ initialView = 'calendar' }) => {
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const hasLoadedDataRef = useRef(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);

  // Use our custom hooks
  const calendarState = useCalendarState();
  const errorHandling = useErrorHandling();

  // Fetch meetings from API and convert to calendar events
  const fetchMeetingsForCalendar = useCallback(async (showSuccessMessage = false) => {
    try {
      errorHandling.setLoading(true, "Loading calendar events...");
      
      // Fetch all meetings from API (no pagination for calendar view)
      const response = await fetch('/api/meetings?limit=1000', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      const apiMeetings: ApiMeeting[] = data.meetings || [];
      
      // Convert API meetings to calendar events
      const meetingEvents: CalendarEvent[] = apiMeetings.map((meeting) => {
        const startDate = new Date(meeting.startTime);
        const endDate = new Date(meeting.endTime);
        
        // Convert API meeting to old Meeting format for convertMeetingToEvent
        const oldFormatMeeting: OldMeeting = {
          id: meeting.id as any, // Keep as string (calendar uses it as ID)
          title: meeting.title,
          date: meeting.startTime,
          lastModified: meeting.updatedAt,
          duration: `${meeting.duration} min`,
          type: meeting.type.toLowerCase() as 'video' | 'audio',
          platform: formatPlatformForCalendar(meeting.platform),
          features: getFeatures(meeting),
          isFavorite: meeting.isFavorite,
        };
        
        const event = convertMeetingToEvent(oldFormatMeeting);
        
        // Add recordingId to meeting object for routing
        if (meeting.recordingId) {
          (event.extendedProps.meeting as any).recordingId = meeting.recordingId;
        }
        
        // Add synced from Google flag and meeting link to extended props
        if (meeting.syncedFromGoogle) {
          event.extendedProps = {
            ...event.extendedProps,
            syncedFromGoogle: true,
            googleEventId: meeting.googleEventId,
            meetingLink: meeting.meetingLink, // Google Meet/Zoom link for joining
          };
        } else if (meeting.meetingLink) {
          // For manually created meetings with links
          event.extendedProps = {
            ...event.extendedProps,
            meetingLink: meeting.meetingLink,
          };
        }
        
        return event;
      });

      calendarState.setEventsList(meetingEvents);
      errorHandling.setLoading(false);
      
      if (showSuccessMessage) {
        errorHandling.showNotification('Calendar refreshed successfully', 'success', 2000);
      }
    } catch (error) {
      console.error('Error fetching meetings for calendar:', error);
      errorHandling.handleLoadError();
      errorHandling.setLoading(false);
    }
  }, [calendarState, errorHandling]);

  // Helper function to format platform for calendar
  const formatPlatformForCalendar = (platform: string): OldMeeting['platform'] => {
    const platformMap: Record<string, OldMeeting['platform']> = {
      'GOOGLE_MEET': 'Google Meet',
      'ZOOM': 'Zoom',
      'MICROSOFT_TEAMS': 'Microsoft Teams',
      'SLACK': 'Slack',
    };
    return platformMap[platform] || 'Scheduled Meeting';
  };

  // Helper function to get features
  const getFeatures = (meeting: ApiMeeting): OldMeeting['features'] => {
    const features: OldMeeting['features'] = [];
    if (meeting.hasTranscript) features.push('Transcript');
    if (meeting.hasSummary) features.push('Summary');
    if (meeting.hasVideo) features.push('Video File');
    return features;
  };

  // Check if Google Calendar is connected
  useEffect(() => {
    const checkGoogleCalendarConnection = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsGoogleCalendarConnected(data.user?.google_calendar_connected || false);
        }
      } catch (error) {
        console.error('Error checking Google Calendar connection:', error);
      }
    };

    checkGoogleCalendarConnection();
  }, []);

  // Sync Google Calendar meetings
  const syncGoogleCalendar = useCallback(async (silent = true) => {
    if (!isGoogleCalendarConnected) {
      return;
    }

    try {
      if (!silent) {
        errorHandling.showNotification('Syncing Google Calendar...', 'info', 2000);
      }

      const response = await fetch('/api/google-calendar/sync', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📅 Google Calendar sync complete:', data.result);
        
        // Refresh calendar to show synced events - call the function directly
        const refreshResponse = await fetch('/api/meetings?limit=1000', {
          method: 'GET',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const apiMeetings: ApiMeeting[] = refreshData.meetings || [];
          
          const meetingEvents: CalendarEvent[] = apiMeetings.map((meeting) => {
            const oldFormatMeeting: OldMeeting = {
              id: meeting.id as any,
              title: meeting.title,
              date: meeting.startTime,
              lastModified: meeting.updatedAt,
              duration: `${meeting.duration} min`,
              type: meeting.type.toLowerCase() as 'video' | 'audio',
              platform: formatPlatformForCalendar(meeting.platform),
              features: getFeatures(meeting),
              isFavorite: meeting.isFavorite,
            };
            
            const event = convertMeetingToEvent(oldFormatMeeting);
            
            // Add recordingId to meeting object for routing
            if (meeting.recordingId) {
              (event.extendedProps.meeting as any).recordingId = meeting.recordingId;
            }
            
            if (meeting.syncedFromGoogle) {
              event.extendedProps = {
                ...event.extendedProps,
                syncedFromGoogle: true,
                googleEventId: meeting.googleEventId,
                meetingLink: meeting.meetingLink,
              };
            } else if (meeting.meetingLink) {
              event.extendedProps = {
                ...event.extendedProps,
                meetingLink: meeting.meetingLink,
              };
            }
            
            return event;
          });

          calendarState.setEventsList(meetingEvents);
        }
        
        if (!silent) {
          errorHandling.showNotification(
            `Synced ${data.result?.synced || 0} new meetings from Google Calendar`,
            'success',
            3000
          );
        }
      } else {
        const errorData = await response.json();
        if (!silent) {
          errorHandling.showNotification(
            errorData.error || 'Failed to sync Google Calendar',
            'error',
            3000
          );
        }
      }
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      if (!silent) {
        errorHandling.showNotification('Failed to sync Google Calendar', 'error', 3000);
      }
    }
  }, [isGoogleCalendarConnected, errorHandling.showNotification, calendarState.setEventsList]);

  // Auto-sync Google Calendar every 5 minutes
  useEffect(() => {
    if (!isGoogleCalendarConnected) {
      return;
    }

    // Initial sync when calendar loads (if connected)
    syncGoogleCalendar(true);

    // Set up auto-sync interval (5 minutes)
    const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-syncing Google Calendar...');
      syncGoogleCalendar(true);
    }, AUTO_SYNC_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGoogleCalendarConnected]); // Only re-run when connection status changes

  // Initialize events from API (only once)
  useEffect(() => {
    if (!hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      fetchMeetingsForCalendar();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (calendarState.hasActivePopups && target.classList.contains('fixed')) {
        calendarState.closeAllPopups();
      }
    };

    if (calendarState.hasActivePopups) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarState.hasActivePopups, calendarState.closeAllPopups]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    calendarState.resetForm();
    
    // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
    const startDate = new Date(selectInfo.start);
    const endDate = selectInfo.end ? new Date(selectInfo.end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
    
    // Format for datetime-local input
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    calendarState.updateFormField('startDate', formatDateTime(startDate));
    calendarState.updateFormField('endDate', formatDateTime(endDate));
    calendarState.openModal();
  }, [calendarState]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps as any;
    
    if (extendedProps.isMeeting && extendedProps.meeting) {
      // Show meeting popup (view-only for recorded meetings)
      calendarState.showMeetingPopup(extendedProps.meeting);
    } else if (extendedProps.meetingLink) {
      // Show scheduled meeting popup (view-only with meeting link)
      const meeting: OldMeeting = {
        id: parseInt(event.id || '0'),
        title: event.title,
        date: event.start?.toISOString() || '',
        lastModified: event.end?.toISOString() || '',
        duration: event.end && event.start ? 
          `${Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))} min` : 'Unknown',
        type: 'video',
        platform: 'Scheduled Meeting',
        features: ['Transcript'] as any,
        isFavorite: false
      };
      calendarState.showMeetingPopup(meeting);
    } else {
      // Show regular event popup (view-only first)
      calendarState.showEventPopup(event as unknown as CalendarEvent);
    }
  }, [calendarState]);

  // Handle list view event click
  const handleListEventClick = useCallback((event: CalendarEvent) => {
    const extendedProps = event.extendedProps as any;
    
    if (extendedProps.isMeeting && extendedProps.meeting) {
      // Show meeting popup (view-only for recorded meetings)
      calendarState.showMeetingPopup(extendedProps.meeting);
    } else if (extendedProps.meetingLink) {
      // Show scheduled meeting popup (view-only with meeting link)
      const meeting: OldMeeting = {
        id: parseInt(event.id?.toString() || '0'),
        title: event.title || '',
        date: event.start?.toString() || '',
        lastModified: event.end?.toString() || '',
        duration: event.end && event.start ? 
          `${Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60))} min` : 'Unknown',
        type: 'video',
        platform: 'Scheduled Meeting',
        features: ['Transcript'] as any,
        isFavorite: false
      };
      calendarState.showMeetingPopup(meeting);
    } else {
      // Show regular event popup (view-only first)
      calendarState.showEventPopup(event);
    }
  }, [calendarState]);

  const handleAddOrUpdateEvent = async () => {
    try {
      // Validate required fields
      if (!calendarState.formState.title || !calendarState.formState.startDate || !calendarState.formState.endDate) {
        errorHandling.handleValidationError(['Title, start date, and end date are required']);
        return;
      }

      // Parse participants and topics from comma-separated strings
      const participants = calendarState.formState.participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      const topics = calendarState.formState.topics
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Create meeting via API
      const response = await fetch('/api/meetings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: calendarState.formState.title,
          description: calendarState.formState.description || null,
          startTime: new Date(calendarState.formState.startDate).toISOString(),
          endTime: new Date(calendarState.formState.endDate).toISOString(),
          platform: calendarState.formState.platform,
          type: calendarState.formState.type,
          status: calendarState.formState.status,
          participants: participants,
          topics: topics,
          recordingUrl: calendarState.formState.meetingLink || null,
        }),
      });

      if (response.ok) {
        // Refresh calendar to show new meeting
        await fetchMeetingsForCalendar();
        errorHandling.showEventSavedNotification();
        calendarState.closeModal();
      } else {
        const errorData = await response.json();
        
        // Handle duplicate meeting link error
        if (response.status === 409 && errorData.duplicate) {
          const duplicateMeeting = errorData.duplicate;
          const duplicateDate = new Date(duplicateMeeting.startTime).toLocaleDateString();
          const duplicateTime = new Date(duplicateMeeting.startTime).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          errorHandling.showNotification(
            `This meeting link is already used by "${duplicateMeeting.title}" on ${duplicateDate} at ${duplicateTime}. Please use a different link.`,
            'error',
            5000 // Show for 5 seconds
          );
          return; // Don't close modal, let user fix the link
        }
        
        throw new Error(errorData.error || 'Failed to create meeting');
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      errorHandling.handleSaveError();
    }
  };

  const handleEditEvent = useCallback(() => {
    if (calendarState.popupState.selectedEventForView) {
      calendarState.setSelectedEvent(calendarState.popupState.selectedEventForView);
      calendarState.updateFormField('title', calendarState.popupState.selectedEventForView.title || "");
      calendarState.updateFormField('startDate', calendarState.popupState.selectedEventForView.start?.toString().split("T")[0] || "");
      calendarState.updateFormField('endDate', calendarState.popupState.selectedEventForView.end?.toString().split("T")[0] || "");
      calendarState.updateFormField('level', calendarState.popupState.selectedEventForView.extendedProps.calendar);
      calendarState.updateFormField('meetingLink', calendarState.popupState.selectedEventForView.extendedProps.meetingLink || "");
      calendarState.closeEventPopup();
      calendarState.openModal();
    }
  }, [calendarState]);

  const handleGoToMeeting = useCallback(() => {
    if (calendarState.popupState.selectedMeeting) {
      // Get the event to check for meeting link
      const meetingId = calendarState.popupState.selectedMeeting.id.toString();
      const event = calendarState.events.find(e => {
        const eventId = e.id.toString();
        return eventId === meetingId || 
               eventId === `meeting-${meetingId}` ||
               e.id === meetingId ||
               e.id === `meeting-${meetingId}`;
      });
      
      const meetingLink = event?.extendedProps?.meetingLink;
      
      // If there's a meeting link, open it in new tab
      if (meetingLink) {
        window.open(meetingLink, '_blank', 'noopener,noreferrer');
        calendarState.closeMeetingPopup();
      } else {
        errorHandling.showNotification(
          'No meeting link available for this event',
          'warning',
          3000
        );
      }
    }
  }, [calendarState, errorHandling]);


  // Force minimum height for short events and add synced class
  const handleEventDidMount = useCallback((info: any) => {
    const eventEl = info.el;
    if (eventEl && eventEl.classList.contains('fc-timegrid-event')) {
      eventEl.style.minHeight = '40px';
      eventEl.style.height = 'auto';
    }
    // Add synced-event class for Google Calendar synced events
    if (info.event.extendedProps?.syncedFromGoogle) {
      eventEl.classList.add('synced-event');
    }
  }, []);

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const extendedProps = eventInfo.event.extendedProps as any;
    const timeText = eventInfo.timeText;
    const isSynced = extendedProps.syncedFromGoogle;
    
    if (extendedProps.isMeeting && extendedProps.meeting) {
      const meeting = extendedProps.meeting;
      
      // Synced meeting - dotted border style (class added via eventDidMount)
      if (isSynced) {
        return (
          <div className="px-2 py-1 w-full">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 flex-shrink-0">
                {getPlatformIcon(meeting.platform)}
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                {timeText && <span className="font-medium mr-1">{timeText}</span>}
                {eventInfo.event.title}
              </div>
            </div>
          </div>
        );
      }
      
      // Regular meeting - minimal style
      return (
        <div className="px-2 py-1 w-full">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 flex-shrink-0">
              {getPlatformIcon(meeting.platform)}
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
              {timeText && <span className="font-medium mr-1">{timeText}</span>}
              {eventInfo.event.title}
            </div>
          </div>
        </div>
      );
    } else if (extendedProps.meetingLink) {
      // Scheduled meeting with link
      return (
        <div className="px-2 py-1 w-full">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 flex-shrink-0">
              <MeetingLinkIcon />
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
              {timeText && <span className="font-medium mr-1">{timeText}</span>}
              {eventInfo.event.title}
            </div>
          </div>
        </div>
      );
    }
    
    // Regular event - minimal style
    return (
      <div className="px-2 py-1 w-full">
        <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
          {timeText && <span className="font-medium mr-1">{timeText}</span>}
          {eventInfo.event.title}
        </div>
      </div>
    );
  }, []);

  // Update calendar config with dynamic button handler
  const calendarConfig = useMemo(() => ({
    ...CALENDAR_CONFIG,
    customButtons: {
      ...CALENDAR_CONFIG.customButtons,
      addEventButton: {
        ...CALENDAR_CONFIG.customButtons.addEventButton,
        click: calendarState.openModal,
      },
    },
  }), [calendarState.openModal]);

  if (errorHandling.loadingState.isLoading) {
    return viewType === 'calendar' ? (
      <CalendarShimmer message={errorHandling.loadingState.loadingMessage} />
    ) : (
      <CalendarListShimmer />
    );
  }

  return (
    <ErrorBoundary>
      <div className={CSS_CLASSES.calendarContainer}>
        {/* View Toggle and Actions */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center justify-between gap-4">
            {/* View Toggle */}
            <div className="inline-flex gap-1">
              <button
                onClick={() => setViewType('calendar')}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  viewType === 'calendar'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  viewType === 'list'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                List
              </button>
            </div>
            
            {/* Sync Button */}
            {isGoogleCalendarConnected && (
              <button
                onClick={() => syncGoogleCalendar(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Sync Google Calendar now"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                Sync
              </button>
            )}
          </div>
        </div>
        
        {/* Calendar View */}
        {viewType === 'calendar' ? (
          <div className={CSS_CLASSES.customCalendar}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarConfig.initialView}
              headerToolbar={calendarConfig.headerToolbar}
              customButtons={calendarConfig.customButtons}
              events={calendarState.events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              eventDidMount={handleEventDidMount}
              scrollTime={calendarConfig.scrollTime}
              slotMinTime={calendarConfig.slotMinTime}
              slotMaxTime={calendarConfig.slotMaxTime}
              slotDuration={calendarConfig.slotDuration}
              slotLabelInterval={calendarConfig.slotLabelInterval}
              eventMinHeight={40}
              slotEventOverlap={false}
              expandRows={true}
              dayMaxEvents={false}
              dayMaxEventRows={false}
              eventDisplay="block"
              height="auto"
              aria-label={ARIA_LABELS.calendar}
            />
          </div>
        ) : (
          /* List View */
          <ListView
            events={calendarState.events}
            onEventClick={handleListEventClick}
            onAddEvent={calendarState.openModal}
          />
        )}
      
       {/* Meeting Popup */}
        <MeetingPopup
          meeting={calendarState.popupState.selectedMeeting!}
          isOpen={calendarState.popupState.showMeetingPopup}
          onClose={calendarState.closeMeetingPopup}
          onViewDetails={() => {
            if (calendarState.popupState.selectedMeeting) {
              const meeting = calendarState.popupState.selectedMeeting as any;
              const recordingId = meeting.recordingId;
              
              // Only navigate if meeting has a recording
              if (recordingId) {
                window.location.href = `/recording/${recordingId}`;
              } else {
                // Show notification if no recording available
                errorHandling.showNotification(
                  'This meeting does not have a recording yet',
                  'info',
                  3000
                );
              }
            }
          }}
          onGoToMeeting={handleGoToMeeting}
          isSynced={calendarState.events.find(e => 
            e.id === `meeting-${calendarState.popupState.selectedMeeting?.id}` || 
            e.id === calendarState.popupState.selectedMeeting?.id.toString()
          )?.extendedProps?.syncedFromGoogle || false}
        />
      
      {/* Event View Popup */}
        <EventPopup
          event={calendarState.popupState.selectedEventForView!}
          isOpen={calendarState.popupState.showEventPopup}
          onClose={calendarState.closeEventPopup}
          onEdit={handleEditEvent}
          onGoToMeeting={() => {
            if (calendarState.popupState.selectedEventForView?.extendedProps.meetingLink) {
              openInNewTab(calendarState.popupState.selectedEventForView.extendedProps.meetingLink);
            }
          }}
        />
        
        {/* Simple Meeting Form Modal */}
        <SimpleMeetingFormModal
          isOpen={calendarState.modalState.isOpen}
          onClose={calendarState.closeModal}
          onSubmit={handleAddOrUpdateEvent}
          formState={calendarState.formState}
          onFormChange={calendarState.updateFormField}
        />
        
        {/* Notification */}
        <Notification
          notification={errorHandling.notificationState}
          onClose={errorHandling.hideNotification}
                />
              </div>
    </ErrorBoundary>
  );
};


export default Calendar;
