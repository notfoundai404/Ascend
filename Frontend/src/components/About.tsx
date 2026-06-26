import React from 'react';

export const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-[90vh] flex items-center justify-center py-20 bg-cover bg-[115%_top] overflow-hidden"
      style={{ backgroundImage: "url('/Hero2.png')" }}
    >


      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col justify-center">
        {/* Title with custom green accent line */}
        <div className="relative mb-12">
          <h2 
            className="font-condensed text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white uppercase inline-block"
            style={{ fontFamily: '"League Gothic", sans-serif' }}
          >
            <span className="relative">
              ABOUT
              <span className="absolute bottom-[-6px] left-0 w-full h-[3px] bg-[var(--color-rplay-green)]" />
            </span>{' '}
            R-PLAY
          </h2>
        </div>

        {/* Text Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-2xl text-white/90 font-sans text-sm sm:text-base leading-relaxed tracking-wide">
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <p>
              <span className="text-[var(--color-rplay-green)] font-bold">
                R-Play Sports Academy
              </span>{' '}
              is a premier Cricket Academy dedicated to nurturing young talent and
              promoting excellence in cricket. Our academy is equipped with
              world-class facilities, experienced coaches, and structured training
              programs for all age groups.
            </p>
            <p>
              We focus on skill development, fitness, discipline, and mental
              toughness — essential elements for becoming a true sportsperson.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6">
            <p>
              In addition to our Cricket Academy, we also offer top-quality Turf
              facilities for practice matches, corporate events, and recreational
              games.
            </p>
            <p>
              R-Play is more than just a sports academy, it's a platform where
              passion meets performance. Join us and take your game to the next level!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
