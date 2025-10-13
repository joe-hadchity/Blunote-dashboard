import { CalendarConfig, EventLevel, Platform } from './types';

// Calendar event levels configuration
export const CALENDAR_EVENT_LEVELS: Record<EventLevel, string> = {
  Danger: "danger",
  Success: "success", 
  Primary: "primary",
  Warning: "warning",
};

// Platform color mapping
export const PLATFORM_COLORS: Record<Platform, string> = {
  'Google Meet': '#00832d',
  'Zoom': '#2D8CFF',
  'Microsoft Teams': '#4F52B2',
  'Slack': '#36C5F0',
  'Scheduled Meeting': '#4A154B',
  'Other': '#6B7280',
};

// Platform detection patterns
export const PLATFORM_PATTERNS: Record<string, Platform> = {
  'meet.google.com': 'Google Meet',
  'zoom.us': 'Zoom',
  'teams.microsoft.com': 'Microsoft Teams',
  'slack.com': 'Slack',
};

// Calendar configuration
export const CALENDAR_CONFIG: CalendarConfig = {
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next addEventButton",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  customButtons: {
    addEventButton: {
      text: "+ New Meeting",
      click: () => {}, // Will be set dynamically
    },
  },
  scrollTime: "07:00:00", // Start week/day view at 7 AM
  slotMinTime: "00:00:00", // Allow viewing from midnight
  slotMaxTime: "24:00:00", // Show full day
  slotDuration: "00:30:00", // 30-minute time slots
  slotLabelInterval: "01:00:00", // Show hour labels
};

// Default event form state
export const DEFAULT_EVENT_FORM_STATE = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  type: "VIDEO" as const,
  platform: "GOOGLE_MEET" as const,
  status: "SCHEDULED" as const,
  participants: "",
  topics: "",
  meetingLink: "",
  level: "",
};

// CSS classes
export const CSS_CLASSES = {
  calendarContainer: "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]",
  customCalendar: "custom-calendar",
  popupOverlay: "fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50",
  popupContent: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-[700px] w-full mx-4 p-6 lg:p-10 relative",
  closeButton: "absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10",
  modalContent: "flex flex-col px-2 overflow-y-auto custom-scrollbar",
  modalTitle: "mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl",
  modalDescription: "text-sm text-gray-500 dark:text-gray-400",
  formField: "mt-6",
  formLabel: "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",
  formInput: "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800",
  buttonPrimary: "btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto",
  buttonSecondary: "flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto",
  modalFooter: "flex items-center gap-3 mt-6 modal-footer sm:justify-end",
};

// ARIA labels for accessibility
export const ARIA_LABELS = {
  calendar: "Calendar view with events and meetings",
  addEventButton: "Add new event",
  eventTitle: "Event title",
  eventStartDate: "Event start date",
  eventEndDate: "Event end date",
  eventLevel: "Event priority level",
  meetingLink: "Meeting link URL",
  closeModal: "Close modal",
  closePopup: "Close popup",
  editEvent: "Edit event",
  viewDetails: "View meeting details",
  copyLink: "Copy meeting link",
  goToMeeting: "Go to meeting",
};

// Error messages
export const ERROR_MESSAGES = {
  invalidDate: "Please enter a valid date",
  invalidTime: "Please enter a valid time",
  invalidUrl: "Please enter a valid URL",
  requiredField: "This field is required",
  endBeforeStart: "End date must be after start date",
  networkError: "Network error occurred",
  saveError: "Failed to save event",
  loadError: "Failed to load events",
};

// Success messages
export const SUCCESS_MESSAGES = {
  eventSaved: "Event saved successfully",
  eventUpdated: "Event updated successfully",
  eventDeleted: "Event deleted successfully",
  linkCopied: "Meeting link copied to clipboard",
};

// Date format options
export const DATE_FORMAT_OPTIONS = {
  fullDate: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
  time: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
  shortDate: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  },
};

// Meeting link placeholders
export const MEETING_LINK_PLACEHOLDERS = {
  googleMeet: "https://meet.google.com/abc-defg-hij",
  zoom: "https://zoom.us/j/123456789",
  teams: "https://teams.microsoft.com/l/meetup-join/...",
  slack: "https://slack.com/call/...",
  generic: "https://example.com/meeting-link",
};
