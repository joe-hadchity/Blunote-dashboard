/**
 * Cookie Consent Utility
 * Manages cookie consent preferences
 */

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

/**
 * Get cookie consent preferences from localStorage
 */
export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) return null;
    return JSON.parse(consent);
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

/**
 * Check if user has given consent for a specific cookie type
 */
export function hasConsentFor(type: keyof CookiePreferences): boolean {
  const consent = getCookieConsent();
  if (!consent) {
    // If no consent yet, assume necessary cookies are allowed
    return type === 'necessary';
  }
  return consent[type] === true;
}

/**
 * Save cookie consent preferences
 */
export function saveCookieConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Emit event for other components to listen
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: preferences }));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

/**
 * Check if cookie consent has expired (older than 6 months)
 */
export function isConsentExpired(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consentDate = localStorage.getItem('cookie-consent-date');
    if (!consentDate) return false;
    
    const date = new Date(consentDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return date < sixMonthsAgo;
  } catch (error) {
    console.error('Error checking consent expiry:', error);
    return false;
  }
}

/**
 * Clear cookie consent (for testing or user request)
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
}

/**
 * Get a summary of current cookie settings
 */
export function getCookieSummary(): {
  hasConsent: boolean;
  preferences: CookiePreferences | null;
  consentDate: string | null;
  isExpired: boolean;
} {
  const preferences = getCookieConsent();
  const consentDate = typeof window !== 'undefined' 
    ? localStorage.getItem('cookie-consent-date') 
    : null;
  
  return {
    hasConsent: preferences !== null,
    preferences,
    consentDate,
    isExpired: isConsentExpired(),
  };
}

