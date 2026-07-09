'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './MagneticButton';

export const PremiumCTA: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80; // 5rem = 80px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="join" className="relative py-32 md:py-48 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ scale: bgScale, backgroundImage: "url('/Hero2.png')" }}
        />
        <div className="absolute inset-0 bg-[var(--color-rplay-dark)]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rplay-dark)] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-condensed text-sm tracking-[0.4em] uppercase text-[var(--color-rplay-green)] block mb-6"
        >
          READY TO BEGIN?
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-condensed text-4xl md:text-6xl lg:text-8xl font-bold text-white uppercase mb-8 leading-tight"
        >
          Join the Elite
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-sans text-white/70 text-base md:text-lg lg:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          Take the first step towards realizing your cricketing dreams. Our doors are open to passionate players of all ages and skill levels.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <MagneticButton
            onClick={() => handleScrollTo('join')}
            className="bg-[var(--color-rplay-green)] text-white font-bold text-sm md:text-base tracking-[0.2em] px-12 py-5 shadow-[0_0_40px_rgba(27,58,140,0.5)] hover:shadow-[0_0_60px_rgba(27,58,140,0.8)] font-sans uppercase"
          >
            ENROLL NOW
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumCTA;
