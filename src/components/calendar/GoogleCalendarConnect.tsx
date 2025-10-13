"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function GoogleCalendarConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    // Check if user has Google Calendar connected
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          // Check if user has Google Calendar tokens
          setIsConnected(data.user?.google_calendar_connected || false);
        }
      } catch (error) {
        console.error('Error checking Google Calendar connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/google-calendar/auth', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        }
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('⚠️ Disconnect Google Calendar?\n\nThis will:\n• Remove your calendar connection\n• Delete all synced meetings from your dashboard\n\nYou can reconnect anytime.')) {
      return;
    }

    setIsDisconnecting(true);
    
    try {
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(false);
        
        // Show success message
        alert('✅ Google Calendar disconnected successfully!\n\nAll synced meetings have been removed.');
        
        // Reload to refresh the page
        window.location.href = '/integrations';
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      alert('❌ Failed to disconnect Google Calendar. Please try again.');
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Image 
            src="/images/icon/google-calendar.svg" 
            alt="Google Calendar" 
            width={36} 
            height={36}
          />
        </div>
        {isConnected && (
          <span className="px-3 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
            Connected
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
        Google Calendar
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {isConnected 
          ? 'Your Google Calendar is synced. All your meetings will appear here automatically.'
          : 'Sync your Google Calendar to automatically import meetings and events.'}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
          Meetings
        </span>
        <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
          Events
        </span>
        <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
          Auto-sync
        </span>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDisconnecting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Image 
              src="/images/icon/google-calendar.svg" 
              alt="Google Calendar" 
              width={18} 
              height={18}
              className="brightness-0 invert"
            />
            Connect Google Calendar
          </button>
        )}
      </div>
    </div>
  );
}
