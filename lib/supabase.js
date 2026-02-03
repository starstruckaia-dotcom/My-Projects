import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client for build time or when env vars are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that throws on any operation
    // This prevents build-time crashes when env vars aren't set
    return {
      from: () => ({
        select: () => Promise.reject(new Error('Supabase not configured')),
        insert: () => Promise.reject(new Error('Supabase not configured')),
        update: () => ({ eq: () => Promise.reject(new Error('Supabase not configured')) }),
        delete: () => ({ eq: () => Promise.reject(new Error('Supabase not configured')) }),
      }),
    }
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()
