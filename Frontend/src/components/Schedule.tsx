'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sessions = [
  {
    days: 'Tue – Sat',
    time: '4:30 PM – 6:30 PM',
    label: 'Evening',
  },
  {
    days: 'Sat & Sun',
    time: '7:00 AM – 9:00 AM',
    label: 'Morning',
  },
  {
    days: 'Sunday',
    time: '4:30 PM – 6:30 PM',
    label: 'Evening',
  },
];

export const Schedule: React.FC = () => {
  return (
    <section className="relative w-full bg-[var(--color-rplay-dark)] border-t border-white/5 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 60px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <span
              className="text-[10px] sm:text-xs tracking-[0.4em] uppercase font-semibold text-[var(--color-rplay-green)] block mb-2"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              ACA Prime Team Coaching
            </span>
            <h2
              className="font-condensed text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider text-white uppercase"
              style={{ fontFamily: '"League Gothic", sans-serif' }}
            >
              Practice <span className="text-[var(--color-rplay-green)]">Timings</span>
            </h2>
          </div>


          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-rplay-green)] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-rplay-green)]" />
          </span>
          <span
            className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            Current Schedule
          </span>
        </motion.div>

        {/* Schedule cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sessions.map((session, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[var(--color-rplay-green)]/40 transition-all duration-300 p-6"
            >
              {/* Top accent line animates on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-rplay-green)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Label pill */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-semibold px-2.5 py-1 border border-white/15 text-white/50"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  {session.label}
                </span>
              </div>

              {/* Days */}
              <p
                className="text-white text-sm sm:text-base font-semibold uppercase tracking-widest mb-1"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {session.days}
              </p>

              {/* Divider */}
              <div className="w-8 h-px bg-white/15 mb-3" />

              {/* Time */}
              <p
                className="text-white text-xl sm:text-2xl font-medium leading-none"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {session.time}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-8 text-white/30 text-xs tracking-wide"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          * Schedule is subject to change. Contact us for the latest timings and batch availability.
        </motion.p>
      </div>
    </section>
  );
};

export default Schedule;
