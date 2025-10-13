import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent, EventFormState, PopupState, ModalState } from './types';
import { DEFAULT_EVENT_FORM_STATE } from './constants';
import { Meeting } from '@/components/tables/BasicTableOne';

export const useCalendarState = () => {
  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    selectedEvent: null,
  });
  
  // Popup state
  const [popupState, setPopupState] = useState<PopupState>({
    showMeetingPopup: false,
    showEventPopup: false,
    selectedMeeting: null,
    selectedEventForView: null,
  });
  
  // Form state
  const [formState, setFormState] = useState<EventFormState>(DEFAULT_EVENT_FORM_STATE);

  // Memoized computed values
  const isEditing = useMemo(() => !!modalState.selectedEvent, [modalState.selectedEvent]);
  
  const hasActivePopups = useMemo(() => 
    popupState.showMeetingPopup || popupState.showEventPopup,
    [popupState.showMeetingPopup, popupState.showEventPopup]
  );

  // Optimized event handlers with useCallback
  const openModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, selectedEvent: null });
    setFormState(DEFAULT_EVENT_FORM_STATE);
  }, []);

  const setSelectedEvent = useCallback((event: CalendarEvent | null) => {
    setModalState(prev => ({ ...prev, selectedEvent: event }));
  }, []);

  const updateFormField = useCallback((field: keyof EventFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(DEFAULT_EVENT_FORM_STATE);
  }, []);

  const showMeetingPopup = useCallback((meeting: Meeting) => {
    setPopupState(prev => ({
      ...prev,
      showMeetingPopup: true,
      selectedMeeting: meeting,
      showEventPopup: false,
      selectedEventForView: null,
    }));
  }, []);

  const showEventPopup = useCallback((event: CalendarEvent) => {
    setPopupState(prev => ({
      ...prev,
      showEventPopup: true,
      selectedEventForView: event,
      showMeetingPopup: false,
      selectedMeeting: null,
    }));
  }, []);

  const closeMeetingPopup = useCallback(() => {
    setPopupState(prev => ({
      ...prev,
      showMeetingPopup: false,
      selectedMeeting: null,
    }));
  }, []);

  const closeEventPopup = useCallback(() => {
    setPopupState(prev => ({
      ...prev,
      showEventPopup: false,
      selectedEventForView: null,
    }));
  }, []);

  const closeAllPopups = useCallback(() => {
    setPopupState({
      showMeetingPopup: false,
      showEventPopup: false,
      selectedMeeting: null,
      selectedEventForView: null,
    });
  }, []);

  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  }, []);

  const updateEvent = useCallback((eventId: string, updatedEvent: Partial<CalendarEvent>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updatedEvent }
          : event
      )
    );
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const setEventsList = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
  }, []);

  return {
    // State
    events,
    modalState,
    popupState,
    formState,
    
    // Computed values
    isEditing,
    hasActivePopups,
    
    // Modal handlers
    openModal,
    closeModal,
    setSelectedEvent,
    
    // Form handlers
    updateFormField,
    resetForm,
    
    // Popup handlers
    showMeetingPopup,
    showEventPopup,
    closeMeetingPopup,
    closeEventPopup,
    closeAllPopups,
    
    // Event handlers
    addEvent,
    updateEvent,
    removeEvent,
    setEventsList,
  };
};
