import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client — uses the service_role key.
 * SERVER ONLY — never expose this to the browser.
 * Use for: inviting users, creating users, deleting auth records.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
