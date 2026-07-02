'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import PremiumHero from '@/components/PremiumHero';
import PremiumAbout from '@/components/PremiumAbout';
import ScrollStory from '@/components/ScrollStory';
import PremiumTestimonials from '@/components/PremiumTestimonials';
import PremiumCTA from '@/components/PremiumCTA';
import Footer from '@/components/Footer';
import News from '@/components/News';
import Coaches from '@/components/Coaches';
import Schedule from '@/components/Schedule';

export default function Home() {
  return (
    <div className="w-full bg-[var(--color-rplay-dark)] min-h-screen select-none">
      <Navbar />
      
      <PremiumHero />
      <PremiumAbout />
      <Schedule />
      <ScrollStory />
      
      {/* News section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <News />
      </motion.div>
      
      {/* Coaches section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Coaches />
      </motion.div>
      
      <PremiumTestimonials />
      <PremiumCTA />
      <Footer />
    </div>
  );
}
