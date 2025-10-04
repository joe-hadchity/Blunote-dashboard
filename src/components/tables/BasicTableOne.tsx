"use client";

import React, { useState, useMemo } from "react";
import { Menu } from "@headlessui/react";
// We are no longer importing custom table components
import Badge from "../ui/badge/Badge";


// Interface for a recorded meeting
interface Meeting {
  id: number;
  title: string;
  date: string;
  lastModified: string;
  duration: string;
  type: "video" | "audio";
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "Slack";
  features: ("Transcript" | "Summary" | "Video File")[];
  isFavorite?: boolean;
}

// Dummy data for recorded meetings
export const initialTableData: Meeting[] = [
  {
    id: 1,
    title: "Weekly Project Sync",
    date: "2025-10-03T10:00:00Z",
    lastModified: "2025-10-03T11:30:00Z",
    duration: "45 min",
    type: "video",
    platform: "Google Meet",
    features: ["Transcript", "Summary", "Video File"],
    isFavorite: true,
  },
  {
    id: 2,
    title: "Client Onboarding Call",
    date: "2025-10-01T14:00:00Z",
    lastModified: "2025-10-02T09:00:00Z",
    duration: "1h 15min",
    type: "video",
    platform: "Zoom",
    features: ["Transcript", "Video File"],
    isFavorite: false,
  },
  {
    id: 3,
    title: "Internal Brainstorm Session",
    date: "2025-09-28T16:30:00Z",
    lastModified: "2025-09-28T17:15:00Z",
    duration: "32 min",
    type: "audio",
    platform: "Microsoft Teams",
    features: ["Transcript", "Summary"],
    isFavorite: false,
  },
  {
    id: 11,
    title: "Daily Stand-up",
    date: "2025-09-11T09:00:00Z",
    lastModified: "2025-09-11T09:15:00Z",
    duration: "10 min",
    type: "audio",
    platform: "Slack",
    features: ["Transcript"],
    isFavorite: false,
  },
  {
    id: 10,
    title: "Product Roadmap Planning",
    date: "2025-09-12T13:00:00Z",
    lastModified: "2025-09-13T10:00:00Z",
    duration: "2h",
    type: "video",
    platform: "Google Meet",
    features: ["Transcript"],
    isFavorite: true,
  },
];


// --- ICONS ---
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const TranscriptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const GoogleMeetLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#00832d" d="M12.43 14.99H18.5v-3.52h-6.07Z"/><path fill="#0066da" d="M6.54 18.5v-9.45l6.07 4.72Z"/><path fill="#e53935" d="M6.54 9.05V5.5h11.96v9.56l-5.89-4.51Z"/><path fill="#ffb400" d="M5.5 12.43v6.07h9.45Z"/><path fill="none" d="M0 0h24v24H0Z"/></svg>;
const ZoomLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#2D8CFF" d="M5,3C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5c0-1.105-0.895-2-2-2H5z M17.211,15.293l-2.296-2.296l2.296-2.296c0.391-0.391,0.391-1.024,0-1.414s-1.024-0.391-1.414,0l-2.296,2.296L11.204,9.293c-0.391-0.391-1.024-0.391-1.414,0s-0.391,1.024,0,1.414l2.296,2.296L9.79,15.293c-0.391,0.391-0.391,1.024,0,1.414s1.024,0.391,1.414,0l2.296-2.296l2.296,2.296c0.391,0.391,1.024,0.391,1.414,0S17.602,15.684,17.211,15.293z"/></svg>;
const TeamsLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4F52B2" d="M13.04,14.28h-3.9v-2.07c0-1.28.62-1.9,1.95-1.9s1.95.62,1.95,1.9v2.07Zm-1.46-4.54a.75.75,0,1,1,.75-.75a.75.75,0,0,1-.75-.75Z"/><path fill="#4F52B2" d="M22.5,9.63a1,1,0,0,0-1-1H16V5.8a1,1,0,0,0-1-1H3.5a1,1,0,0,0-1,1v12.4a1,1,0,0,0,1,1h11.4a1,1,0,0,0,1-1V13.12h5.53a1,1,0,0,0,1-1v-2.5Zm-10-2.35c0-2.4,1.38-3.79,3.8-3.79s3.8,1.39,3.8,3.79v1.89h-7.6Z"/></svg>;
const SlackLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#36C5F0" d="M9.7,14.25a2.5,2.5,0,0,1-2.5,2.5V19a5,5,0,0,0,5-5h-2.25A2.5,2.5,0,0,1,9.7,14.25Z"/><path fill="#2EB67D" d="M9.75,9.7a2.5,2.5,0,0,1-2.5-2.5V5a5,5,0,0,0,5,5V7.25A2.5,2.5,0,0,1,9.75,9.7Z"/><path fill="#ECB22E" d="M14.25,9.7a2.5,2.5,0,0,1,2.5-2.5h2.25a5,5,0,0,0-5,5v2.25A2.5,2.5,0,0,1,14.25,9.7Z"/><path fill="#E01E5A" d="M14.3,14.25a2.5,2.5,0,0,1,2.5,2.5V19a5,5,0,0,0-5-5V11.75a2.5,2.5,0,0,1,2.5,2.5Z"/></svg>;
const DotsVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /></svg>;
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.555.496l-3.15-1.575-2.54 1.27A.5.5 0 0 1 8 7.5v1.438l-2.255-1.127A.5.5 0 0 1 5 7.5v-2.305l-1.846-1.043A.5.5 0 0 1 3.5 4.5V.5a.5.5 0 0 1 .555-.496l3.15 1.575L9.74 3.06a.5.5 0 0 1 .5 0l2.63-1.315a.5.5 0 0 1 .448 0zM4.5 4.938l-1.5-1.071V.553l1.5 1.071v3.314z"/></svg>;
const StarIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" fill={filled ? "#FBBF24" : "currentColor"}/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>;
const FavoriteStar = () => <svg xmlns="http://www.w3.org/2000/svg" className="text-amber-400" width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.815 3.734 4.12 1.14a.75.75 0 0 1 .428 1.317l-3.21 3.28.89 4.34a.75.75 0 0 1-1.088.791L10 15.347l-3.775 2.14a.75.75 0 0 1-1.088-.79l.89-4.34-3.21-3.28a.75.75 0 0 1 .428-1.318l4.12-1.14L9.132 2.884Z" clipRule="evenodd" /></svg>;

// Helper to convert duration string to minutes for sorting
const durationToMinutes = (duration: string): number => {
  let totalMinutes = 0;
  if (duration.includes('h')) totalMinutes += parseInt(duration.split('h')[0]) * 60;
  if (duration.includes('min')) {
    const minPart = duration.split(' ').find(part => part.includes('min'));
    if (minPart) totalMinutes += parseInt(minPart.replace('min', ''));
  }
  return totalMinutes;
};


const initialFilterState = {
  dateRange: 'all',
  platforms: { 'Google Meet': false, 'Zoom': false, 'Microsoft Teams': false, 'Slack': false },
  content: { video: false, audio: false, transcript: false },
};

export default function MeetingsHistoryTable() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialTableData);
  const [filters, setFilters] = useState(initialFilterState);
  const [sort, setSort] = useState({ by: 'date', order: 'desc' });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [category, key] = name.split('.');
    if (category === 'platforms' || category === 'content') {
      setFilters(prev => ({ ...prev, [category]: { ...prev[category], [key]: checked } }));
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setShowCustomDateRange(value === 'custom');
    setFilters(prev => ({ ...prev, dateRange: value }));
  };
  
  const handleClearFilters = () => setFilters(initialFilterState);
  
  const handleRowClick = (id: number) => {
    console.log("Navigate to meeting details for ID:", id);
  };

  const handleDeleteMeeting = (id: number) => setMeetings(prev => prev.filter(m => m.id !== id));

  const handleToggleFavorite = (id: number) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
  };

  const filteredAndSortedData = useMemo(() => {
    let filteredData = [...meetings];
    const activePlatforms = Object.entries(filters.platforms).filter(([_, v]) => v).map(([k]) => k);
    if (activePlatforms.length > 0) filteredData = filteredData.filter(m => activePlatforms.includes(m.platform));
    
    const activeContentTypes = Object.entries(filters.content).filter(([_, v]) => v).map(([k]) => k);
    if (activeContentTypes.length > 0) {
      filteredData = filteredData.filter(m => activeContentTypes.some(type => {
        if (type === 'video' || type === 'audio') return m.type === type;
        if (type === 'transcript') return m.features.includes('Transcript');
        return false;
      }));
    }

    filteredData.sort((a, b) => {
      let comparison = 0;
      if (sort.by === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sort.by === 'lastModified') comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      else if (sort.by === 'duration') comparison = durationToMinutes(a.duration) - durationToMinutes(b.duration);
      return sort.order === 'desc' ? -comparison : comparison;
    });

    return filteredData;
  }, [meetings, filters, sort]);
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 flex w-full items-center justify-between gap-4">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700">
              Filters
              <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </Menu.Button>
          </div>
          <Menu.Items className="absolute left-0 z-10 mt-2 w-80 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
            <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div>
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <select id="date-filter" value={filters.dateRange} onChange={handleDateRangeChange} className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {showCustomDateRange && (
                <div className="grid grid-cols-2 gap-2">
                  {/* Custom date range inputs would go here */}
                </div>
              )}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</legend>
                <div className="space-y-2">
                  {Object.keys(filters.platforms).map((platform) => (
                    <label key={platform} className="flex items-center gap-2">
                      <input type="checkbox" name={`platforms.${platform}`} checked={filters.platforms[platform as keyof typeof filters.platforms]} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                      {platform === 'Google Meet' && <GoogleMeetLogo />}
                      {platform === 'Zoom' && <ZoomLogo />}
                      {platform === 'Microsoft Teams' && <TeamsLogo />}
                      {platform === 'Slack' && <SlackLogo />}
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-2"><input type="checkbox" name="content.video" checked={filters.content.video} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> <VideoIcon /> <span className="text-sm">Video</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="content.audio" checked={filters.content.audio} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> <AudioIcon /> <span className="text-sm">Audio</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="content.transcript" checked={filters.content.transcript} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> <TranscriptIcon /> <span className="text-sm">Transcript</span></label>
                </div>
              </fieldset>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex justify-end gap-2">
                <button onClick={handleClearFilters} className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">Clear</button>
                <button className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Apply</button>
              </div>
            </div>
          </Menu.Items>
        </Menu>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
          <select id="sort-by" value={sort.by} onChange={(e) => setSort(s => ({ ...s, by: e.target.value }))} className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="date">Date</option>
            <option value="duration">Duration</option>
            <option value="lastModified">Last Modified</option>
          </select>
          <select id="order-by" value={sort.order} onChange={(e) => setSort(s => ({ ...s, order: e.target.value }))} className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="desc">Newest to Oldest</option>
            <option value="asc">Oldest to Newest</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meeting</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Platform & Type</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Available Content</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Duration</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredAndSortedData.map((meeting) => (
                <tr 
                  key={meeting.id} 
                  onClick={() => handleRowClick(meeting.id)}
                  className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                >
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-2">
                      {meeting.isFavorite && <FavoriteStar />}
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{meeting.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {meeting.platform === 'Google Meet' && <GoogleMeetLogo />}
                      {meeting.platform === 'Zoom' && <ZoomLogo />}
                      {meeting.platform === 'Microsoft Teams' && <TeamsLogo />}
                      {meeting.platform === 'Slack' && <SlackLogo />}
                      {meeting.type === 'video' ? <VideoIcon /> : <AudioIcon />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {meeting.features.map((feature) => (<Badge key={feature} size="sm">{feature}</Badge>))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{meeting.duration}</td>
                  <td 
                    className="px-5 py-4 text-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                        <DotsVerticalIcon />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button onClick={() => handleToggleFavorite(meeting.id)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}>
                                <StarIcon filled={!!meeting.isFavorite} />
                                <span className="ml-3">{meeting.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button onClick={() => console.log(`Reporting issue for meeting ${meeting.id}`)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}>
                                <FlagIcon />
                                <span className="ml-3">Report an issue</span>
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button onClick={() => handleDeleteMeeting(meeting.id)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-500`}>
                                <TrashIcon />
                                <span className="ml-3">Delete</span>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">Showing <span className="font-semibold text-gray-800 dark:text-white">1-{filteredAndSortedData.length}</span> of <span className="font-semibold text-gray-800 dark:text-white">{filteredAndSortedData.length}</span> results</div>
            <div className="inline-flex items-center -space-x-px rounded-md text-sm">
                <button className="flex items-center justify-center h-9 w-9 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg></button>
                 <button className="flex items-center justify-center h-9 w-9 border border-gray-300 bg-blue-50 text-blue-600 dark:border-gray-600 dark:bg-blue-900/50 dark:text-white">1</button>
                <button className="flex items-center justify-center h-9 w-9 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></button>
            </div>
       </div>
    </div>
  );
}