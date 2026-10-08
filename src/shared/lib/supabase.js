import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Null when env is missing, so gift pages still work without photos.
export const supabase = url && key ? createClient(url, key) : null
