'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const PremiumAbout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section id="about" className="py-24 md:py-32 bg-[var(--color-rplay-dark)]">
      <div ref={containerRef} className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column - Image */}
          <motion.div style={{ y: imageY }} className="relative">
            <div className="aspect-[4/5] overflow-hidden relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/Academy1.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rplay-dark)] via-transparent to-transparent" />
              
              {/* Decorative elements */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-0 left-0 h-1 bg-[var(--color-rplay-green)]"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-0 right-0 w-1 bg-[var(--color-rplay-green)]"
              />
            </div>
          </motion.div>

          {/* Right column - Content */}
          <motion.div style={{ y: textY }}>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-condensed text-sm tracking-[0.4em] uppercase text-[var(--color-rplay-green)] block mb-4"
            >
              ABOUT US
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-condensed text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase mb-8 leading-tight"
            >
              Building Champions,<br />
              <span className="text-[var(--color-rplay-green)]">One Innings at a Time</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-sans text-white/70 text-base md:text-lg leading-relaxed mb-6"
            >
              At Ascend Cricket Academy, we believe that every player has the potential to achieve greatness. Our philosophy combines traditional cricketing values with modern training methodologies.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="font-sans text-white/70 text-base md:text-lg leading-relaxed mb-8"
            >
              With state-of-the-art facilities, experienced coaches, and a proven track record of developing elite talent, we provide the perfect environment for cricketers to thrive and reach their full potential.
            </motion.p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {[
                { title: 'Expert Coaching', desc: 'Former professional players' },
                { title: 'Premium Facilities', desc: 'World-class training grounds' },
                { title: 'Personalized Coaching', desc: 'Benefit from individual attention with a dedicated 1:9 coach-to-child ratio.' },
                { title: 'Represent Top Clubs', desc: 'Selected players will get a chance to represent top registered clubs in Bengaluru.' },
                { title: 'Proven Results', desc: 'Championship-winning program' },
                { title: 'Holistic Development', desc: 'Mind, body, and skill' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <h3 className="font-condensed text-2xl sm:text-3xl text-white font-bold mb-2 tracking-wide uppercase">{feature.title}</h3>
                  <p className="font-sans text-sm text-white/50">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PremiumAbout;
