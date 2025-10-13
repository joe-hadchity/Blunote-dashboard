"use client";
import React, { useEffect, useState } from "react";
import { Square, Mic } from "lucide-react";
import Image from "next/image";

interface RecordingStatus {
  isRecording: boolean;
  duration: number;
  title?: string;
}

export default function SidebarWidget() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    isRecording: false,
    duration: 0,
  });
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const MIN_RECORDING_DURATION = 30; // 30 seconds minimum

  // Format duration as HH:MM:SS or MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Check if Chrome extension is installed
  useEffect(() => {
    // Check for Bluenote extension by trying to detect it
    const checkExtension = () => {
      // @ts-ignore - Chrome extension API
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          // Try to send a message to the extension
          // You'll need to add your extension ID here
          const EXTENSION_ID = 'YOUR_EXTENSION_ID_HERE'; // Replace with actual extension ID
          
          // For now, we'll just check if chrome.runtime exists
          setIsExtensionInstalled(true);
        } catch (e) {
          setIsExtensionInstalled(false);
        }
      }
    };

    checkExtension();
  }, []);

  // Poll for recording status
  useEffect(() => {
    if (!isExtensionInstalled) return;

    const checkRecordingStatus = () => {
      // Listen for messages from the extension
      window.addEventListener('message', (event) => {
        if (event.data.type === 'RECORDING_STATUS') {
          setRecordingStatus({
            isRecording: event.data.isRecording,
            duration: event.data.duration || 0,
            title: event.data.title,
          });
        }
      });
    };

    checkRecordingStatus();

    // Update duration every second if recording
    const interval = setInterval(() => {
      if (recordingStatus.isRecording) {
        setRecordingStatus(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExtensionInstalled, recordingStatus.isRecording]);

  // Handle stop button click - check duration first
  const handleStopClick = () => {
    if (recordingStatus.duration < MIN_RECORDING_DURATION) {
      // Show warning if recording is too short
      setShowWarningModal(true);
    } else {
      // Duration is OK, stop recording
      stopRecording();
    }
  };

  // Actually stop the recording
  const stopRecording = async () => {
    try {
      setShowWarningModal(false);
      
      // Send message to extension to stop recording
      window.postMessage({ type: 'STOP_RECORDING_REQUEST' }, '*');
      
      // Also try Chrome extension API if available
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          // @ts-ignore
          chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
            console.log('Stop recording response:', response);
          });
        } catch (e) {
          console.log('Extension communication error:', e);
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Discard recording (stop without saving)
  const discardRecording = async () => {
    try {
      setShowWarningModal(false);
      
      // Send discard message to extension
      window.postMessage({ type: 'DISCARD_RECORDING_REQUEST' }, '*');
      
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          // @ts-ignore
          chrome.runtime.sendMessage({ type: 'DISCARD_RECORDING' }, (response) => {
            console.log('Discard recording response:', response);
          });
        } catch (e) {
          console.log('Extension communication error:', e);
        }
      }
    } catch (error) {
      console.error('Error discarding recording:', error);
    }
  };

  if (!recordingStatus.isRecording) {
    return null; // Don't show widget when not recording
  }

  return (
    <>
      <div className="mx-auto mb-6 w-full max-w-60">
        <div className="relative rounded-xl bg-white dark:bg-gray-dark border-2 border-red-500 overflow-hidden shadow-lg">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 opacity-50"></div>
          
          {/* Content */}
          <div className="relative px-4 py-4">
            {/* Header with logo */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image 
                    src="/images/logo/logo-icon.svg" 
                    alt="Bluenote" 
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    Bluenote
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Recording
                    </span>
                  </div>
                </div>
              </div>
              
              <Mic className="w-5 h-5 text-red-500 animate-pulse" strokeWidth={2} />
            </div>

            {/* Duration Display */}
            <div className="mb-4 text-center">
              <div className="text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                {formatDuration(recordingStatus.duration)}
              </div>
              {recordingStatus.title && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate" title={recordingStatus.title}>
                  {recordingStatus.title}
                </p>
              )}
            </div>

            {/* Minimum duration warning */}
            {recordingStatus.duration < MIN_RECORDING_DURATION && (
              <div className="mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                  Min. {MIN_RECORDING_DURATION}s required to save
                </p>
              </div>
            )}

            {/* Stop button */}
            <button
              onClick={handleStopClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-all hover:shadow-lg"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </button>

            {/* Info text */}
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-3">
              {recordingStatus.duration >= MIN_RECORDING_DURATION 
                ? 'Auto-saving to dashboard' 
                : `Record ${MIN_RECORDING_DURATION - recordingStatus.duration}s more to save`}
            </p>
          </div>

          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                Recording Too Short
              </h3>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                Your recording is only <strong>{recordingStatus.duration} seconds</strong> long. 
                Recordings must be at least <strong>30 seconds</strong> to be saved.
                <br /><br />
                If you stop now, this recording will <strong>not be saved</strong>.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Continue Recording
                </button>
                <button
                  onClick={discardRecording}
                  className="w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  Discard & Stop Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
