import { supabaseAdmin } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Invite a user by email via Supabase Auth Admin API
// ---------------------------------------------------------------------------

export interface InviteResult {
  userId: string;
  email: string;
}

/**
 * Sends a Supabase Auth invite email to the given address.
 * Supabase handles delivery — no third-party SMTP needed.
 *
 * The recipient receives a magic link; on first click they set their password.
 *
 * @param email      - Recipient's email address
 * @param options    - Optional metadata and redirect URL
 *                     NOTE: redirectTo must be whitelisted in Supabase Dashboard →
 *                     Authentication → URL Configuration → Redirect URLs
 */
export async function inviteUserByEmail(
  email: string,
  options?: {
    /** Extra fields stored in auth.users.raw_user_meta_data */
    data?: Record<string, unknown>;
    /** URL the invite link redirects to after the user clicks it.
     *  Must be whitelisted in Supabase Dashboard. Omit to use the default Site URL. */
    redirectTo?: string;
  }
): Promise<InviteResult> {
  // Diagnostic: confirm env vars are loaded (remove after verifying)
  console.log('[inviteUserByEmail] env check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 5), // Should be 'eyJhb'
  });

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: options?.data,
    ...(options?.redirectTo ? { redirectTo: options.redirectTo } : {}),
  });

  if (error) {
    // Deep-inspect the error — Supabase sometimes returns a non-standard object
    const errDetails = {
      message: error.message,
      name:    (error as any).name,
      status:  (error as any).status,
      code:    (error as any).code,
      cause:   (error as any).cause,
      keys:    Object.keys(error),
      json:    JSON.stringify(error),
      str:     String(error),
    };
    console.error('[inviteUserByEmail] Raw error object:', errDetails);
    throw new Error(
      `Supabase inviteUserByEmail failed — status=${errDetails.status} code=${errDetails.code} msg="${errDetails.message}" json=${errDetails.json}`
    );
  }

  if (!data.user?.id || !data.user?.email) {
    throw new Error('Supabase invite returned an incomplete user object');
  }

  return {
    userId: data.user.id,
    email: data.user.email,
  };
}
