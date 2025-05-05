import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: localStorage, // Use localStorage for web
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);