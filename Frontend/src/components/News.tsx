import React, { useState } from 'react';
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  return (
    <section id="academies" className="relative bg-white text-black py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
          <h2 
            className="font-condensed text-4xl md:text-5xl font-bold tracking-wider uppercase relative"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            IN THE NEWS
            <span className="absolute bottom-[-6px] left-0 w-2/5 h-[3px] bg-[var(--color-rplay-green)]" />
          </h2>
          <a
            href="#join"
            className="border border-[var(--color-rplay-green)] text-[var(--color-rplay-green)] font-semibold text-xs tracking-wider px-5 py-2 rounded hover:bg-[var(--color-rplay-green)] hover:text-white transition-all duration-300 font-sans"
          >
            VIEW ALL
          </a>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] md:left-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none"
            aria-label="Previous News"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards Grid */}
          <div className="w-full overflow-hidden px-2">
            {/* Desktop Layout - Grid of 3 */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="group flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
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
                </div>
              ))}
            </div>

            {/* Mobile Layout - Single Card Slider */}
            <div className="md:hidden flex justify-center">
              <div className="w-full max-w-sm flex flex-col bg-white border border-gray-100 rounded-none overflow-hidden shadow-md">
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
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-[-20px] md:right-[-35px] z-20 bg-white border border-gray-200 hover:border-[var(--color-rplay-green)] text-gray-500 hover:text-[var(--color-rplay-green)] p-2.5 rounded-none transition-all duration-200 shadow-md focus:outline-none"
            aria-label="Next News"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Carousel Indicators for Mobile */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[var(--color-rplay-green)]' : 'bg-gray-200'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Centered Quote */}
        <div className="mt-20 text-center px-4 max-w-2xl mx-auto">
          <p className="text-gray-500 italic font-sans text-sm sm:text-base tracking-wide leading-relaxed">
            "The harder you work for something, the greater you'll feel when you achieve it."
          </p>
        </div>
      </div>
    </section>
  );
};

export default News;
