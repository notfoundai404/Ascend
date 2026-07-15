'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ChevronRight, Eye, EyeOff, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { dbService } from '@/lib/dbService';
import { createClient } from '@/lib/supabase/client';

type View = 'login' | 'forgot' | 'otp' | 'reset';

export default function ErpLogin() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Forgot-password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPwdLoading, setResetPwdLoading] = useState(false);
  const [resetPwdError, setResetPwdError] = useState('');
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        if (localStorage.getItem('erp_role')) {
          router.push('/dashboard');
        } else {
          try {
            const res = await fetch('/api/auth/profile', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (res.ok) {
              const { data: profile } = await res.json();
              localStorage.setItem('erp_role', profile.role.toLowerCase());
              localStorage.setItem('erp_username', profile.fullName);
              localStorage.setItem('erp_user_id', profile.id);
              router.push('/dashboard');
            } else {
              await supabase.auth.signOut();
            }
          } catch {
            await supabase.auth.signOut();
          }
        }
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dbService.login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP. Please try again.');
      }

      setOtp('');
      setOtpError('');
      setView('otp');
    } catch (err: any) {
      setResetError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otp.length !== 8) {
      setOtpError('Please enter the 8-digit code from your email.');
      return;
    }
    setOtpLoading(true);
    try {
      // ✅ Call verifyOtp directly on the BROWSER client so Supabase can set
      // the session cookie in the browser. Going through a server-side API
      // route loses the cookie because Next.js Route Handlers can't write
      // Set-Cookie headers from within @supabase/ssr's cookieStore helper.
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: otp,
        type: 'recovery',
      });

      if (error) {
        throw new Error('Invalid OTP. Please try again.');
      }

      setView('reset');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPwdError('');

    if (newPassword.length < 8) {
      setResetPwdError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetPwdError('Passwords do not match.');
      return;
    }

    setResetPwdLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setResetDone(true);
      setTimeout(() => {
        setView('login');
        setResetDone(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setResetPwdError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setResetPwdLoading(false);
    }
  };

  const passwordStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (newPassword.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (newPassword.length < 12) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8FAFC' }}>
      {/* ─── LEFT PANEL: Brand / Hero ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{ width: '48%', background: 'linear-gradient(145deg, #0d2260 0%, #1B3A8C 40%, #1e4db5 100%)' }}
      >
        {/* Decorative cricket-inspired grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glowing orb decorations */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />



        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-8"
          >
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255,255,255,0.95)', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
            >
              <Image
                src="/AscendLogo.webp"
                alt="Ascend Cricket Academy"
                width={96}
                height={96}
                className="object-contain"
                loading="eager"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1
              className="text-white font-extrabold leading-tight mb-3 uppercase"
              style={{ fontSize: '2.4rem', letterSpacing: '-0.01em' }}
            >
              Ascend Cricket<br />Academy
            </h1>
            <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.30)' }} />
            <p
              className="font-medium leading-relaxed max-w-xs mx-auto"
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}
            >
              Excellence on the Field,<br />Excellence in Everything
            </p>
          </motion.div>


        </div>


      </motion.div>

      {/* ─── RIGHT PANEL: Login Form ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <Image
            src="/AscendLogo.webp"
            alt="Ascend Cricket Academy"
            width={72}
            height={72}
            className="mx-auto mb-3"
            priority
            loading="eager"
          />
          <h1 className="font-extrabold text-2xl uppercase" style={{ color: '#1B3A8C', letterSpacing: '-0.01em' }}>Ascend Cricket Academy</h1>
        </div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* ── LOGIN VIEW ─────────────────────────────────── */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Heading */}
                <div className="mb-8">
                  <h2 className="font-bold text-3xl" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Welcome</h2>
                  <p className="mt-1.5 text-sm font-medium" style={{ color: '#64748b' }}>
                    Sign in to your account
                  </p>
                </div>

                {/* Error alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                  >
                    <span className="mt-0.5">⚠</span>
                    {error}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold uppercase mb-2"
                      style={{ color: '#374151', letterSpacing: '0.06em' }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#9ca3af' }}>
                        <User size={17} />
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium transition-all duration-200"
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
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-bold uppercase"
                        style={{ color: '#374151', letterSpacing: '0.06em' }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        id="forgot-password-btn"
                        onClick={() => { setResetEmail(username); setResetError(''); setView('forgot'); }}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: '#1B3A8C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#2a4eb0')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#1B3A8C')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#9ca3af' }}>
                        <Lock size={17} />
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                        style={{ color: '#94a3b8' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
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
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(27,58,140,0.38)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,58,140,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {loading ? (
                      <span className="flex h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    ) : (
                      <>
                        Sign In to Portal
                        <ChevronRight size={17} className="transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Back link */}
                <div className="text-center mt-8">
                  <a
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1B3A8C')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <ArrowLeft size={13} />
                    Return to Homepage
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD VIEW ────────────────────────── */}
            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setView('login'); setResetError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mb-8 transition-colors"
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1B3A8C')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </button>

                {/* Heading */}
                <div className="mb-8">
                  <h2 className="font-bold text-3xl" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Reset Password</h2>
                  <p className="mt-1.5 text-sm font-medium" style={{ color: '#64748b' }}>
                    Enter your email and we&apos;ll send a 8-digit OTP code.
                  </p>
                </div>

                {/* Error alert */}
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                  >
                    <span className="mt-0.5">⚠</span>
                    {resetError}
                  </motion.div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-bold uppercase mb-2"
                      style={{ color: '#374151', letterSpacing: '0.06em' }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#9ca3af' }}>
                        <Mail size={17} />
                      </span>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium transition-all duration-200"
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
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 px-4 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group"
                    style={{
                      background: resetLoading ? '#93a8d8' : 'linear-gradient(135deg, #1B3A8C 0%, #2a4eb0 100%)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: resetLoading ? 'not-allowed' : 'pointer',
                      boxShadow: resetLoading ? 'none' : '0 4px 20px rgba(27,58,140,0.25)',
                      letterSpacing: '0.07em',
                    }}
                    onMouseEnter={(e) => {
                      if (!resetLoading) {
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(27,58,140,0.38)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!resetLoading) {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,58,140,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {resetLoading ? (
                      <span className="flex h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    ) : (
                      <>
                        Send OTP Code
                        <ChevronRight size={17} className="transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── OTP ENTRY VIEW ──────────────────────────────── */}
            {view === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setOtpError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mb-8 transition-colors"
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1B3A8C')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                {/* Heading */}
                <div className="mb-6">
                  <h2 className="font-bold text-3xl" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Enter OTP</h2>
                  <p className="mt-1.5 text-sm font-medium" style={{ color: '#64748b' }}>
                    We sent an 8-digit code to{' '}
                    <span className="font-semibold" style={{ color: '#1B3A8C' }}>{resetEmail}</span>.
                    Enter it below to continue.
                  </p>
                </div>

                {/* OTP Error */}
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                  >
                    <span className="mt-0.5">⚠</span>
                    {otpError}
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label
                      htmlFor="otp-input"
                      className="block text-xs font-bold uppercase mb-2"
                      style={{ color: '#374151', letterSpacing: '0.06em' }}
                    >
                      8-Digit Code
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      required
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full text-center text-2xl font-bold py-4 transition-all duration-200"
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        letterSpacing: '0.25em',
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
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 8}
                    className="w-full py-3.5 px-4 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group"
                    style={{
                      background: (otpLoading || otp.length !== 8) ? '#93a8d8' : 'linear-gradient(135deg, #1B3A8C 0%, #2a4eb0 100%)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: (otpLoading || otp.length !== 8) ? 'not-allowed' : 'pointer',
                      boxShadow: (otpLoading || otp.length !== 8) ? 'none' : '0 4px 20px rgba(27,58,140,0.25)',
                      letterSpacing: '0.07em',
                    }}
                    onMouseEnter={(e) => {
                      if (!otpLoading && otp.length === 8) {
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(27,58,140,0.38)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!otpLoading && otp.length === 8) {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,58,140,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {otpLoading ? (
                      <span className="flex h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    ) : (
                      <>
                        Verify & Continue
                        <ChevronRight size={17} className="transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Resend */}
                  <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
                    Didn&apos;t receive it?{' '}
                    <button
                      type="button"
                      onClick={async () => {
                        setOtpError('');
                        setResetError('');
                        const res = await fetch('/api/auth/reset-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: resetEmail }),
                        });
                        const data = await res.json();
                        if (!res.ok) setOtpError(data.message || 'Failed to resend code.');
                        else setOtpError('');
                      }}
                      className="font-semibold underline"
                      style={{ color: '#1B3A8C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Resend code
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── RESET PASSWORD VIEW ──────────────────────────── */}
            {view === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {resetDone ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-6 text-center"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: '#F0FDF4' }}
                    >
                      <CheckCircle2 className="h-9 w-9" style={{ color: '#10b981' }} />
                    </div>
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#0f172a' }}>
                        Password Reset Successfully!
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#64748b' }}>Redirecting you to login…</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => { setView('otp'); setResetPwdError(''); }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold mb-8 transition-colors"
                      style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1B3A8C')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    >
                      <ArrowLeft size={13} />
                      Back
                    </button>

                    {/* Heading */}
                    <div className="mb-6">
                      <h2 className="font-bold text-3xl" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Set New Password</h2>
                      <p className="mt-1.5 text-sm font-medium" style={{ color: '#64748b' }}>
                        Create a strong password for your account.
                      </p>
                    </div>

                    {/* Error */}
                    {resetPwdError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium"
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                      >
                        <span className="mt-0.5">⚠</span>
                        {resetPwdError}
                      </motion.div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="reset-new-password"
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
                            id="reset-new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            placeholder="Min. 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                            style={{ color: '#94a3b8' }}
                            tabIndex={-1}
                          >
                            {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                          htmlFor="reset-confirm-password"
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
                            id="reset-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                            style={{ color: '#94a3b8' }}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                        {/* Match indicator */}
                        {confirmPassword && (
                          <p
                            className="text-xs font-semibold mt-1.5 flex items-center gap-1"
                            style={{ color: newPassword === confirmPassword ? '#10b981' : '#ef4444' }}
                          >
                            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={resetPwdLoading}
                        className="w-full py-3.5 px-4 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group"
                        style={{
                          background: resetPwdLoading ? '#93a8d8' : 'linear-gradient(135deg, #1B3A8C 0%, #2a4eb0 100%)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: resetPwdLoading ? 'not-allowed' : 'pointer',
                          boxShadow: resetPwdLoading ? 'none' : '0 4px 20px rgba(27,58,140,0.25)',
                          letterSpacing: '0.07em',
                        }}
                        onMouseEnter={(e) => {
                          if (!resetPwdLoading) {
                            e.currentTarget.style.boxShadow = '0 6px 28px rgba(27,58,140,0.38)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!resetPwdLoading) {
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,58,140,0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {resetPwdLoading ? (
                          <span className="flex h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                        ) : (
                          <>
                            Save New Password
                            <ChevronRight size={17} className="transform group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
