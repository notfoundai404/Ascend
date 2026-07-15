'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dbService, Notice } from '@/lib/dbService';

interface NewsCard {
  image: string;
  title: string;
  description: string;
}

export const News: React.FC = () => {
  const defaultCards: NewsCard[] = [
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

  const [showNotices, setShowNotices] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const fetchNotices = async () => {
    if (notices.length > 0) return;
    setLoadingNotices(true);
    try {
      const data = await dbService.getNotices();
      setNotices(data);
    } catch (err) {
      console.error('Failed to fetch notices', err);
    } finally {
      setLoadingNotices(false);
    }
  };

  const displayCards: NewsCard[] = showNotices
    ? notices.map((n) => ({
        image: n.imageUrl || '/news_net_practice.png',
        title: n.title,
        description: n.content,
      }))
    : defaultCards;

  const currentCardsLength = displayCards.length || 1;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % currentCardsLength);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + currentCardsLength) % currentCardsLength);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-gray-100 pb-6 gap-6">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-condensed text-4xl md:text-5xl font-bold tracking-wider uppercase relative"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            {showNotices ? 'NOTICES' : 'IN THE NEWS'}
            <span className="absolute bottom-[-6px] left-0 w-2/5 h-[3px] bg-[var(--color-rplay-green)]" />
          </motion.h2>

          <div className="flex bg-gray-100 p-1 rounded font-sans border border-gray-200 shadow-sm">
            <button
              onClick={() => {
                setShowNotices(false);
                setCurrentIndex(0);
              }}
              className={`px-5 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition-all duration-200 ${
                !showNotices ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              News
            </button>
            <button
              onClick={() => {
                setShowNotices(true);
                setCurrentIndex(0);
                fetchNotices();
              }}
              className={`px-5 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition-all duration-200 ${
                showNotices ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Notices
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            onClick={handlePrev}
            className="relative md:absolute md:left-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none flex-shrink-0"
            aria-label="Previous News"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 overflow-hidden px-2 min-h-[300px]">
            {loadingNotices ? (
              <div className="flex items-center justify-center h-48 w-full text-gray-500 font-sans">
                Loading notices...
              </div>
            ) : displayCards.length === 0 ? (
              <div className="flex items-center justify-center h-48 w-full text-gray-500 font-sans">
                No notices available at the moment.
              </div>
            ) : (
              <>
                {/* Desktop: all 3 cards with stagger */}
                <div className="hidden md:grid grid-cols-3 gap-8">
                  {displayCards.slice(currentIndex, currentIndex + 3).map((card, index) => (
                    <motion.div
                      key={currentIndex + index}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.12 }}
                      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
                      className="group flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-sm transition-all duration-300 h-full"
                    >
                      <div className="relative h-56 w-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                      <div className="h-[2px] w-0 bg-[var(--color-rplay-green)] group-hover:w-full transition-all duration-500 mt-auto" />
                    </motion.div>
                  ))}
                  {/* Fill empty spots if less than 3 cards displayed */}
                  {Array.from({ length: Math.max(0, 3 - displayCards.slice(currentIndex, currentIndex + 3).length) }).map((_, i) => (
                     <div key={`empty-${i}`} className="hidden md:block"></div>
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
                      className="w-full flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-md h-full"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={displayCards[currentIndex]?.image}
                          alt={displayCards[currentIndex]?.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3
                          className="font-condensed text-2xl tracking-wider text-[var(--color-rplay-green)] font-bold mb-2"
                          style={{ fontFamily: '"League Gothic", sans-serif' }}
                        >
                          {displayCards[currentIndex]?.title}
                        </h3>
                        <p className="text-gray-600 text-sm font-sans leading-relaxed flex-grow">
                          {displayCards[currentIndex]?.description}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleNext}
            className="relative md:absolute md:right-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none flex-shrink-0"
            aria-label="Next News"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Mobile dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {displayCards.map((_, index) => (
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
