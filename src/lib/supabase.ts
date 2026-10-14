import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://setxdabfnpgcoensaiss.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldHhkYWJmbnBnY29lbnNhaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NTY1MDAsImV4cCI6MjEwNzUzMjUwMH0.pea7ug8ACVxAAp3-qjzAi55pZOI71qUwItt6jmKSUEc'

// Public Supabase Client (Frontend / Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin / Service Role Client (Server-only operations)
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
