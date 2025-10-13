import React from 'react';
import { EventFormState } from './types';
import { CSS_CLASSES, ARIA_LABELS } from './constants';

interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formState: EventFormState;
  onFormChange: (field: keyof EventFormState, value: string) => void;
  isEditing: boolean;
}

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({
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

  const handleInputChange = (field: keyof EventFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onFormChange(field, e.target.value);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h5 
                id="meeting-modal-title"
                className="text-xl font-semibold text-gray-800 dark:text-white"
              >
                {isEditing ? "Edit Meeting" : "Schedule New Meeting"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add meeting details to save to your calendar and database
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
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
            {/* Meeting Title */}
            <div>
              <label htmlFor="meeting-title" className={CSS_CLASSES.formLabel}>
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                id="meeting-title"
                type="text"
                value={formState.title}
                onChange={handleInputChange('title')}
                className={CSS_CLASSES.formInput}
                placeholder="e.g., Weekly Team Sync"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="meeting-description" className={CSS_CLASSES.formLabel}>
                Description
              </label>
              <textarea
                id="meeting-description"
                value={formState.description}
                onChange={handleInputChange('description')}
                className={CSS_CLASSES.formInput}
                placeholder="Add meeting agenda or notes..."
                rows={3}
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-datetime" className={CSS_CLASSES.formLabel}>
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="start-datetime"
                  type="datetime-local"
                  value={formState.startDate}
                  onChange={handleInputChange('startDate')}
                  className={CSS_CLASSES.formInput}
                  required
                />
              </div>

              <div>
                <label htmlFor="end-datetime" className={CSS_CLASSES.formLabel}>
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="end-datetime"
                  type="datetime-local"
                  value={formState.endDate}
                  onChange={handleInputChange('endDate')}
                  className={CSS_CLASSES.formInput}
                  required
                />
              </div>
            </div>

            {/* Platform and Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className={CSS_CLASSES.formLabel}>
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  id="platform"
                  value={formState.platform}
                  onChange={handleInputChange('platform')}
                  className={CSS_CLASSES.formInput}
                  required
                >
                  <option value="GOOGLE_MEET">Google Meet</option>
                  <option value="ZOOM">Zoom</option>
                  <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
                  <option value="SLACK">Slack</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className={CSS_CLASSES.formLabel}>
                  Meeting Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={formState.type}
                  onChange={handleInputChange('type')}
                  className={CSS_CLASSES.formInput}
                  required
                >
                  <option value="VIDEO">Video Conference</option>
                  <option value="AUDIO">Audio Call</option>
                </select>
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label htmlFor="meeting-link" className={CSS_CLASSES.formLabel}>
                Meeting Link
              </label>
              <input
                id="meeting-link"
                type="url"
                value={formState.meetingLink}
                onChange={handleInputChange('meetingLink')}
                className={CSS_CLASSES.formInput}
                placeholder="https://meet.google.com/abc-defg-hij"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add your Google Meet, Zoom, or Teams link here
              </p>
            </div>

            {/* Participants */}
            <div>
              <label htmlFor="participants" className={CSS_CLASSES.formLabel}>
                Participants
              </label>
              <input
                id="participants"
                type="text"
                value={formState.participants}
                onChange={handleInputChange('participants')}
                className={CSS_CLASSES.formInput}
                placeholder="Separate names with commas: John, Sarah, Mike"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter participant names separated by commas
              </p>
            </div>

            {/* Topics */}
            <div>
              <label htmlFor="topics" className={CSS_CLASSES.formLabel}>
                Topics
              </label>
              <input
                id="topics"
                type="text"
                value={formState.topics}
                onChange={handleInputChange('topics')}
                className={CSS_CLASSES.formInput}
                placeholder="Project Planning, Budget Review, Design"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add topics separated by commas
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className={CSS_CLASSES.formLabel}>
                Status
              </label>
              <select
                id="status"
                value={formState.status}
                onChange={handleInputChange('status')}
                className={CSS_CLASSES.formInput}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              {isEditing ? "Update Meeting" : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


