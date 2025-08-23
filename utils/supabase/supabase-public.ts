'use server'

import { createClient } from '@supabase/supabase-js'

export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // safe to be NEXT_PUBLIC; still enforce RLS!
  {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }
)