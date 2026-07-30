import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const supabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

// Use a placeholder URL when env vars are missing so createClient doesn't
// throw at module load (which would crash the app into a white screen before
// React renders). The client is inert when not configured — API calls fail
// gracefully, and `supabaseConfigured` gates the auth provider so the app
// shows a friendly message instead of a blank page.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
