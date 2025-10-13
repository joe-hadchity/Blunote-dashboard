import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { supabaseAdmin } from './supabase-admin';

// Google Calendar scopes
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Create OAuth2 client
 */
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate Google OAuth URL
 */
export function getGoogleAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Get OAuth2 client with user tokens from database
 */
export async function getAuthenticatedClient(userId: string): Promise<OAuth2Client | null> {
  try {
    // Get user's Google tokens from database
    const { data: tokenData, error } = await supabaseAdmin
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !tokenData) {
      console.error('No Google Calendar tokens found for user:', userId);
      return null;
    }

    const oauth2Client = createOAuth2Client();
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      expiry_date: tokenData.expiry_date,
    });

    // Automatically refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      console.log('Token refreshed, updating database...');
      await updateUserTokens(userId, tokens);
    });

    return oauth2Client;
  } catch (error) {
    console.error('Error getting authenticated client:', error);
    return null;
  }
}

/**
 * Save user tokens to database
 */
export async function saveUserTokens(
  userId: string,
  tokens: any,
  googleEmail?: string,
  googleAccountId?: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date,
        google_email: googleEmail,
        google_account_id: googleAccountId,
        sync_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveUserTokens:', error);
    throw error;
  }
}

/**
 * Update user tokens in database (used for token refresh)
 */
async function updateUserTokens(userId: string, tokens: any) {
  try {
    await supabaseAdmin
      .from('google_calendar_tokens')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating tokens:', error);
  }
}

/**
 * Check if event is a meeting (has Google Meet link or conferencing data)
 */
export function isMeetingEvent(event: any): boolean {
  // Check if event has Google Meet conferencing
  if (event.conferenceData) {
    return true;
  }
  
  // Check if event has a Google Meet link in location or description
  const meetingPatterns = [
    /meet\.google\.com/i,
    /zoom\.us/i,
    /teams\.microsoft\.com/i,
    /slack\.com\/calls/i,
  ];
  
  const location = event.location || '';
  const description = event.description || '';
  const hangoutLink = event.hangoutLink || '';
  
  return meetingPatterns.some(pattern => 
    pattern.test(location) || 
    pattern.test(description) || 
    pattern.test(hangoutLink)
  );
}

/**
 * Detect platform from event
 */
export function detectPlatform(event: any): string {
  const location = event.location || '';
  const description = event.description || '';
  const hangoutLink = event.hangoutLink || '';
  const conferenceData = event.conferenceData;
  
  // Check conference data first (most reliable)
  if (conferenceData?.conferenceSolution?.name) {
    const solutionName = conferenceData.conferenceSolution.name.toLowerCase();
    if (solutionName.includes('meet')) return 'GOOGLE_MEET';
    if (solutionName.includes('zoom')) return 'ZOOM';
    if (solutionName.includes('teams')) return 'MICROSOFT_TEAMS';
  }
  
  // Check URLs
  const allText = `${location} ${description} ${hangoutLink}`;
  
  if (/meet\.google\.com/i.test(allText) || hangoutLink) {
    return 'GOOGLE_MEET';
  }
  if (/zoom\.us/i.test(allText)) {
    return 'ZOOM';
  }
  if (/teams\.microsoft\.com/i.test(allText)) {
    return 'MICROSOFT_TEAMS';
  }
  if (/slack\.com\/calls/i.test(allText)) {
    return 'SLACK';
  }
  
  return 'OTHER';
}

/**
 * Extract meeting link from event
 */
export function extractMeetingLink(event: any): string | null {
  // Check hangout link (Google Meet)
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  
  // Check conference data
  if (event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (entry: any) => entry.entryPointType === 'video'
    );
    if (videoEntry?.uri) {
      return videoEntry.uri;
    }
  }
  
  // Extract from location or description
  const location = event.location || '';
  const description = event.description || '';
  const allText = `${location} ${description}`;
  
  // Try to extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = allText.match(urlRegex) || [];
  
  // Find meeting platform URLs
  const meetingUrl = urls.find(url =>
    /meet\.google\.com|zoom\.us|teams\.microsoft\.com|slack\.com\/calls/i.test(url)
  );
  
  return meetingUrl || null;
}

/**
 * Fetch meetings from Google Calendar
 */
export async function fetchGoogleCalendarMeetings(
  userId: string,
  timeMin?: Date,
  timeMax?: Date
) {
  try {
    const oauth2Client = await getAuthenticatedClient(userId);
    
    if (!oauth2Client) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Default to last 30 days to future 90 days
    const defaultTimeMin = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const defaultTimeMax = timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    // Fetch events from primary calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: defaultTimeMin.toISOString(),
      timeMax: defaultTimeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250, // Adjust as needed
    });

    const events = response.data.items || [];
    
    // Filter only meeting events
    const meetings = events.filter(isMeetingEvent);
    
    console.log(`Found ${meetings.length} meetings out of ${events.length} events`);
    
    return meetings;
  } catch (error: any) {
    console.error('Error fetching Google Calendar meetings:', error);
    throw new Error(`Failed to fetch meetings: ${error.message}`);
  }
}

/**
 * Transform Google Calendar event to our meeting format
 */
export function transformGoogleEventToMeeting(event: any, userId: string) {
  const startTime = new Date(event.start?.dateTime || event.start?.date);
  const endTime = new Date(event.end?.dateTime || event.end?.date);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  // Extract participants
  const participants = (event.attendees || [])
    .map((attendee: any) => attendee.email)
    .filter((email: string) => email);
  
  const platform = detectPlatform(event);
  const meetingLink = extractMeetingLink(event);
  
  return {
    user_id: userId,
    title: event.summary || 'Untitled Meeting',
    description: event.description || null,
    meeting_link: meetingLink, // Store Google Meet/Zoom link for joining
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration,
    type: 'VIDEO' as const,
    platform,
    status: 'SCHEDULED' as const,
    participants,
    google_event_id: event.id,
    google_calendar_id: event.organizer?.email || 'primary',
    synced_from_google: true,
    last_synced_at: new Date().toISOString(),
  };
}

/**
 * Sync Google Calendar meetings to database
 */
export async function syncGoogleCalendarMeetings(userId: string) {
  try {
    console.log('🔄 Starting Google Calendar sync for user:', userId);
    
    // Fetch meetings from Google Calendar
    const googleMeetings = await fetchGoogleCalendarMeetings(userId);
    
    console.log(`📅 Found ${googleMeetings.length} meetings from Google Calendar`);
    
    if (googleMeetings.length === 0) {
      console.log('⚠️ No meetings found to sync');
      return { synced: 0, skipped: 0, errors: 0, total: 0 };
    }
    
    let synced = 0;
    let skipped = 0;
    let errors = 0;
    
    // Sync each meeting
    for (const event of googleMeetings) {
      try {
        const meetingData = transformGoogleEventToMeeting(event, userId);
        
        console.log(`📝 Processing meeting: "${meetingData.title}" (${meetingData.platform})`);
        
        // Check if meeting already exists by Google Event ID
        const { data: existing } = await supabaseAdmin
          .from('meetings')
          .select('id')
          .eq('user_id', userId)
          .eq('google_event_id', event.id)
          .single();
        
        if (existing) {
          // Update existing meeting
          console.log(`  ↻ Updating existing meeting: ${existing.id}`);
          await supabaseAdmin
            .from('meetings')
            .update({
              ...meetingData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          
          skipped++;
        } else {
          // Insert new meeting (synced events are meetings without recordings)
          console.log(`  ✓ Creating new synced meeting`);
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from('meetings')
            .insert(meetingData)
            .select();
          
          if (insertError) {
            console.error('  ❌ Insert error:', insertError);
            throw insertError;
          }
          
          console.log(`  ✅ Created meeting:`, inserted?.[0]?.id);
          synced++;
        }
      } catch (error: any) {
        console.error(`❌ Error syncing meeting "${event.summary}":`, error.message);
        errors++;
      }
    }
    
    // Update last sync time
    await supabaseAdmin
      .from('google_calendar_tokens')
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    console.log(`✅ Sync complete: ${synced} new, ${skipped} updated, ${errors} errors (${googleMeetings.length} total)`);
    
    return { synced, skipped, errors, total: googleMeetings.length };
  } catch (error) {
    console.error('❌ Error in syncGoogleCalendarMeetings:', error);
    throw error;
  }
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  userId: string,
  meeting: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
    addGoogleMeet?: boolean;
  }
) {
  try {
    const oauth2Client = await getAuthenticatedClient(userId);
    
    if (!oauth2Client) {
      throw new Error('Not authenticated with Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event: any = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: meeting.endTime,
        timeZone: 'UTC',
      },
      attendees: meeting.attendees?.map(email => ({ email })),
    };
    
    // Add Google Meet conference if requested
    if (meeting.addGoogleMeet) {
      event.conferenceData = {
        createRequest: {
          requestId: `${userId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: meeting.addGoogleMeet ? 1 : 0,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Disconnect Google Calendar and remove synced meetings
 */
export async function disconnectGoogleCalendar(userId: string, removeMeetings: boolean = true) {
  try {
    // Optionally delete synced meetings
    if (removeMeetings) {
      console.log('🗑️ Removing synced meetings from Google Calendar...');
      const { data: deletedMeetings, error: deleteError } = await supabaseAdmin
        .from('meetings')
        .delete()
        .eq('user_id', userId)
        .eq('synced_from_google', true)
        .select();
      
      if (deleteError) {
        console.error('Error deleting synced meetings:', deleteError);
      } else {
        console.log(`✅ Removed ${deletedMeetings?.length || 0} synced meetings`);
      }
    }
    
    // Delete tokens from database
    const { error } = await supabaseAdmin
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { 
      success: true, 
      deletedMeetings: removeMeetings ? true : false 
    };
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    throw error;
  }
}

