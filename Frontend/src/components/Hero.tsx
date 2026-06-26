import React from 'react';

export const Hero: React.FC = () => {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-5rem)] mt-20 w-full flex flex-col justify-between pt-4 pb-16 bg-cover bg-top overflow-hidden"
      style={{ backgroundImage: "url('/Hero1.png')" }}
    >
      {/* Main Content Area - pushed to top to avoid overlapping batsman */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-start text-center px-6 max-w-7xl mx-auto w-full pt-4 md:pt-8">
        {/* Title */}
        <h1 
          className="font-condensed text-[3.5rem] sm:text-[5.5rem] md:text-[7.5rem] lg:text-[9.2rem] font-bold leading-none tracking-tight text-[#1b1b1b] uppercase"
          style={{ fontFamily: '"League Gothic", sans-serif' }}
        >
          READY TO <span className="text-[var(--color-rplay-green)]">PLAY ?</span>
        </h1>

        {/* Sub-headline */}
        <h2 
          className="mt-6 font-condensed text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.15em] text-[#1b1b1b] uppercase"
          style={{ fontFamily: '"League Gothic", sans-serif' }}
        >
          FEEL THE THRILL OF CRICKET
        </h2>

        {/* Description */}
        <p className="mt-4 max-w-xl text-neutral-700 font-sans text-sm sm:text-base md:text-lg tracking-wide leading-relaxed">
          At R-Play Sports Academy, we build skills, boost confidence and shape the champions of tomorrow.
        </p>
      </div>

      {/* Action Boxes / Cards positioned at the bottom of the section */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 mt-auto pb-12 md:pb-20 flex flex-row justify-between items-center gap-6">
        {/* Card 1: Cricket Academy */}
        <button
          onClick={() => handleScrollTo('academies')}
          className="group relative flex flex-col items-center justify-between py-5 px-3 w-28 h-32 sm:w-32 sm:h-36 md:w-36 md:h-42 border border-white hover:border-[var(--color-rplay-green)] rounded-none transition-all duration-300 bg-black/10 backdrop-blur-[1px] hover:bg-black/30"
        >
          {/* Cricket Batter Silhouette */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white group-hover:text-[var(--color-rplay-green)] transition-colors duration-300 mb-2 scale-75 sm:scale-90 md:scale-100"
          >
            <circle cx="12" cy="4" r="2" />
            <path d="M17 7h-6.5c-.8 0-1.5.5-1.8 1.2l-2.2 4.4c-.3.6-.1 1.3.5 1.6l.8.4c.6.3 1.3.1 1.6-.5l1.6-3.2v4.6l-3.2 3.2c-.4.4-.4 1 0 1.4l.6.6c.4.4 1 .4 1.4 0l3.2-3.2V22c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-6.5l1.5-2 1 2c.2.4.6.6 1 .5l.8-.2c.5-.1.8-.7.6-1.2l-2.2-4.4c-.3-.6-.9-1-1.6-1Z" />
            <path d="M7 13.5L3.5 17c-.5.5-.5 1.3 0 1.8l.5.5c.5.5 1.3.5 1.8 0l3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div 
            className="font-condensed text-xs sm:text-base md:text-xl font-bold tracking-wider text-white group-hover:text-[var(--color-rplay-green)] transition-colors duration-300 leading-tight"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            CRICKET<br />ACADEMY
          </div>
        </button>

        {/* Spacer for cricketer in the center */}
        <div className="flex-grow hidden md:block" />

        {/* Card 2: Turf Booking */}
        <button
          onClick={() => handleScrollTo('facilities')}
          className="group relative flex flex-col items-center justify-between py-5 px-3 w-28 h-32 sm:w-32 sm:h-36 md:w-36 md:h-42 border border-white hover:border-[var(--color-rplay-green)] rounded-none transition-all duration-300 bg-black/10 backdrop-blur-[1px] hover:bg-black/30"
        >
          {/* Turf Pitch SVG */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white group-hover:text-[var(--color-rplay-green)] transition-colors duration-300 mb-2 scale-75 sm:scale-90 md:scale-100"
          >
            <rect x="2" y="4" width="20" height="16" rx="1" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="M2 8h3v8H2" />
            <path d="M22 8h-3v8h3" />
          </svg>
          <div 
            className="font-condensed text-xs sm:text-base md:text-xl font-bold tracking-wider text-white group-hover:text-[var(--color-rplay-green)] transition-colors duration-300 leading-tight"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            TURF<br />BOOKING
          </div>
        </button>
      </div>
    </section>
  );
};

export default Hero;
