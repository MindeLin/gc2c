import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Please check your .env file.')
}

// Prevent crash if keys are missing by using a dummy URL if needed, 
// though Supabase client usually handles empty strings by just failing requests.
// We will use the provided ones or empty strings.
const isValidUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'))
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder'

export const supabase = createClient(finalUrl, finalKey)
