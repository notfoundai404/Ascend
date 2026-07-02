'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsCard {
  image: string;
  title: string;
  description: string;
}

export const News: React.FC = () => {
  const cards: NewsCard[] = [
    {
      image: '/news_net_practice.png',
      title: 'TRAIN. PRACTICE. PERFORM.',
      description: 'Consistent training and focused practice make champions. Are you ready?',
    },
    {
      image: '/news_building_champions.png',
      title: 'BUILDING CHAMPIONS',
      description: "We don't just teach cricket, we build character, discipline and winners.",
    },
    {
      image: '/news_premium_turf.png',
      title: 'PREMIUM TURF FACILITY',
      description: 'Book our top-quality turf for matches, events and practice sessions.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section id="academies" className="relative bg-white text-black py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-condensed text-4xl md:text-5xl font-bold tracking-wider uppercase relative"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            IN THE NEWS
            <span className="absolute bottom-[-6px] left-0 w-2/5 h-[3px] bg-[var(--color-rplay-green)]" />
          </motion.h2>
          <motion.a
            href="#join"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-[var(--color-rplay-green)] text-[var(--color-rplay-green)] font-semibold text-xs tracking-wider px-5 py-2 rounded hover:bg-[var(--color-rplay-green)] hover:text-white transition-all duration-300 font-sans"
          >
            VIEW ALL
          </motion.a>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] md:left-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none"
            aria-label="Previous News"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-full overflow-hidden px-2">
            {/* Desktop: all 3 cards with stagger */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
                  className="group flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-sm transition-all duration-300"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <motion.img
                      src={card.image}
                      alt={card.title}
                      className="object-cover w-full h-full"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.5 }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-[var(--color-rplay-green)]/0 group-hover:bg-[var(--color-rplay-green)]/10 transition-colors duration-400" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3
                      className="font-condensed text-2xl tracking-wider text-[var(--color-rplay-green)] font-bold mb-2 group-hover:text-black transition-colors"
                      style={{ fontFamily: '"League Gothic", sans-serif' }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-sans leading-relaxed flex-grow">
                      {card.description}
                    </p>
                  </div>
                  {/* Bottom line */}
                  <div className="h-[2px] w-0 bg-[var(--color-rplay-green)] group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </div>

            {/* Mobile: animated single card */}
            <div className="md:hidden flex justify-center overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full max-w-sm flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-md"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={cards[currentIndex].image}
                      alt={cards[currentIndex].title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className="font-condensed text-2xl tracking-wider text-[var(--color-rplay-green)] font-bold mb-2"
                      style={{ fontFamily: '"League Gothic", sans-serif' }}
                    >
                      {cards[currentIndex].title}
                    </h3>
                    <p className="text-gray-600 text-sm font-sans leading-relaxed">
                      {cards[currentIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-[-20px] md:right-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none"
            aria-label="Next News"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Mobile dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
              className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'w-6 h-2.5 bg-[var(--color-rplay-green)]' : 'w-2.5 h-2.5 bg-gray-200'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center px-4 max-w-2xl mx-auto"
        >
          <p className="text-gray-500 italic font-sans text-sm sm:text-base tracking-wide leading-relaxed">
            &ldquo;The harder you work for something, the greater you&apos;ll feel when you achieve it.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default News;
