// Supabase client (Phase 2). The anon key is publishable — per-user access is
// enforced by Row-Level Security, so the client runs safely in the browser.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (.env locally, Netlify env in production). Auth/logbook are disabled until then.',
  )
}

// Use a harmless placeholder when unconfigured so createClient() does NOT throw
// and crash the whole app. The calculator + timer keep working; auth/data
// features stay gated off (see isSupabaseConfigured).
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
