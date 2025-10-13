import React, { useState, useCallback } from 'react';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { CalendarShimmer } from '@/components/common/ShimmerLoader';

export interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useErrorHandling = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: 'error',
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: undefined,
  });

  const [notificationState, setNotificationState] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info',
  });

  const setError = useCallback((message: string, type: ErrorState['type'] = 'error') => {
    setErrorState({
      hasError: true,
      message,
      type,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: '',
      type: 'error',
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setLoadingState({
      isLoading,
      loadingMessage: message,
    });
  }, []);

  const showNotification = useCallback((
    message: string, 
    type: NotificationState['type'] = 'info',
    duration: number = 3000
  ) => {
    setNotificationState({
      show: true,
      message,
      type,
    });

    // Auto-hide notification
    setTimeout(() => {
      setNotificationState(prev => ({ ...prev, show: false }));
    }, duration);
  }, []);

  const hideNotification = useCallback(() => {
    setNotificationState(prev => ({ ...prev, show: false }));
  }, []);

  // Predefined error handlers
  const handleValidationError = useCallback((errors: string[]) => {
    setError(errors.join(', '), 'warning');
  }, [setError]);

  const handleNetworkError = useCallback(() => {
    setError(ERROR_MESSAGES.networkError);
  }, [setError]);

  const handleSaveError = useCallback(() => {
    setError(ERROR_MESSAGES.saveError);
  }, [setError]);

  const handleLoadError = useCallback(() => {
    setError(ERROR_MESSAGES.loadError);
  }, [setError]);

  // Success handlers
  const showSuccessNotification = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showEventSavedNotification = useCallback(() => {
    showSuccessNotification(SUCCESS_MESSAGES.eventSaved);
  }, [showSuccessNotification]);

  const showEventUpdatedNotification = useCallback(() => {
    showSuccessNotification(SUCCESS_MESSAGES.eventUpdated);
  }, [showSuccessNotification]);

  const showLinkCopiedNotification = useCallback(() => {
    showSuccessNotification(SUCCESS_MESSAGES.linkCopied);
  }, [showSuccessNotification]);

  return {
    // State
    errorState,
    loadingState,
    notificationState,
    
    // Error handlers
    setError,
    clearError,
    handleValidationError,
    handleNetworkError,
    handleSaveError,
    handleLoadError,
    
    // Loading handlers
    setLoading,
    
    // Notification handlers
    showNotification,
    hideNotification,
    showSuccessNotification,
    showEventSavedNotification,
    showEventUpdatedNotification,
    showLinkCopiedNotification,
  };
};

// Error boundary component
export const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}> = ({ children, fallback: Fallback }) => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    if (Fallback) {
      return <Fallback error={error} resetError={resetError} />;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-red-500">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {error.message}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Loading component with shimmer effect
export const LoadingSpinner: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message, size = 'md' }) => {
  return <CalendarShimmer message={message} />;
};

// Notification component
export const Notification: React.FC<{
  notification: NotificationState;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  if (!notification.show) return null;

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${typeClasses[notification.type]} rounded-lg shadow-lg p-4 flex items-center justify-between`}>
        <p className="text-sm font-medium">{notification.message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
