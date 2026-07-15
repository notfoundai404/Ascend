'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Ascend Academy transformed my game completely. The coaches understood my strengths and worked tirelessly to refine my technique. Today, I'm playing at a level I never thought possible.",
    author: "Rahul Sharma",
    role: "State Level Player"
  },
  {
    quote: "The training facilities are world-class and the coaching methodology is ahead of its time. My son's confidence has skyrocketed since joining the academy.",
    author: "Priya Patel",
    role: "Parent"
  },
  {
    quote: "From a complete beginner to captain of my school team in just two years. Ascend gave me the skills, discipline, and mindset to succeed both on and off the field.",
    author: "Arjun Reddy",
    role: "Academy Alumni"
  }
];

export const PremiumTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[var(--color-rplay-light-gray)]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-condensed text-sm tracking-[0.4em] uppercase text-[var(--color-rplay-green)] block mb-4"
          >
            TESTIMONIALS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-condensed text-3xl sm:text-4xl md:text-6xl font-bold text-white uppercase"
          >
            What Our Players Say
          </motion.h2>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-8 text-[var(--color-rplay-green)]">"</div>
              <p className="font-sans text-base sm:text-xl md:text-2xl lg:text-3xl text-white leading-relaxed mb-8 sm:mb-10 max-w-4xl mx-auto">
                {testimonials[currentIndex].quote}
              </p>
              <div>
                <p className="font-condensed text-lg sm:text-xl md:text-2xl text-white font-bold">{testimonials[currentIndex].author}</p>
                <p className="font-sans text-sm md:text-base text-white/60 tracking-wide uppercase mt-1">{testimonials[currentIndex].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-10 sm:mt-12">
            <button
              onClick={prev}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:border-[var(--color-rplay-green)] hover:text-[var(--color-rplay-green)] transition-all duration-300 touch-manipulation"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                    idx === currentIndex ? 'bg-[var(--color-rplay-green)] w-8' : 'bg-white/30 w-2'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:border-[var(--color-rplay-green)] hover:text-[var(--color-rplay-green)] transition-all duration-300 touch-manipulation"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonials;
