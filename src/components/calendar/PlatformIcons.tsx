import React from 'react';

interface IconProps {
  className?: string;
}

export const GoogleMeetIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <div className={`${className} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-700`}>
    <svg width="16" height="16" viewBox="0 0 24 24" className="drop-shadow-sm">
      <path fill="#00832d" d="M12.43 14.99H18.5v-3.52h-6.07Z"/>
      <path fill="#0066da" d="M6.54 18.5v-9.45l6.07 4.72Z"/>
      <path fill="#e53935" d="M6.54 9.05V5.5h11.96v9.56l-5.89-4.51Z"/>
      <path fill="#ffb400" d="M5.5 12.43v6.07h9.45Z"/>
    </svg>
  </div>
);

export const ZoomIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <div className={`${className} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-700`}>
    <svg width="16" height="16" viewBox="0 0 24 24" className="drop-shadow-sm">
      <path fill="#2D8CFF" d="M5,3C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5c0-1.105-0.895-2-2-2H5z M17.211,15.293l-2.296-2.296l2.296-2.296c0.391-0.391,0.391-1.024,0-1.414s-1.024-0.391-1.414,0l-2.296,2.296L11.204,9.293c-0.391-0.391-1.024-0.391-1.414,0s-0.391,1.024,0,1.414l2.296,2.296L9.79,15.293c-0.391,0.391-0.391,1.024,0,1.414s1.024,0.391,1.414,0l2.296-2.296l2.296,2.296c0.391,0.391,1.024,0.391,1.414,0S17.602,15.684,17.211,15.293z"/>
    </svg>
  </div>
);

export const TeamsIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <div className={`${className} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-700`}>
    <svg width="16" height="16" viewBox="0 0 24 24" className="drop-shadow-sm">
      <path fill="#4F52B2" d="M13.04,14.28h-3.9v-2.07c0-1.28.62-1.9,1.95-1.9s1.95.62,1.95,1.9v2.07Zm-1.46-4.54a.75.75,0,1,1,.75-.75a.75.75,0,0,1-.75-.75Z"/>
      <path fill="#4F52B2" d="M22.5,9.63a1,1,0,0,0-1-1H16V5.8a1,1,0,0,0-1-1H3.5a1,1,0,0,0-1,1v12.4a1,1,0,0,0,1,1h11.4a1,1,0,0,0,1-1V13.12h5.53a1,1,0,0,0,1-1v-2.5Zm-10-2.35c0-2.4,1.38-3.79,3.8-3.79s3.8,1.39,3.8,3.79v1.89h-7.6Z"/>
    </svg>
  </div>
);

export const SlackIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <div className={`${className} bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg flex items-center justify-center shadow-sm border border-purple-200 dark:border-purple-700`}>
    <svg width="16" height="16" viewBox="0 0 24 24" className="drop-shadow-sm">
      <path fill="#36C5F0" d="M9.7,14.25a2.5,2.5,0,0,1-2.5,2.5V19a5,5,0,0,0,5-5h-2.25A2.5,2.5,0,0,1,9.7,14.25Z"/>
      <path fill="#2EB67D" d="M9.75,9.7a2.5,2.5,0,0,1-2.5-2.5V5a5,5,0,0,0,5,5V7.25A2.5,2.5,0,0,1,9.75,9.7Z"/>
      <path fill="#ECB22E" d="M14.25,9.7a2.5,2.5,0,0,1,2.5-2.5h2.25a5,5,0,0,0-5,5v2.25A2.5,2.5,0,0,1,14.25,9.7Z"/>
      <path fill="#E01E5A" d="M14.3,14.25a2.5,2.5,0,0,1,2.5,2.5V19a5,5,0,0,0-5-5V11.75a2.5,2.5,0,0,1,2.5,2.5Z"/>
    </svg>
  </div>
);

export const VideoIcon: React.FC<IconProps> = ({ className = "w-3 h-3" }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m22 8-6 4 6 4V8Z"/>
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
);

export const AudioIcon: React.FC<IconProps> = ({ className = "w-3 h-3" }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

export const MeetingLinkIcon: React.FC<IconProps> = ({ className = "w-3 h-3" }) => (
  <svg 
    className={className}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Platform icon mapping for easy access
export const getPlatformIcon = (platform: string, className?: string) => {
  const iconProps = { className };
  
  switch (platform) {
    case 'Google Meet':
      return <GoogleMeetIcon {...iconProps} />;
    case 'Zoom':
      return <ZoomIcon {...iconProps} />;
    case 'Microsoft Teams':
      return <TeamsIcon {...iconProps} />;
    case 'Slack':
      return <SlackIcon {...iconProps} />;
    case 'Scheduled Meeting':
      return (
        <div className={`${className || "w-4 h-4"} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg flex items-center justify-center shadow-sm border border-green-200 dark:border-green-700`}>
          <svg width="12" height="12" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path fill="#10B981" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#10B981" d="M10 12l2 2 4-4"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${className || "w-4 h-4"} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700`}>
          <svg width="12" height="12" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path fill="#6B7280" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#6B7280" d="M12 6v6l4 2"/>
          </svg>
        </div>
      );
  }
};
