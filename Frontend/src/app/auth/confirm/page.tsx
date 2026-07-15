'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * /auth/confirm  (CLIENT PAGE)
 *
 * Handles all Supabase post-email-click redirects:
 *
 * Success flows:
 *   - PKCE:     ?code=xxxx                  → exchangeCodeForSession → /auth/set-password
 *   - OTP:      ?token_hash=xxxx&type=invite → verifyOtp             → /auth/set-password
 *   - Implicit: #access_token=xxxx          → session already set    → /auth/set-password
 *
 * Error flow:
 *   - #error=access_denied&error_code=otp_expired → show expiry message
 */
export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();

    async function handleConfirm() {
      // --- Read query params ---
      const params = new URLSearchParams(window.location.search);
      const code       = params.get('code');
      const token_hash = params.get('token_hash');
      const type       = params.get('type') ?? 'invite';

      // --- Read hash fragment (Supabase error redirects land here) ---
      const hash       = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError  = hash.get('error');
      const hashCode   = hash.get('error_code');
      const hashDesc   = hash.get('error_description');

      // 1. Hash-based error from Supabase (e.g. otp_expired)
      if (hashError) {
        const isExpired = hashCode === 'otp_expired';
        const msg = isExpired
          ? 'This invite link has expired. Please ask an admin to send a new invitation.'
          : (hashDesc?.replace(/\+/g, ' ') ?? 'The link is invalid. Please request a new invitation.');
        setErrorMsg(msg);
        toast.error(msg, { duration: 6000 });
        setStatus('error');
        return;
      }

      // 2. PKCE code flow (most common with @supabase/ssr)
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const msg = 'The invite link has expired or already been used. Please request a new invitation.';
          setErrorMsg(msg);
          toast.error(msg, { duration: 6000 });
          setStatus('error');
          return;
        }
        // Detect recovery (password reset) vs invite
        const isRecovery = data.session?.user?.recovery_sent_at != null && type === 'recovery';
        const dest = isRecovery ? '/auth/set-password?type=recovery' : '/auth/set-password';
        router.replace(dest);
        return;
      }

      // 3. OTP / token_hash flow
      if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        if (error) {
          const msg = 'The invite link has expired or already been used. Please request a new invitation.';
          setErrorMsg(msg);
          toast.error(msg, { duration: 6000 });
          setStatus('error');
          return;
        }
        const dest = type === 'recovery' ? '/auth/set-password?type=recovery' : '/auth/set-password';
        router.replace(dest);
        return;
      }

      // 4. Implicit flow — Supabase already embedded the session in the hash
      const accessToken  = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          const msg = 'Failed to establish session. Please request a new invitation.';
          setErrorMsg(msg);
          toast.error(msg, { duration: 6000 });
          setStatus('error');
          return;
        }
        router.replace('/auth/set-password');
        return;
      }

      // Nothing recognisable in the URL
      const msg = 'Invalid or missing invite link. Please request a new invitation from the admin.';
      setErrorMsg(msg);
      toast.error(msg, { duration: 6000 });
      setStatus('error');
    }

    handleConfirm();
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #EFF6FF 100%)' }}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(27,58,140,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(27,58,140,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: '#ffffff',
              border: '2px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(27,58,140,0.12)',
            }}
          >
            <Image
              src="/AscendLogo.webp"
              alt="Ascend Cricket Academy"
              width={52}
              height={52}
              className="object-contain"
              priority
              loading="eager"
            />
          </div>
          <h1
            className="font-extrabold text-2xl uppercase"
            style={{ color: '#1B3A8C', letterSpacing: '-0.01em' }}
          >
            Ascend Cricket Academy
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>
            Student & Admin Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 40px rgba(27,58,140,0.08)',
          }}
        >
          {status === 'loading' ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#EEF2FF' }}
              >
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#1B3A8C' }} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Verifying your invite link…</p>
                <p className="text-slate-400 text-sm mt-1">This will only take a moment.</p>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: '#1B3A8C',
                    width: '60%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#FEF2F2' }}
              >
                <AlertCircle className="h-8 w-8" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#0f172a' }}>Link Expired</h2>
                <p className="text-sm leading-relaxed max-w-xs mt-2" style={{ color: '#64748b' }}>{errorMsg}</p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-sm uppercase tracking-wider text-white transition-all duration-200"
                style={{
                  background: '#1B3A8C',
                  borderRadius: '8px',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={15} />
                Back to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
