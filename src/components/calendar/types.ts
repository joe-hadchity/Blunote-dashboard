import { EventInput } from "@fullcalendar/core";

// Extended calendar event interface
export interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    meeting?: any; // Using any to avoid type conflicts with BasicTableOne Meeting
    isMeeting?: boolean;
    meetingLink?: string;
  };
}

// Calendar configuration types
export interface CalendarConfig {
  initialView: string;
  headerToolbar: {
    left: string;
    center: string;
    right: string;
  };
  customButtons: Record<string, {
    text: string;
    click: () => void;
  }>;
  scrollTime?: string; // Initial scroll position for time-grid views
  slotMinTime?: string; // Minimum time to display
  slotMaxTime?: string; // Maximum time to display
  slotDuration?: string; // Duration of each time slot
  slotLabelInterval?: string; // Interval for time labels
}

// Event form state
export interface EventFormState {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'VIDEO' | 'AUDIO';
  platform: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'SLACK' | 'OTHER';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  participants: string;
  topics: string;
  meetingLink: string;
  level: string; // Keep for backward compatibility with regular events
}

// Platform types
export type Platform = 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Slack' | 'Scheduled Meeting' | 'Other';

// Calendar event levels
export type EventLevel = 'Danger' | 'Success' | 'Primary' | 'Warning';

// Popup state types
export interface PopupState {
  showMeetingPopup: boolean;
  showEventPopup: boolean;
  selectedMeeting: Meeting | null;
  selectedEventForView: CalendarEvent | null;
}

// Modal state
export interface ModalState {
  isOpen: boolean;
  selectedEvent: CalendarEvent | null;
}

// Utility function types
export type DateFormatter = (date: Date) => string;
export type PlatformDetector = (link: string) => Platform;
export type DurationCalculator = (start: Date, end: Date) => string;

// Event handlers
export interface EventHandlers {
  onDateSelect: (selectInfo: any) => void;
  onEventClick: (clickInfo: any) => void;
  onAddOrUpdateEvent: () => void;
  onEditEvent: () => void;
  onCloseModal: () => void;
  onClosePopup: () => void;
}

// Component props
export interface CalendarProps {
  className?: string;
  initialEvents?: CalendarEvent[];
  onEventChange?: (events: CalendarEvent[]) => void;
}

export interface MeetingPopupProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails?: () => void;
  onCopyLink?: () => void;
  onGoToMeeting?: () => void;
}

export interface EventPopupProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onGoToMeeting?: () => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formState: EventFormState;
  onFormChange: (field: keyof EventFormState, value: string) => void;
  isEditing: boolean;
}
