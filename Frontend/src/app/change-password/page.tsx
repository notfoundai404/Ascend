'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { dbService } from '@/lib/dbService';

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[@#$!%^&*]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure the new password meets all security criteria.');
      return;
    }

    setLoading(true);

    try {
      await dbService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please verify your temporary password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-[#1B3A8C]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-[#1B3A8C] text-white p-3.5 rounded-2xl shadow-xl shadow-blue-900/10 mb-4 flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-condensed text-4xl font-extrabold tracking-wider text-[#1B3A8C] uppercase leading-none" style={{ fontFamily: '"League Gothic", sans-serif' }}>
            Setup Secure Password
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">
            First Login Password Update Required
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="mx-auto h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Password Changed!</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your password has been updated successfully. You will be redirected to the login screen shortly to sign in with your new credentials.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-xs font-semibold leading-relaxed"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter temporary password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B3A8C] focus:bg-white transition-all text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B3A8C] focus:bg-white transition-all text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B3A8C] focus:bg-white transition-all text-sm font-sans"
                />
              </div>

              {/* Password complexity indicators */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Password Requirements
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-medium font-sans">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${passwordCriteria.length ? 'bg-green-600' : 'bg-slate-300'}`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-green-600' : 'bg-slate-300'}`} />
                    One uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${passwordCriteria.lowercase ? 'bg-green-600' : 'bg-slate-300'}`} />
                    One lowercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.number ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${passwordCriteria.number ? 'bg-green-600' : 'bg-slate-300'}`} />
                    One number
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.special ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${passwordCriteria.special ? 'bg-green-600' : 'bg-slate-300'}`} />
                    One symbol (@#$!)
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full bg-[#1B3A8C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Save Password
                    <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
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
