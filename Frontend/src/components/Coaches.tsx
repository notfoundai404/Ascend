'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Coach {
  name: string;
  role: string;
  certifications: string[];
  representation: string[];
  image: string;
}

const coachData: Coach = {
  name: 'Sreekanth M. Nair',
  role: 'Senior Coach',
  certifications: [
    'BCCI Level 1 Coach',
    'BCCI Level 0 Coach'
  ],
  representation: [
    'Jacobs Trophy',
    'University of Kerala',
    'U19, U22 Zonal Tournaments'
  ],
  image: '/coach-sreekanth.png',
};

export const Coaches: React.FC = () => {
  return (
    <section id="coaches" className="relative bg-white text-black py-24 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 text-center md:text-left"
        >
          <p className="text-[var(--color-rplay-green)] font-sans text-xs tracking-[0.3em] uppercase mb-4">
            Meet The Expert
          </p>
          <h2
            className="font-condensed text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider text-black uppercase"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            Our <span className="text-[var(--color-rplay-green)]">Head Coach</span>
          </h2>
        </motion.div>

        {/* Single Coach Profile */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center bg-gray-50 border border-gray-100 p-8 sm:p-12 shadow-sm relative group"
        >
          {/* Photo */}
          <div className="w-full lg:w-2/5 relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-[var(--color-rplay-dark)] to-[var(--color-rplay-gray)] overflow-hidden relative shadow-lg">
              {/* Use standard img tag for simplicity, loading image from public folder */}
              <img
                src={coachData.image}
                alt={coachData.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[var(--color-rplay-green)] opacity-80" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[var(--color-rplay-green)] opacity-80" />
            </div>
          </div>

          {/* Info block */}
          <div className="w-full lg:w-3/5 flex flex-col justify-center">
            <div className="text-[var(--color-rplay-green)] font-sans text-sm sm:text-base tracking-widest uppercase mb-2 font-semibold">
              {coachData.role}
            </div>
            <h3
              className="font-condensed text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-wider uppercase mb-8"
              style={{ fontFamily: '"League Gothic", sans-serif' }}
            >
              {coachData.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-2">
              {/* Certifications */}
              <div>
                <h4 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">
                  Certifications
                </h4>
                <ul className="space-y-3">
                  {coachData.certifications.map((cert, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[var(--color-rplay-green)] mt-0.5 select-none">✓</span>
                      <span className="font-sans text-gray-700 font-medium">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Representation */}
              <div>
                <h4 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-200 pb-2">
                  Representation
                </h4>
                <ul className="space-y-3">
                  {coachData.representation.map((rep, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[var(--color-rplay-green)] mt-0.5 select-none">✦</span>
                      <span className="font-sans text-gray-700 font-medium">{rep}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[var(--color-rplay-green)] group-hover:w-full transition-all duration-700 ease-out" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Coaches;
