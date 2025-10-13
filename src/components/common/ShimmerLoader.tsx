import React from 'react';

// Shared shimmer styles
export const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  .shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      90deg,
      #f3f4f6 0%,
      #e5e7eb 20%,
      #f3f4f6 40%,
      #f3f4f6 100%
    );
    background-size: 1000px 100%;
  }
  .dark .shimmer {
    background: linear-gradient(
      90deg,
      #1f2937 0%,
      #374151 20%,
      #1f2937 40%,
      #1f2937 100%
    );
    background-size: 1000px 100%;
  }
  .shimmer-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// Integration Card Shimmer
export const IntegrationCardShimmer: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <style>{shimmerStyles}</style>
      <div>
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-[60px] h-[60px] shimmer rounded-lg"></div>
          <div className="h-6 w-24 shimmer rounded-full"></div>
        </div>
        
        {/* Title skeleton */}
        <div className="h-6 w-40 shimmer rounded mb-2"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full shimmer rounded"></div>
          <div className="h-4 w-3/4 shimmer rounded"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 shimmer rounded"></div>
          <div className="h-6 w-16 shimmer rounded"></div>
          <div className="h-6 w-24 shimmer rounded"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="h-11 w-full shimmer rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

// Calendar Shimmer - Improved for Calendar/List views
export const CalendarShimmer: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md overflow-hidden">
      <style>{shimmerStyles}</style>
      
      {/* Header - View Toggle and Sync */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          {/* View Toggle Shimmer */}
          <div className="inline-flex gap-1">
            <div className="h-10 w-24 shimmer rounded-lg"></div>
            <div className="h-10 w-20 shimmer rounded-lg opacity-60"></div>
          </div>
          
          {/* Sync Button Shimmer */}
          <div className="h-10 w-20 shimmer rounded-lg"></div>
        </div>
      </div>
      
      {/* Calendar View Content */}
      <div className="p-6">
        {/* FullCalendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-9 w-40 shimmer rounded-lg"></div>
          <div className="flex gap-2">
            <div className="h-9 w-20 shimmer rounded-lg"></div>
            <div className="h-9 w-9 shimmer rounded-lg"></div>
            <div className="h-9 w-9 shimmer rounded-lg"></div>
            <div className="h-9 w-9 shimmer rounded-lg"></div>
          </div>
        </div>
        
        {/* Calendar grid skeleton */}
        <div className="space-y-1">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="h-8 shimmer rounded flex items-center justify-center"></div>
            ))}
          </div>
          
          {/* Calendar dates - 5 weeks */}
          {[...Array(5)].map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, dayIndex) => {
                const hasEvent = (weekIndex + dayIndex) % 3 === 0;
                const hasMultiple = (weekIndex + dayIndex) % 5 === 0;
                return (
                  <div key={dayIndex} className="h-24 bg-gray-50 dark:bg-gray-800/30 rounded p-1.5 space-y-1">
                    <div className="h-3 w-4 shimmer rounded"></div>
                    {hasEvent && (
                      <>
                        <div className="h-5 w-full shimmer rounded text-xs"></div>
                        {hasMultiple && (
                          <div className="h-5 w-full shimmer rounded text-xs opacity-75"></div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {message && (
          <div className="mt-6 text-center">
            <div className="h-4 w-48 shimmer rounded mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Calendar List View Shimmer
export const CalendarListShimmer: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md overflow-hidden">
      <style>{shimmerStyles}</style>
      
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex gap-1">
            <div className="h-10 w-24 shimmer rounded-lg opacity-60"></div>
            <div className="h-10 w-20 shimmer rounded-lg opacity-60"></div>
            <div className="h-10 w-20 shimmer rounded-lg"></div>
          </div>
          <div className="h-10 w-28 shimmer rounded-lg"></div>
        </div>
      </div>

      {/* List Content */}
      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {/* Day Groups */}
        {[...Array(3)].map((_, dayIndex) => (
          <div key={dayIndex}>
            {/* Date Header */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="h-4 w-24 shimmer rounded"></div>
            </div>

            {/* Events for this day */}
            <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {[...Array(dayIndex === 0 ? 3 : dayIndex === 1 ? 2 : 1)].map((_, eventIndex) => (
                <div key={eventIndex} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Time and Content */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* Time */}
                      <div className="flex-shrink-0 w-20">
                        <div className="h-4 w-16 shimmer rounded mb-1"></div>
                        <div className="h-3 w-10 shimmer rounded"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`h-4 shimmer rounded mb-2 ${eventIndex % 2 === 0 ? 'w-64' : 'w-48'}`}></div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 shimmer rounded"></div>
                          <div className="h-3 w-24 shimmer rounded"></div>
                          <div className="w-4 h-4 shimmer rounded"></div>
                        </div>
                        {/* Feature badges */}
                        {eventIndex % 2 === 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-20 shimmer rounded"></div>
                            <div className="h-6 w-16 shimmer rounded"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Join button */}
                    {eventIndex === 0 && (
                      <div className="h-9 w-9 shimmer rounded-lg flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-white/[0.05]">
        <div className="h-3 w-32 shimmer rounded"></div>
      </div>
    </div>
  );
};

// Table Row Shimmer for Meetings List
export const TableRowShimmer: React.FC = () => {
  return (
    <>
      <style>{shimmerStyles}</style>
      <tr className="border-b border-gray-200 dark:border-gray-800">
        <td className="px-4 py-4">
          <div className="h-5 w-48 shimmer rounded"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-5 w-32 shimmer rounded"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-5 w-24 shimmer rounded"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-5 w-20 shimmer rounded"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-8 w-24 shimmer rounded-full"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex gap-2">
            <div className="h-8 w-8 shimmer rounded"></div>
            <div className="h-8 w-8 shimmer rounded"></div>
          </div>
        </td>
      </tr>
    </>
  );
};

// Meetings Table Shimmer - Improved
export const MeetingsTableShimmer: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <>
      <style>{shimmerStyles}</style>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 text-left">
                  <div className="h-3 w-16 shimmer rounded"></div>
                </th>
                <th className="px-5 py-3 text-left">
                  <div className="h-3 w-24 shimmer rounded"></div>
                </th>
                <th className="px-5 py-3 text-left">
                  <div className="h-3 w-28 shimmer rounded"></div>
                </th>
                <th className="px-5 py-3 text-left">
                  <div className="h-3 w-16 shimmer rounded"></div>
                </th>
                <th className="px-5 py-3 text-end">
                  <div className="h-3 w-16 shimmer rounded ml-auto"></div>
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {[...Array(rows)].map((_, i) => (
                <tr key={i} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                  {/* Meeting Column */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Star placeholder */}
                      {i % 3 === 0 && <div className="w-4 h-4 shimmer rounded"></div>}
                      <div className={`h-4 shimmer rounded ${i % 2 === 0 ? 'w-48' : 'w-36'}`}></div>
                    </div>
                    <div className="h-3 w-32 shimmer rounded"></div>
                  </td>
                  {/* Platform & Type Column */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 shimmer rounded"></div>
                      <div className="w-5 h-5 shimmer rounded"></div>
                    </div>
                  </td>
                  {/* Available Content Column */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {[...Array(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1)].map((_, j) => (
                        <div key={j} className="h-5 w-16 shimmer rounded"></div>
                      ))}
                    </div>
                  </td>
                  {/* Duration Column */}
                  <td className="px-5 py-4">
                    <div className="h-4 w-12 shimmer rounded"></div>
                  </td>
                  {/* Actions Column */}
                  <td className="px-5 py-4 text-end">
                    <div className="inline-block w-8 h-8 shimmer rounded-full"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Recording Detail Page Shimmer - Improved
export const MeetingDetailShimmer: React.FC = () => {
  return (
    <>
      <style>{shimmerStyles}</style>
      <div className="space-y-6">
        {/* Back Button & Title Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Back button */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-20 shimmer rounded"></div>
            </div>
            
            {/* Title */}
            <div className="h-8 w-96 max-w-full shimmer rounded mb-3"></div>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 shimmer rounded"></div>
                <div className="h-4 w-24 shimmer rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 shimmer rounded"></div>
                <div className="h-4 w-32 shimmer rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 shimmer rounded"></div>
                <div className="h-4 w-20 shimmer rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 shimmer rounded"></div>
                <div className="h-4 w-28 shimmer rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 shimmer rounded-lg"></div>
            <div className="h-9 w-9 shimmer rounded-lg"></div>
            <div className="h-9 w-9 shimmer rounded-lg"></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex gap-1">
            <div className="h-10 w-32 shimmer rounded-t-lg"></div>
            <div className="h-10 w-28 shimmer rounded-t-lg opacity-60"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio/Video Player Card */}
            <div className="bg-white dark:bg-gray-dark rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
              <div className="p-6">
                <div className="h-5 w-28 shimmer rounded mb-4"></div>
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg shimmer-pulse mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 shimmer rounded-full"></div>
                </div>
                {/* Player controls */}
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 shimmer rounded-full"></div>
                  <div className="flex-1 h-2 shimmer rounded-full"></div>
                  <div className="h-4 w-16 shimmer rounded"></div>
                </div>
              </div>
            </div>

            {/* Transcript Card */}
            <div className="bg-white dark:bg-gray-dark rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-28 shimmer rounded"></div>
                <div className="h-9 w-32 shimmer rounded-lg"></div>
              </div>
              <div className="space-y-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-14 flex-shrink-0">
                      <div className="h-3 w-12 shimmer rounded"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 shimmer rounded"></div>
                      <div className="h-4 w-full shimmer rounded"></div>
                      {i % 2 === 0 && <div className="h-4 w-11/12 shimmer rounded"></div>}
                      {i % 3 === 0 && <div className="h-4 w-4/5 shimmer rounded"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-gray-dark rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="h-6 w-24 shimmer rounded mb-4"></div>
              <div className="space-y-4">
                {['Duration', 'Date', 'Platform', 'Type', 'Status', 'Participants'].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 shimmer rounded"></div>
                    <div className={`h-4 shimmer rounded ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants Card */}
            <div className="bg-white dark:bg-gray-dark rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="h-6 w-28 shimmer rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 shimmer rounded-full"></div>
                    <div className={`h-4 shimmer rounded ${i % 2 === 0 ? 'w-28' : 'w-24'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics Card */}
            <div className="bg-white dark:bg-gray-dark rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
              <div className="h-6 w-16 shimmer rounded mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-7 shimmer rounded-full ${['w-20', 'w-24', 'w-16', 'w-28', 'w-18'][i % 5]}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

