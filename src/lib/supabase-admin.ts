import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxdegqsladfaczeixnmh.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZGVncXNsYWRmYWN6ZWl4bm1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE2NDkyOSwiZXhwIjoyMDUxNzQwOTI5fQ.PLACEHOLDER_SERVICE_KEY'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
