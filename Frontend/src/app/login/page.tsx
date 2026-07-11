'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, ChevronRight, Activity } from 'lucide-react';
import { dbService } from '@/lib/dbService';
import { createClient } from '@/lib/supabase/client';

export default function ErpLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already signed in with Supabase, redirect to dashboard
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-[#1B3A8C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-[#1B3A8C] text-white p-3.5 rounded-2xl shadow-xl shadow-blue-900/10 mb-4 flex items-center justify-center">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="font-condensed text-4xl font-extrabold tracking-wider text-[#1B3A8C] uppercase leading-none" style={{ fontFamily: '"League Gothic", sans-serif' }}>
            Ascend Cricket Academy
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">
            Student & Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-5">
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
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@ascendcricket.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B3A8C] focus:bg-white transition-all text-sm font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B3A8C] focus:bg-white transition-all text-sm font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3A8C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:bg-blue-900/50"
            >
              {loading ? (
                <span className="flex h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Portal
                  <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-500 font-semibold hover:text-[#1B3A8C] transition-colors">
            ← Return to Homepage
          </a>
        </div>
      </motion.div>
    </div>
  );
}
