import { Platform, CalendarEvent, DateFormatter, PlatformDetector, DurationCalculator } from './types';
import { PLATFORM_COLORS, PLATFORM_PATTERNS, DATE_FORMAT_OPTIONS } from './constants';
import { Meeting } from '@/components/tables/BasicTableOne';

/**
 * Get platform color based on platform name
 */
export const getPlatformColor = (platform: string): string => {
  return PLATFORM_COLORS[platform as Platform] || PLATFORM_COLORS.Other;
};

/**
 * Detect platform from meeting link
 */
export const detectPlatformFromLink: PlatformDetector = (link: string): Platform => {
  if (!link) return 'Other';
  
  for (const [pattern, platform] of Object.entries(PLATFORM_PATTERNS)) {
    if (link.includes(pattern)) {
      return platform;
    }
  }
  
  return 'Other';
};

/**
 * Format date with full date format
 */
export const formatFullDate: DateFormatter = (date: Date): string => {
  return date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS.fullDate);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: Date): string => {
  const dateStr = date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS.fullDate);
  const timeStr = date.toLocaleTimeString('en-US', DATE_FORMAT_OPTIONS.time);
  return `${dateStr} at ${timeStr}`;
};

/**
 * Calculate duration between two dates
 */
export const calculateDuration: DurationCalculator = (start: Date, end: Date): string => {
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes} min`;
};

/**
 * Parse duration string to minutes
 */
export const parseDurationToMinutes = (duration: string): number => {
  if (duration.includes('h')) {
    const parts = duration.split('h');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]?.trim().split(' ')[0]) || 0;
    return hours * 60 + minutes;
  }
  
  return parseInt(duration.split(' ')[0]) || 0;
};

/**
 * Convert meeting to calendar event
 */
export const convertMeetingToEvent = (meeting: Meeting): CalendarEvent => {
  const meetingDate = new Date(meeting.date);
  const durationMinutes = parseDurationToMinutes(meeting.duration);
  const endTime = new Date(meetingDate.getTime() + durationMinutes * 60000);
  
  // Check if it's an all-day event (duration >= 24 hours or exactly midnight to midnight)
  const isAllDay = durationMinutes >= 1440 || (
    meetingDate.getHours() === 0 && 
    meetingDate.getMinutes() === 0 && 
    endTime.getHours() === 0 && 
    endTime.getMinutes() === 0 &&
    durationMinutes >= 1440
  );
  
  return {
    id: `meeting-${meeting.id}`,
    title: meeting.title,
    start: meetingDate.toISOString(),
    end: endTime.toISOString(),
    allDay: isAllDay,
    extendedProps: { 
      calendar: "Meeting",
      meeting: meeting,
      isMeeting: true
    },
    backgroundColor: getPlatformColor(meeting.platform),
    borderColor: getPlatformColor(meeting.platform),
  };
};

/**
 * Create a scheduled meeting event
 */
export const createScheduledMeetingEvent = (
  id: string,
  title: string,
  start: string,
  end: string,
  meetingLink: string
): CalendarEvent => {
  const platform = detectPlatformFromLink(meetingLink);
  
  return {
    id,
    title,
    start,
    end,
    allDay: true,
    extendedProps: { 
      calendar: "Meeting",
      meetingLink,
      isMeeting: true
    },
    backgroundColor: getPlatformColor(platform),
    borderColor: getPlatformColor(platform),
  };
};

/**
 * Validate event form data
 */
export const validateEventForm = (formData: {
  title: string;
  startDate: string;
  endDate: string;
  meetingLink?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!formData.title.trim()) {
    errors.push('Event title is required');
  }
  
  if (!formData.startDate) {
    errors.push('Start date is required');
  }
  
  if (!formData.endDate) {
    errors.push('End date is required');
  }
  
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }
  }
  
  if (formData.meetingLink && !isValidUrl(formData.meetingLink)) {
    errors.push('Please enter a valid meeting link');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Open URL in new tab
 */
export const openInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Format datetime for input field (YYYY-MM-DDTHH:MM)
 */
export const formatDateTimeForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

/**
 * Get today's date in input format
 */
export const getTodayInputFormat = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Get tomorrow's date in input format
 */
export const getTomorrowInputFormat = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForInput(tomorrow);
};
