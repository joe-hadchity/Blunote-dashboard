"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MeetingsTable from "@/components/tables/MeetingsTable";
import React, { useEffect } from "react";

export default function Recordings() {
  // Run auto-delete check when page loads
  useEffect(() => {
    const checkAutoDelete = async () => {
      try {
        // Get user settings from localStorage
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
          const privacySettings = JSON.parse(savedSettings);
          
          // If auto-delete is enabled, trigger it
          if (privacySettings.autoDeleteAfter && privacySettings.autoDeleteAfter !== 'never') {
            const response = await fetch('/api/user/auto-delete-recordings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ autoDeleteAfter: privacySettings.autoDeleteAfter }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.deletedCount > 0) {
                console.log(`Auto-deleted ${data.deletedCount} old recordings`);
                // The table will refresh automatically
              }
            }
          }
        }
      } catch (error) {
        console.error('Auto-delete check error:', error);
      }
    };

    checkAutoDelete();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Recordings" />

      {/* Page Description */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View and manage all your video and audio recordings with transcripts, summaries, and AI insights.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <MeetingsTable 
            apiEndpoint="/api/recordings" 
            detailRoute="/recording"
          />
        </div>
      </div>
    </div>
  );
}
