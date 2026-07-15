'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';

const heroImages = ['/ascend.webp', '/Hero1.png', '/Hero2.png', '/Hero3.png'];

export const PremiumHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-8%']);
  const springContentY = useSpring(contentY, { stiffness: 80, damping: 25 });

  // Auto-cycle images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => {
        setPrevImage(prev);
        return (prev + 1) % heroImages.length;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const words = ['READY', 'TO', 'PLAY?'];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* ─── Background Image Carousel ─── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {prevImage !== null && (
            <motion.div
              key={`prev-${prevImage}`}
              className="absolute inset-0 bg-[length:100%_100%] bg-no-repeat"
              style={{ backgroundImage: `url(${heroImages[prevImage]})` }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              onAnimationComplete={() => setPrevImage(null)}
            />
          )}
        </AnimatePresence>

        {/* Current image with Ken Burns entrance */}
        <motion.div
          key={`current-${currentImage}`}
          className="absolute inset-0 bg-[length:100%_100%] bg-no-repeat will-change-transform"
          style={{ backgroundImage: `url(${heroImages[currentImage]})`, y: bgY }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </div>

      {/* ─── Dark gradient — text side only ─── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Dark wash left → transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* ─── Main Content ─── */}
      <motion.div
        style={{ opacity: contentOpacity, y: springContentY }}
        className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28"
      >
        {/* Academy badge */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            className="h-px bg-gradient-to-r from-[var(--color-rplay-green)] to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '2.5rem' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <span
            className="text-xs sm:text-sm tracking-[0.35em] uppercase font-semibold text-white/80"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
          </span>
        </motion.div>

        {/* Headline — word-by-word reveal */}
        <div className="flex flex-wrap gap-x-4 sm:gap-x-7 mb-4 sm:mb-6">
          {words.map((word, i) => (
            <div key={word} className="overflow-hidden">
              <motion.span
                initial={{ y: '115%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.13, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="block font-bold leading-none uppercase text-white"
                style={{
                  fontFamily: '"League Gothic", sans-serif',
                  fontSize: 'clamp(3.2rem, 12vw, 10.5rem)',
                  letterSpacing: '-0.01em',
                  textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                  color: word === 'PLAY?' ? 'var(--color-rplay-green)' : undefined,
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8, ease: 'easeOut' }}
          className="max-w-md sm:max-w-lg text-white/75 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          Where raw talent meets world-class coaching. Transform your passion into performance and become the cricketer you were born to be.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-5"
        >
          <MagneticButton
            onClick={() => handleScrollTo('join')}
            className="relative bg-[var(--color-rplay-green)] text-white font-bold text-[10px] sm:text-sm tracking-[0.2em] px-6 sm:px-14 py-3 sm:py-5 uppercase overflow-hidden group shadow-[0_4px_24px_rgba(34,197,94,0.35)]"
            strength={32}
          >
            <span className="relative z-10" style={{ fontFamily: '"Outfit", sans-serif' }}>ENROLL NOW</span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <span className="absolute inset-0 border border-green-300/40 group-hover:border-green-200/80 transition-colors duration-300" />
          </MagneticButton>

          <button
            onClick={() => handleScrollTo('about')}
            className="flex items-center gap-3 text-white/70 hover:text-white text-[10px] sm:text-sm tracking-[0.2em] uppercase font-semibold transition-colors duration-300 group"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            <span>LEARN MORE</span>
            <motion.span
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/30 group-hover:border-white/70 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </button>
        </motion.div>

        {/* Coaching Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8, ease: 'easeOut' }}
          className="mt-8 flex flex-col gap-3"
        >
          <span
            className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/45 font-semibold"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            Coaching Modes Available
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Team Coaching',
              'Personalised Sessions',
              'One-to-One',
              'Semi-Private Classes',
            ].map((mode, i) => (
              <motion.span
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.45 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 bg-white/8 hover:bg-white/14 hover:border-[var(--color-rplay-green)]/60 transition-all duration-300 cursor-default"
                style={{ fontFamily: '"Outfit", sans-serif', backdropFilter: 'blur(4px)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-rplay-green)' }}
                />
                <span className="text-white/80 text-[11px] sm:text-xs font-medium tracking-wide">
                  {mode}
                </span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Image Indicator Dots ─── */}
      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-2 z-20 w-32 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === currentImage ? '2rem' : '0.45rem', background: 'rgba(255,255,255,0.3)' }}
          >
            {i === currentImage && (
              <motion.span
                className="absolute inset-0 bg-white rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: 'left' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* ─── Scroll Cue ─── */}
      <motion.div
        className="absolute bottom-8 right-8 sm:right-14 flex flex-col items-center gap-2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span
          className="text-white/40 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase rotate-90 mb-2"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          scroll
        </span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent"
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  );
};

export default PremiumHero;
