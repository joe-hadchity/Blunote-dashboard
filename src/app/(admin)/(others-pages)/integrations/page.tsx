"use client";
import React from 'react';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import GoogleCalendarConnect from '@/components/calendar/GoogleCalendarConnect';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Integrations" />

      {/* Page Description */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your favorite tools and platforms to sync meetings, calendars, and productivity data automatically.
        </p>
      </div>

      {/* Active Integrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Active Integrations
          </h2>
          <span className="text-sm text-body dark:text-bodydark">
            1 connected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Google Calendar Integration */}
          <GoogleCalendarConnect />
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Coming Soon
          </h2>
          <span className="text-sm text-primary font-medium">
            More on the way
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Microsoft Outlook */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Image 
                  src="/images/icon/ms-outlook.svg" 
                  alt="Microsoft Outlook" 
                  width={36} 
                  height={36}
                />
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full">
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Microsoft Outlook
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect Outlook calendar and Teams meetings for seamless integration.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Calendar
              </span>
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Teams
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                disabled 
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
              >
                Not Available Yet
              </button>
            </div>
          </div>

          {/* Slack */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <svg width="36" height="36" viewBox="0 0 24 24">
                  <path fill="#4A154B" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.528 2.528 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.528 2.528 0 0 1-2.523-2.523 2.528 2.528 0 0 1 2.523-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full">
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Slack
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get meeting notifications and sync calendar with Slack channels.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Notifications
              </span>
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Huddles
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                disabled 
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
              >
                Not Available Yet
              </button>
            </div>
          </div>

          {/* Zoom */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Image 
                  src="/images/icon/zoom-meeting.svg" 
                  alt="Zoom" 
                  width={36} 
                  height={36}
                />
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full">
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Zoom
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Automatically sync Zoom meetings and recordings to your dashboard.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Meetings
              </span>
              <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                Recordings
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                disabled 
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
              >
                Not Available Yet
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">
                More Integrations Coming Soon
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We're actively working on integrations with Microsoft Outlook, Zoom, Slack, and other popular productivity platforms. Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
