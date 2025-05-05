import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: localStorage, // Use localStorage for web
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);