"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import React, { useEffect, useState } from "react";
import { Download, Eraser } from "lucide-react";

export default function Settings() {
  // Initialize with saved settings or defaults
  const [recordingSettings, setRecordingSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recordingSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      autoTranscribe: true,
      recordingQuality: 'high',
    };
  });

  const [privacySettings, setPrivacySettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('privacySettings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      autoDeleteAfter: 'never',
    };
  });

  const [showCleanDataModal, setShowCleanDataModal] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Set page title
  useEffect(() => {
    document.title = "Settings | Bluenote - AI-Powered Meeting Assistant";
  }, []);

  // Fetch user stats for displaying in clean data modal
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recordingSettings', JSON.stringify(recordingSettings));
      
      // Also save to backend
      fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recordingSettings, privacySettings }),
      }).catch(err => console.error('Failed to save settings to backend:', err));
    }
  }, [recordingSettings, privacySettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      
      // Also save to backend
      fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recordingSettings, privacySettings }),
      }).catch(err => console.error('Failed to save settings to backend:', err));
      
      // Trigger auto-delete if setting changed
      if (privacySettings.autoDeleteAfter && privacySettings.autoDeleteAfter !== 'never') {
        handleAutoDelete();
      }
    }
  }, [privacySettings, recordingSettings]);

  const handleAutoDelete = async () => {
    try {
      const response = await fetch('/api/user/auto-delete-recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ autoDeleteAfter: privacySettings.autoDeleteAfter }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auto-delete result:', data);
        
        // If recordings were deleted, refresh stats
        if (data.deletedCount > 0) {
          const statsResponse = await fetch('/api/user/stats', { credentials: 'include' });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        }
      }
    } catch (error) {
      console.error('Auto-delete error:', error);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/user/download-data', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename with current date
        const dateStr = new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }).replace(/,/g, '').replace(/ /g, '-');
        
        a.download = `bluenote-export-${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to download data: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
      return false;
    }
  };

  const handleCleanData = async () => {
    setIsCleaning(true);
    try {
      const response = await fetch('/api/user/clean-data', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowCleanDataModal(false);
        setCleanConfirmText('');
        alert(`Successfully cleaned! ${data.deletedRecordings || 0} recordings deleted. Your calendar meetings are preserved.`);
        // Refresh stats
        const statsResponse = await fetch('/api/user/stats', { credentials: 'include' });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to clean data: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error cleaning data:', error);
      alert('Failed to clean data. Please try again.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCloseCleanModal = () => {
    setShowCleanDataModal(false);
    setCleanConfirmText('');
  };

  // Helper to format storage
  const formatStorage = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      
      <div className="space-y-6">
        {/* Privacy & Data Retention */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Privacy & Data Retention
          </h3>
          <div className="space-y-4">
            {/* Auto-Delete Recordings */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-1">
                    Auto-Delete Recordings
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically delete old recordings to save storage
                  </p>
                </div>
                <select
                  value={privacySettings.autoDeleteAfter}
                  onChange={(e) => setPrivacySettings(prev => ({ ...prev, autoDeleteAfter: e.target.value }))}
                  className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="never">Never</option>
                  <option value="30">After 30 days</option>
                  <option value="60">After 60 days</option>
                  <option value="90">After 90 days</option>
                  <option value="180">After 6 months</option>
                  <option value="365">After 1 year</option>
                </select>
              </div>
              
              {/* Active indicator */}
              {privacySettings.autoDeleteAfter && privacySettings.autoDeleteAfter !== 'never' && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    ✓ Active: Recordings older than {privacySettings.autoDeleteAfter} days will be automatically deleted
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Data Management Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
                Data Management
              </h4>
              <div className="space-y-3">
                {/* Download Your Data */}
                <button
                  onClick={handleDownloadData}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                        Download Your Data
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Export all recordings and meetings as ZIP
                      </p>
                    </div>
                  </div>
                </button>

                {/* Clean My Data */}
                <button
                  onClick={() => setShowCleanDataModal(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Eraser className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-400">
                        Clean My Data
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Delete recordings, keep calendar meetings
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 relative">
          <div className="flex items-center justify-between mb-5 lg:mb-7">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Notification Preferences
            </h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="space-y-4 opacity-60 pointer-events-none">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked disabled />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Push Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive push notifications in browser
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked disabled />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  SMS Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via SMS
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" disabled />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end opacity-60 pointer-events-none">
            <button disabled className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50">
              Save Preferences
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <ThemeToggleButton />
            </div>
          </div>
        </div>

        {/* Recording Preferences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 relative">
          <div className="flex items-center justify-between mb-5 lg:mb-7">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recording Preferences
            </h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="space-y-4 opacity-60 pointer-events-none">
            {/* Auto-Transcribe */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Auto-Transcribe
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically transcribe new recordings
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked disabled />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>

            {/* Recording Quality */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-1">
                  Recording Quality
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Audio quality (higher uses more storage)
                </p>
              </div>
              <select
                disabled
                className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="standard">Standard (64 kbps)</option>
                <option value="high">High (128 kbps)</option>
                <option value="highest">Highest (256 kbps)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Data Confirmation Modal */}
      {showCleanDataModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-orange-100 dark:bg-orange-900/20">
                <Eraser className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-3">
                Clean recordings data?
              </h3>
              
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                This will permanently delete {stats?.totalRecordings || 0} recordings ({formatStorage(stats?.storageUsedMB || 0)}), transcripts, and AI summaries. Your synced calendar meetings will remain. This action cannot be undone.
              </p>

              {/* Type to Confirm */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Type <span className="font-bold text-orange-600 dark:text-orange-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={cleanConfirmText}
                  onChange={(e) => setCleanConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  disabled={isCleaning}
                  className="w-full px-4 py-2.5 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleCleanData}
                  disabled={isCleaning || cleanConfirmText !== 'DELETE'}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCleaning ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cleaning...
                    </>
                  ) : (
                    'Clean Data'
                  )}
                </button>
                
                <button
                  onClick={handleCloseCleanModal}
                  disabled={isCleaning}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}