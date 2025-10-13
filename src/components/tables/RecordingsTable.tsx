"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Badge from "../ui/badge/Badge";
import { MeetingsTableShimmer } from "@/components/common/ShimmerLoader";
import { 
  Video, 
  Mic, 
  FileText, 
  Star, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter,
  CalendarDays as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Flag
} from "@/components/common/Icons";

// Interface for a meeting from the database
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: "VIDEO" | "AUDIO";
  platform: "GOOGLE_MEET" | "ZOOM" | "MICROSOFT_TEAMS" | "SLACK" | "OTHER";
  status: string;
  hasTranscript: boolean;
  hasSummary: boolean;
  hasVideo: boolean;
  isFavorite: boolean;
  participants: string[];
  topics: string[];
  recordingUrl?: string; // Meeting link for synced events or recording URL
  syncedFromGoogle?: boolean;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- ICONS ---
const VideoIcon = () => <Video className="w-5 h-5" />;
const AudioIcon = () => <Mic className="w-5 h-5" />;
const TranscriptIcon = () => <FileText className="w-5 h-5" />;
const GoogleMeetLogo = () => <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<rect width="16" height="16" x="12" y="16" fill="#fff" transform="rotate(-90 20 24)"></rect><polygon fill="#1e88e5" points="3,17 3,31 8,32 13,31 13,17 8,16"></polygon><path fill="#4caf50" d="M37,24v14c0,1.657-1.343,3-3,3H13l-1-5l1-5h14v-7l5-1L37,24z"></path><path fill="#fbc02d" d="M37,10v14H27v-7H13l-1-5l1-5h21C35.657,7,37,8.343,37,10z"></path><path fill="#1565c0" d="M13,31v10H6c-1.657,0-3-1.343-3-3v-7H13z"></path><polygon fill="#e53935" points="13,7 13,17 3,17"></polygon><polygon fill="#2e7d32" points="38,24 37,32.45 27,24 37,15.55"></polygon><path fill="#4caf50" d="M46,10.11v27.78c0,0.84-0.98,1.31-1.63,0.78L37,32.45v-16.9l7.37-6.22C45.02,8.8,46,9.27,46,10.11z"></path>
</svg>
const ZoomLogo = () => <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<circle cx="24" cy="24" r="20" fill="#2196f3"></circle><path fill="#fff" d="M29,31H14c-1.657,0-3-1.343-3-3V17h15c1.657,0,3,1.343,3,3V31z"></path><polygon fill="#fff" points="37,31 31,27 31,21 37,17"></polygon>
</svg>
const TeamsLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4F52B2" d="M13.04,14.28h-3.9v-2.07c0-1.28.62-1.9,1.95-1.9s1.95.62,1.95,1.9v2.07Zm-1.46-4.54a.75.75,0,1,1,.75-.75a.75.75,0,0,1-.75-.75Z"/><path fill="#4F52B2" d="M22.5,9.63a1,1,0,0,0-1-1H16V5.8a1,1,0,0,0-1-1H3.5a1,1,0,0,0-1,1v12.4a1,1,0,0,0,1,1h11.4a1,1,0,0,0,1-1V13.12h5.53a1,1,0,0,0,1-1v-2.5Zm-10-2.35c0-2.4,1.38-3.79,3.8-3.79s3.8,1.39,3.8,3.79v1.89h-7.6Z"/></svg>;
const SlackLogo = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#36C5F0" d="M9.7,14.25a2.5,2.5,0,0,1-2.5,2.5V19a5,5,0,0,0,5-5h-2.25A2.5,2.5,0,0,1,9.7,14.25Z"/><path fill="#2EB67D" d="M9.75,9.7a2.5,2.5,0,0,1-2.5-2.5V5a5,5,0,0,0,5,5V7.25A2.5,2.5,0,0,1,9.75,9.7Z"/><path fill="#ECB22E" d="M14.25,9.7a2.5,2.5,0,0,1,2.5-2.5h2.25a5,5,0,0,0-5,5v2.25A2.5,2.5,0,0,1,14.25,9.7Z"/><path fill="#E01E5A" d="M14.3,14.25a2.5,2.5,0,0,1,2.5,2.5V19a5,5,0,0,0-5-5V11.75a2.5,2.5,0,0,1,2.5,2.5Z"/></svg>;
const DotsVerticalIcon = () => <MoreVertical className="w-5 h-5" />;
const FavoriteStar = () => <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
const SearchIcon = () => <Search className="w-5 h-5" />;
const TrashIcon = () => <Trash2 className="w-4 h-4" />;
const StarIcon = ({ filled }: { filled: boolean }) => <Star className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : ''}`} />;

// Platform name formatter
const formatPlatform = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'GOOGLE_MEET': 'Google Meet',
    'ZOOM': 'Zoom',
    'MICROSOFT_TEAMS': 'Microsoft Teams',
    'SLACK': 'Slack',
    'OTHER': 'Other',
  };
  return platformMap[platform] || platform;
};

// Duration formatter
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const initialFilterState = {
  dateRange: 'all',
  platforms: { 'GOOGLE_MEET': false, 'ZOOM': false, 'MICROSOFT_TEAMS': false, 'SLACK': false },
  content: { video: false, audio: false, transcript: false },
  favorites: false,
};

export default function MeetingsTable() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filters, setFilters] = useState(initialFilterState);
  const [sort, setSort] = useState({ by: 'startTime', order: 'desc' });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For debounced search
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch meetings from API
  const fetchMeetings = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });

      // Add sorting
      params.append('sortBy', sort.by);
      params.append('sortOrder', sort.order);

      // Add search
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add platform filters
      const activePlatforms = Object.entries(filters.platforms)
        .filter(([_, active]) => active)
        .map(([platform]) => platform);
      
      if (activePlatforms.length > 0) {
        activePlatforms.forEach(platform => params.append('platform', platform));
      }

      // Add content type filters
      if (filters.content.video && !filters.content.audio) {
        params.append('type', 'VIDEO');
      } else if (filters.content.audio && !filters.content.video) {
        params.append('type', 'AUDIO');
      }

      // Show ONLY recorded meetings (with actual video or audio files)
      // This filters out synced calendar events and scheduled meetings without recordings
      params.append('hasRecording', 'true');

      if (filters.content.transcript) {
        params.append('hasTranscript', 'true');
      }

      // Add favorites filter
      if (filters.favorites) {
        params.append('isFavorite', 'true');
      }

      // Add date range filter
      if (filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }

      const response = await fetch(`/api/meetings?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
        if (data.pagination) {
          setPagination(data.pagination);
          setCurrentPage(data.pagination.page);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch meetings:', response.status, errorData);
        throw new Error(`Failed to fetch meetings: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sort, searchQuery, filters]);

  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchMeetings(1); // Reset to page 1 when filters/sort/search change
  }, [sort, searchQuery, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [category, key] = name.split('.');
    if (category === 'platforms' || category === 'content') {
      setFilters(prev => ({ ...prev, [category]: { ...prev[category as 'platforms' | 'content'], [key]: checked } }));
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setShowCustomDateRange(value === 'custom');
    setFilters(prev => ({ ...prev, dateRange: value }));
  };
  
  const handleClearFilters = () => {
    setFilters(initialFilterState);
    setSearchInput('');
    setSearchQuery('');
    // fetchMeetings will be triggered by useEffect
  };
  
  const handleRowClick = (id: string) => {
    router.push(`/meeting/${id}`);
  };

  const handleDeleteMeeting = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setShowDeleteConfirm(null);
        // Refetch current page to update the list
        fetchMeetings(currentPage);
      } else {
        console.error('Failed to delete meeting');
        alert('Failed to delete meeting. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/meetings/${id}/favorite`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update meeting in current list
        setMeetings(prev => prev.map(m => m.id === id ? { ...m, isFavorite: data.meeting.isFavorite } : m));
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMeetings(newPage);
    }
  };

  // All filtering and sorting are now handled by the backend
  // We just display what the API returns
  const displayedMeetings = meetings;

  const getPlatformLogo = (platform: string) => {
    switch (platform) {
      case 'GOOGLE_MEET': return <GoogleMeetLogo />;
      case 'ZOOM': return <ZoomLogo />;
      case 'MICROSOFT_TEAMS': return <TeamsLogo />;
      case 'SLACK': return <SlackLogo />;
      default: return null;
    }
  };

  const getFeatures = (meeting: Meeting): string[] => {
    const features: string[] = [];
    if (meeting.hasTranscript) features.push('Transcript');
    if (meeting.hasSummary) features.push('Summary');
    if (meeting.hasVideo) features.push('Video File');
    return features;
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    count += Object.values(filters.platforms).filter(Boolean).length;
    count += Object.values(filters.content).filter(Boolean).length;
    if (filters.favorites) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);
  
  return (
    <>
      {/* Header with Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search meetings, participants, topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {searchInput && searchInput !== searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Popover className="relative inline-block text-left">
            {({ close }) => (
              <>
                <Popover.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className="-mr-1 h-4 w-4 text-gray-400" />
                </Popover.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
                    <div className="p-4 space-y-4">
                      <div>
                        <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <select id="date-filter" value={filters.dateRange} onChange={handleDateRangeChange} className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="yesterday">Yesterday</option>
                          <option value="last_7_days">Last 7 Days</option>
                          <option value="last_month">Last Month</option>
                        </select>
                      </div>
                      
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</legend>
                        <div className="space-y-2">
                          {Object.keys(filters.platforms).map((platform) => (
                            <label key={platform} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                name={`platforms.${platform}`} 
                                checked={filters.platforms[platform as keyof typeof filters.platforms]} 
                                onChange={handleFilterChange} 
                                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" 
                              />
                              {getPlatformLogo(platform)}
                              <span className="text-sm text-gray-700 dark:text-gray-300">{formatPlatform(platform)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</legend>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="content.video" checked={filters.content.video} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> 
                            <VideoIcon /> 
                            <span className="text-sm text-gray-700 dark:text-gray-300">Video</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="content.audio" checked={filters.content.audio} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> 
                            <AudioIcon /> 
                            <span className="text-sm text-gray-700 dark:text-gray-300">Audio</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="content.transcript" checked={filters.content.transcript} onChange={handleFilterChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" /> 
                            <TranscriptIcon /> 
                            <span className="text-sm text-gray-700 dark:text-gray-300">Transcript</span>
                          </label>
                        </div>
                      </fieldset>
                      
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Other</legend>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={filters.favorites} 
                            onChange={(e) => setFilters(prev => ({ ...prev, favorites: e.target.checked }))} 
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <FavoriteStar />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Favorites Only</span>
                        </label>
                      </fieldset>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex justify-between gap-2">
                        <button 
                          onClick={handleClearFilters} 
                          className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => close()}
                          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
            <select 
              id="sort-by" 
              value={sort.by} 
              onChange={(e) => setSort(s => ({ ...s, by: e.target.value }))} 
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="startTime">Date</option>
              <option value="duration">Duration</option>
              <option value="updatedAt">Last Modified</option>
              <option value="title">Title</option>
            </select>
            <select 
              id="order-by" 
              value={sort.order} 
              onChange={(e) => setSort(s => ({ ...s, order: e.target.value }))} 
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {sort.by === 'title' ? (
                <>
                  <option value="asc">A to Z</option>
                  <option value="desc">Z to A</option>
                </>
              ) : sort.by === 'duration' ? (
                <>
                  <option value="desc">Longest First</option>
                  <option value="asc">Shortest First</option>
                </>
              ) : (
                <>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <MeetingsTableShimmer rows={5} />
      ) : displayedMeetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recorded meetings found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeFilterCount > 0 ? 'Try adjusting your filters or search query.' : 'You don\'t have any recorded meetings yet. Recordings will appear here after your meetings are completed.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
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
                  {displayedMeetings.map((meeting) => (
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(meeting.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {getPlatformLogo(meeting.platform)}
                          {meeting.type === 'VIDEO' ? <VideoIcon /> : <AudioIcon />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getFeatures(meeting).map((feature) => (
                            <Badge key={feature} size="sm">{feature}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatDuration(meeting.duration)}
                      </td>
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
                                  <button 
                                    onClick={(e) => handleToggleFavorite(meeting.id, e)} 
                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                  >
                                    <StarIcon filled={meeting.isFavorite} />
                                    <span className="ml-3">{meeting.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button 
                                    onClick={() => console.log(`Reporting issue for meeting ${meeting.id}`)} 
                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                  >
                                    <Flag className="w-5 h-5" />
                                    <span className="ml-3">Report an issue</span>
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button 
                                    onClick={() => setShowDeleteConfirm(meeting.id)} 
                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-500`}
                                  >
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
          
          {/* Minimal Pagination Section */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Results Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{((pagination.page - 1) * pagination.limit) + 1}</span>-<span className="font-medium text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                  const isFirstOrLast = pageNum === 1 || pageNum === pagination.totalPages;
                  
                  // Show: first page, last page, current page, and pages adjacent to current
                  if (isNearCurrent || isFirstOrLast) {
                    // Show ellipsis if there's a gap
                    if (pageNum === pagination.totalPages && currentPage < pagination.totalPages - 2) {
                      return (
                        <React.Fragment key={pageNum}>
                          <span className="px-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    if (pageNum === 1 && currentPage > 3) {
                      return (
                        <React.Fragment key={pageNum}>
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                          <span className="px-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                Delete Meeting?
              </h3>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. All recordings, transcripts, and AI summaries will be permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deletingId === showDeleteConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMeeting(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingId === showDeleteConfirm ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

