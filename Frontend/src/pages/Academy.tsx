import React, { useEffect } from 'react';
import AcademyNavbar from '../components/AcademyNavbar';
import Footer from '../components/Footer';
import { Building2, Layout, Users, TrendingUp, Target, Award, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};

const Academy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen font-sans text-gray-900">
      <AcademyNavbar />
      
      {/* Hero Section */}
      <section className="pt-20 bg-white relative h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pt-20">
          <img 
            src="/Academy1.png" 
            alt="Academy Facilities" 
            className="w-full h-full object-contain object-right"
          />
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-10 pt-20 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-3/4"></div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto h-full flex items-center">
          <div className="px-6 md:px-12 py-12 flex flex-col justify-center max-w-2xl">
            <span className="text-[var(--color-rplay-green)] font-bold tracking-wider text-sm mb-4">OUR ACADEMIES</span>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-black">
              WORLD-CLASS FACILITIES.<br/>
              <span className="text-[var(--color-rplay-green)]">CHAMPION</span> MINDSET.
            </h1>
            <p className="text-gray-700 text-lg max-w-md">
              Train at R-Play's premium cricket academies with top-notch infrastructure, expert coaching, and a winning environment.
            </p>
          </div>
        </div>
      </section>

      {/* Title Section */}
      <motion.section {...fadeInUp} className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4 tracking-wide">OUR ACADEMIES</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          High-performance training centers equipped with international standards to help you play, improve and prevail.
        </p>
      </motion.section>

      {/* Facilities Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
            <div className="relative h-64 overflow-hidden">
              <span className="absolute top-4 right-4 bg-[var(--color-rplay-green)] text-white text-xs font-bold px-3 py-1 rounded-sm z-10">FEATURED</span>
              <img src="https://images.unsplash.com/photo-1589304028080-692abce159a4?q=80&w=800&auto=format&fit=crop" alt="Sharjapur Campus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#f0f9ed] flex items-center justify-center text-[var(--color-rplay-green)] border border-[#d6eed0]">
                  <Home size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-wide">SHARJAPUR CAMPUS</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Our flagship high-performance center equipped with international standard pitches, advanced biomechanics labs, and elite recovery suites.
                </p>
                <a href="#" className="inline-flex items-center text-[var(--color-rplay-green)] font-bold text-sm tracking-wider hover:text-green-700 transition-colors">
                  EXPLORE CAMPUS <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
            <div className="relative h-64 overflow-hidden">
              <span className="absolute top-4 right-4 bg-[var(--color-rplay-green)] text-white text-xs font-bold px-3 py-1 rounded-sm z-10">FEATURED</span>
              <img src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop" alt="K R Puram Facility" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#f0f9ed] flex items-center justify-center text-[var(--color-rplay-green)] border border-[#d6eed0]">
                  <Building2 size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-wide">K R PURAM FACILITY</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  A premier indoor/outdoor hybrid training ground designed for rigorous year-round development, featuring floodlit turfs and professional coaching pods.
                </p>
                <a href="#" className="inline-flex items-center text-[var(--color-rplay-green)] font-bold text-sm tracking-wider hover:text-green-700 transition-colors">
                  EXPLORE FACILITY <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
            <div className="relative h-64 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1589304028080-692abce159a4?q=80&w=800&auto=format&fit=crop" alt="Turf Sharjapur" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#f0f9ed] flex items-center justify-center text-[var(--color-rplay-green)] border border-[#d6eed0]">
                  <Layout size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-wide">TURF - SHARJAPUR</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Floodlit turf with match-quality surfaces for practice sessions, net bookings, and box cricket.
                </p>
                <a href="#" className="inline-flex items-center text-[var(--color-rplay-green)] font-bold text-sm tracking-wider hover:text-green-700 transition-colors">
                  BOOK TURF <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
            <div className="relative h-64 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop" alt="Turf K R Puram" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#f0f9ed] flex items-center justify-center text-[var(--color-rplay-green)] border border-[#d6eed0]">
                  <Building2 size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-wide">TURF - K R PURAM</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Premium turf and net lanes for individual and team practice. Hourly bookings available.
                </p>
                <a href="#" className="inline-flex items-center text-[var(--color-rplay-green)] font-bold text-sm tracking-wider hover:text-green-700 transition-colors">
                  BOOK TURF <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <motion.section {...fadeInUp} className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><Users size={32} /></div>
            <div>
              <h4 className="font-bold text-sm tracking-wide mb-1">EXPERT COACHES</h4>
              <p className="text-xs text-gray-500">Experienced & certified coaching staff</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><TrendingUp size={32} /></div>
            <div>
              <h4 className="font-bold text-sm tracking-wide mb-1">ELITE FACILITIES</h4>
              <p className="text-xs text-gray-500">World-class infrastructure for champions</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><Target size={32} /></div>
            <div>
              <h4 className="font-bold text-sm tracking-wide mb-1">HOLISTIC DEVELOPMENT</h4>
              <p className="text-xs text-gray-500">Focus on skills, fitness, and mindset</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><Award size={32} /></div>
            <div>
              <h4 className="font-bold text-sm tracking-wide mb-1">PATHWAY TO EXCELLENCE</h4>
              <p className="text-xs text-gray-500">Programs designed for every level of cricketer</p>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Academy;
