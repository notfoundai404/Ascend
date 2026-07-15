'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * /auth/set-password
 *
 * Landed on after /auth/confirm successfully exchanges the invite token.
 * The user now has an active Supabase session; they just need to set a password.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isReset, setIsReset] = useState(false);

  // Guard: if there's no active session the token exchange failed
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?error=invalid_link');
        return;
      }
      // Detect recovery flow via URL search param set by /auth/confirm
      const params = new URLSearchParams(window.location.search);
      setIsReset(params.get('type') === 'recovery');
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      // Sign out so the user must log in manually
      await supabase.auth.signOut();
      toast.success(isReset ? 'Password reset! Redirecting to login…' : 'Password set! Redirecting to login…');
      setDone(true);
      // Redirect to login after a short delay
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (password.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (password.length < 12) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #EFF6FF 100%)' }}
    >
      {/* Background grid */}
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
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
            {isReset ? 'Reset Your Password' : 'Set Your Password'}
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
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#F0FDF4' }}
              >
                <CheckCircle className="h-9 w-9" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: '#0f172a' }}>
                  {isReset ? 'Password Reset Successfully!' : 'Password Set Successfully!'}
                </p>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Redirecting you to the login page…</p>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: '#10b981',
                    width: '100%',
                    transition: 'width 2s linear',
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                className="rounded-lg p-3 text-sm font-medium flex gap-2.5"
                style={{ background: '#EEF2FF', color: '#1B3A8C', border: '1px solid #C7D2FE' }}
              >
                <span className="text-base">{isReset ? '🔐' : '👋'}</span>
                <p>{isReset ? 'Enter your new password below to regain access to your account.' : 'Welcome! Please choose a strong password to activate your account.'}</p>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="set-password-new"
                  className="block text-xs font-bold uppercase mb-2"
                  style={{ color: '#374151', letterSpacing: '0.06em' }}
                >
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#9ca3af' }}>
                    <Lock size={17} />
                  </span>
                  <input
                    id="set-password-new"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-sm font-medium transition-all duration-200"
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B3A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(27,58,140,0.12)';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    style={{ color: '#94a3b8' }}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {/* Strength bar */}
                {strength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ background: strength.color, width: strength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="set-password-confirm"
                  className="block text-xs font-bold uppercase mb-2"
                  style={{ color: '#374151', letterSpacing: '0.06em' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#9ca3af' }}>
                    <Lock size={17} />
                  </span>
                  <input
                    id="set-password-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-sm font-medium transition-all duration-200"
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B3A8C';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(27,58,140,0.12)';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    style={{ color: '#94a3b8' }}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm && (
                  <p
                    className="text-xs font-semibold mt-1.5 flex items-center gap-1"
                    style={{ color: password === confirm ? '#10b981' : '#ef4444' }}
                  >
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group"
                style={{
                  background: loading ? '#93a8d8' : 'linear-gradient(135deg, #1B3A8C 0%, #2a4eb0 100%)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(27,58,140,0.25)',
                  letterSpacing: '0.07em',
                  marginTop: '4px',
                }}
              >
                {loading ? (
                  <span className="flex h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                ) : (
                  <>
                    {isReset ? 'Reset Password' : 'Activate Account'}
                    <ChevronRight size={17} className="transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
