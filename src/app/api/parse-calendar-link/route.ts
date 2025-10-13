import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Check if it's a Google Calendar event link
    if (url.includes('calendar.app.google') || url.includes('calendar.google.com/event')) {
      try {
        // Fetch the calendar event page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch calendar event')
        }

        const html = await response.text()

        // Parse the HTML to extract meeting details
        const extractData = {
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          meetingLink: '',
          organizer: '',
        }

        console.log('Parsing Google Calendar event...')

        // Extract title (look for h1 or event title in various formats)
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i) || 
                          html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                          html.match(/"title":"([^"]+)"/i)
        if (titleMatch) {
          extractData.title = titleMatch[1]
            .replace(/\s*-\s*Google Calendar.*$/i, '')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .trim()
        }
        console.log('Title extracted:', extractData.title)

        // Extract description - improved patterns
        // Pattern 1: Text between _notes_ and next element
        let descMatch = html.match(/_notes_\s*\n*\s*([^\n<]+)/i)
        if (!descMatch) {
          // Pattern 2: Look for content after notes
          descMatch = html.match(/_notes_[\s\S]{0,50}?([a-zA-Z][^\n<]{10,200})/i)
        }
        if (!descMatch) {
          // Pattern 3: Search around "notes" text
          const notesIndex = html.toLowerCase().indexOf('_notes_')
          if (notesIndex > -1) {
            const afterNotes = html.substring(notesIndex + 7, notesIndex + 300)
            // Extract first meaningful text
            const textMatch = afterNotes.match(/([a-zA-Z][^\n<]{5,200})/i)
            if (textMatch) {
              descMatch = textMatch
            }
          }
        }
        if (descMatch) {
          extractData.description = descMatch[1]
            .replace(/\\n/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/Join with Google Meet/i, '')
            .replace(/meet\.google\.com.*/i, '')
            .trim()
        }
        console.log('Description extracted:', extractData.description)

        // Extract Google Meet link
        const meetLinkMatch = html.match(/meet\.google\.com\/[\w-]+/gi)
        if (meetLinkMatch && meetLinkMatch.length > 0) {
          extractData.meetingLink = `https://${meetLinkMatch[0]}`
        }
        console.log('Meet link extracted:', extractData.meetingLink)

        // Extract date/time information - improved pattern
        // Pattern: "Tuesday, October 7·6:00 – 7:00 AM" or "Tuesday, October 7·6:00 AM – 7:00 AM"
        const dateTimePattern = /(\w+day),\s+(\w+)\s+(\d+)[·•]\s*(\d+):(\d+)\s*([AP]M)?\s*[–-]\s*(\d+):(\d+)\s*([AP]M)/i
        const dateTimeMatch = html.match(dateTimePattern)
        
        if (dateTimeMatch) {
          const [_, dayOfWeek, month, day, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = dateTimeMatch
          
          console.log('DateTime match:', { dayOfWeek, month, day, startHour, startMin, startPeriod: startPeriod || 'none', endHour, endMin, endPeriod })
          
          try {
            // Get current year
            const year = new Date().getFullYear()
            
            // Parse start time - if no AM/PM on start, use end period
            let hour24Start = parseInt(startHour)
            const actualStartPeriod = startPeriod || endPeriod
            
            if (actualStartPeriod === 'PM' && hour24Start !== 12) {
              hour24Start += 12
            } else if (actualStartPeriod === 'AM' && hour24Start === 12) {
              hour24Start = 0
            }
            
            const startDateStr = `${month} ${day}, ${year} ${hour24Start.toString().padStart(2, '0')}:${startMin}:00`
            const startDate = new Date(startDateStr)
            
            // Parse end time
            let hour24End = parseInt(endHour)
            if (endPeriod === 'PM' && hour24End !== 12) {
              hour24End += 12
            } else if (endPeriod === 'AM' && hour24End === 12) {
              hour24End = 0
            }
            
            const endDateStr = `${month} ${day}, ${year} ${hour24End.toString().padStart(2, '0')}:${endMin}:00`
            const endDate = new Date(endDateStr)
            
            console.log('Parsed dates:', { startDateStr, endDateStr, startDate: startDate.toISOString(), endDate: endDate.toISOString() })
            
            if (!isNaN(startDate.getTime())) {
              extractData.startTime = startDate.toISOString()
              console.log('✓ Start time set:', extractData.startTime)
            }
            
            if (!isNaN(endDate.getTime())) {
              extractData.endTime = endDate.toISOString()
              console.log('✓ End time set:', extractData.endTime)
            }
          } catch (e) {
            console.error('Could not parse date/time:', e)
          }
        } else {
          console.log('❌ No date/time match found. Trying alternative patterns...')
          // Log a snippet of HTML to debug
          const snippet = html.substring(0, 1000)
          console.log('HTML snippet:', snippet.substring(0, 200))
        }

        // Extract organizer email
        const organizerMatch = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
        if (organizerMatch) {
          extractData.organizer = organizerMatch[1]
        }
        console.log('Organizer extracted:', extractData.organizer)

        console.log('Final extracted data:', extractData)

        return NextResponse.json({
          success: true,
          data: extractData,
          platform: 'GOOGLE_CALENDAR',
          debug: {
            hasTitle: !!extractData.title,
            hasDescription: !!extractData.description,
            hasStartTime: !!extractData.startTime,
            hasEndTime: !!extractData.endTime,
            hasMeetLink: !!extractData.meetingLink,
          }
        })

      } catch (error: any) {
        console.error('Error parsing calendar link:', error)
        return NextResponse.json(
          { 
            success: false,
            error: 'Could not fetch calendar event details',
            message: 'The link may be private or require authentication'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Unsupported calendar link format' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Parse calendar link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

