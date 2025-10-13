"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

// Memoize the component to prevent unnecessary re-renders
const CookieConsent = memo(function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    savePreferences(allPreferences);
  }, []);

  const handleRejectAll = useCallback(() => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    savePreferences(minimalPreferences);
  }, []);

  const handleSavePreferences = useCallback(() => {
    savePreferences(preferences);
  }, [preferences]);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    // Emit custom event for auth system to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  }, []);

  const handleManagePreferences = useCallback(() => {
    setShowSettings(true);
  }, []);

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed inset-x-0 bottom-0 z-50 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      We use cookies to enhance your browsing experience, provide authentication, 
                      and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                    <button
                      onClick={handleManagePreferences}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 font-medium"
                    >
                      Manage Preferences
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Manage your cookie preferences. You can enable or disable different types of cookies below.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Necessary Cookies
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    These cookies are essential for the website to function properly. They enable core 
                    functionality such as security, authentication, and network management.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Duration:</strong> Session or up to 30 days (if "Remember Me" is enabled)
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Cookies:</strong> sb-access-token, sb-refresh-token
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-6 bg-blue-600 rounded-full cursor-not-allowed opacity-50 flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    These cookies enable enhanced functionality and personalization, such as 
                    remembering your preferences (theme, language) and providing enhanced features.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Duration:</strong> Up to 1 year
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Cookies:</strong> theme-preference, language-preference
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, functional: !prev.functional }))}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                      preferences.functional ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    } px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    These cookies help us understand how visitors interact with our website by 
                    collecting and reporting information anonymously.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Duration:</strong> Up to 2 years
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Cookies:</strong> _ga, _gid, _gat (Google Analytics)
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                      preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    } px-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <div className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Note:</strong> Disabling certain cookies may affect your experience and limit 
                    the features available to you. Authentication cookies are required for login functionality.
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default CookieConsent;
