import React from 'react';
import { EventModalProps } from './types';
import { CALENDAR_EVENT_LEVELS, CSS_CLASSES, ARIA_LABELS, MEETING_LINK_PLACEHOLDERS } from './constants';

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formState,
  onFormChange,
  isEditing,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleInputChange = (field: keyof typeof formState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormChange(field, e.target.value);
  };

  const handleRadioChange = (value: string) => {
    onFormChange('level', value);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50"
      style={{ backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-[700px] w-full mx-4 p-6 lg:p-10 relative">
        <button
          onClick={onClose}
          className={CSS_CLASSES.closeButton}
          aria-label={ARIA_LABELS.closeModal}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <form onSubmit={handleSubmit}>
          <div className={CSS_CLASSES.modalContent}>
            <div>
              <h5 
                id="event-modal-title"
                className={CSS_CLASSES.modalTitle}
              >
                {isEditing ? "Edit Event" : "Add Event"}
              </h5>
              <p className={CSS_CLASSES.modalDescription}>
                Plan your next big moment: schedule or edit an event to stay on track
              </p>
            </div>
            
            <div className="mt-8">
              {/* Event Title */}
              <div>
                <label 
                  htmlFor="event-title"
                  className={CSS_CLASSES.formLabel}
                >
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={formState.title}
                  onChange={handleInputChange('title')}
                  className={CSS_CLASSES.formInput}
                  placeholder="Enter event title"
                  aria-label={ARIA_LABELS.eventTitle}
                  required
                />
              </div>

              {/* Event Color/Level */}
              <div className={CSS_CLASSES.formField}>
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Priority Level
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(CALENDAR_EVENT_LEVELS).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div className={`form-check form-check-${value} form-check-inline`}>
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={formState.level === key}
                              onChange={() => handleRadioChange(key)}
                              aria-label={`${ARIA_LABELS.eventLevel}: ${key}`}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  formState.level === key ? "block" : "hidden"
                                }`}  
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div className={CSS_CLASSES.formField}>
                <label 
                  htmlFor="event-start-date"
                  className={CSS_CLASSES.formLabel}
                >
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={formState.startDate}
                    onChange={handleInputChange('startDate')}
                    className={`${CSS_CLASSES.formInput} appearance-none bg-none pl-4 pr-11`}
                    aria-label={ARIA_LABELS.eventStartDate}
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div className={CSS_CLASSES.formField}>
                <label 
                  htmlFor="event-end-date"
                  className={CSS_CLASSES.formLabel}
                >
                  End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="date"
                    value={formState.endDate}
                    onChange={handleInputChange('endDate')}
                    className={`${CSS_CLASSES.formInput} appearance-none bg-none pl-4 pr-11`}
                    aria-label={ARIA_LABELS.eventEndDate}
                    required
                  />
                </div>
              </div>
              
              {/* Meeting Link */}
              <div className={CSS_CLASSES.formField}>
                <label 
                  htmlFor="event-meeting-link"
                  className={CSS_CLASSES.formLabel}
                >
                  Meeting Link (Optional)
                </label>
                <input
                  id="event-meeting-link"
                  type="url"
                  value={formState.meetingLink}
                  onChange={handleInputChange('meetingLink')}
                  placeholder={MEETING_LINK_PLACEHOLDERS.generic}
                  className={CSS_CLASSES.formInput}
                  aria-label={ARIA_LABELS.meetingLink}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add a meeting link (Google Meet, Zoom, Teams, etc.) to make this a scheduled meeting
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className={CSS_CLASSES.modalFooter}>
              <button
                onClick={onClose}
                type="button"
                className={CSS_CLASSES.buttonSecondary}
                aria-label={ARIA_LABELS.closeModal}
              >
                Close
              </button>
              <button
                type="submit"
                className={CSS_CLASSES.buttonPrimary}
                aria-label={isEditing ? "Update event" : "Add event"}
              >
                {isEditing ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
