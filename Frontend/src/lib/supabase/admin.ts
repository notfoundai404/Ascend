import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    '[supabase/admin] Missing env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and ' +
    'SUPABASE_SERVICE_ROLE_KEY are set in .env.local and the dev server was restarted.'
  );
}

/**
 * Admin Supabase client — uses the service_role key.
 * SERVER ONLY — never expose this to the browser.
 * Use for: inviting users, creating users, deleting auth records.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
