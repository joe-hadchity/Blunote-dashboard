import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxdegqsladfaczeixnmh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZGVncXNsYWRmYWN6ZWl4bm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjQ5MjksImV4cCI6MjA1MTc0MDkyOX0.PLACEHOLDER_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
