import React, { useEffect } from 'react';
import AcademyNavbar from '../components/AcademyNavbar';
import Footer from '../components/Footer';
import { 
  Building2, Users, TrendingUp, SunMedium, CloudRain, CalendarDays, 
  MapPin, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};

const Sharjapur: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen font-sans text-gray-900">
      <AcademyNavbar />

      {/* Hero Section */}
      <section className="mt-20 relative overflow-hidden h-[500px] md:h-[600px] bg-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Sharjapur.png" 
            alt="Classic Indian Cricket Academy & Turf" 
            className="w-full h-full object-cover object-right"
          />
        </div>
        
        {/* Background Overlays for Text Visibility */}
        <div className="absolute inset-y-0 left-0 z-10 bg-white w-full md:w-[45%]"></div>
        <div className="absolute inset-y-0 left-[45%] z-10 bg-gradient-to-r from-white to-transparent w-full md:w-[25%] hidden md:block"></div>
        <div className="absolute inset-y-0 left-0 z-10 bg-gradient-to-r from-white via-white/90 to-transparent w-full block md:hidden"></div>

        {/* Content */}
        <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-center pl-4 md:pl-12 lg:pl-24">
          <div className="py-12 flex flex-col justify-center max-w-xl">
            <span className="text-[var(--color-rplay-green)] font-bold tracking-widest text-xs mb-3 uppercase">R-Play Sharjapur</span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 text-[#111827]">
              CLASSIC INDIAN CRICKET<br/>
              <span className="text-[var(--color-rplay-green)]">ACADEMY & TURF</span>
            </h1>
            <p className="text-gray-600 text-base mb-8 max-w-md">
              Train. Practice. Play. Elevate your game at Classic Indian Cricket Academy & Turf — Sharjapur's premier cricket destination under R-Play.
            </p>
            <div className="flex gap-4">
              <button className="bg-[var(--color-rplay-green)] text-white px-8 py-3 rounded text-sm font-bold tracking-wider hover:bg-opacity-90 flex items-center shadow-md">
                <Users size={18} className="mr-2" /> ENROLL NOW
              </button>
              <button className="bg-white text-[var(--color-rplay-green)] border-2 border-[var(--color-rplay-green)] px-8 py-3 rounded text-sm font-bold tracking-wider hover:bg-gray-50 flex items-center shadow-md">
                <CalendarDays size={18} className="mr-2" /> BOOK TURF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <motion.section {...fadeInUp} className="bg-white py-8 border-y border-gray-100 relative -mt-8 z-30 mx-6 md:mx-12 rounded-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-gray-100">
          <div className="flex items-center gap-4 px-2">
            <div className="text-[var(--color-rplay-green)]"><Building2 size={28} /></div>
            <div>
              <h4 className="font-bold text-xs tracking-wide mb-1 text-gray-900">PREMIUM TURF</h4>
              <p className="text-[10px] text-gray-500 leading-tight">High quality turfs for match & practice</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><Users size={28} /></div>
            <div>
              <h4 className="font-bold text-xs tracking-wide mb-1 text-gray-900">EXPERT COACHES</h4>
              <p className="text-[10px] text-gray-500 leading-tight">Experienced & certified coaching staff</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><TrendingUp size={28} /></div>
            <div>
              <h4 className="font-bold text-xs tracking-wide mb-1 text-gray-900">MATCH PRACTICE</h4>
              <p className="text-[10px] text-gray-500 leading-tight">Real match scenarios & game exposure</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><SunMedium size={28} /></div>
            <div>
              <h4 className="font-bold text-xs tracking-wide mb-1 text-gray-900">FLOODLIGHTS</h4>
              <p className="text-[10px] text-gray-500 leading-tight">Day & night facility</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="text-[var(--color-rplay-green)]"><CloudRain size={28} /></div>
            <div>
              <h4 className="font-bold text-xs tracking-wide mb-1 text-gray-900">ALL WEATHER</h4>
              <p className="text-[10px] text-gray-500 leading-tight">Train all year round</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col gap-16">
        
        {/* Coaches Section */}
        <motion.section {...fadeInUp}>
          <div className="flex flex-col mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-wide uppercase">OUR COACHES</h2>
            <div className="w-12 h-1 bg-[var(--color-rplay-green)] mt-2"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Coach 1 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-row">
               <div className="w-2/5 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop" alt="Sachin Kumar" className="w-full h-full object-cover" />
               </div>
               <div className="w-3/5 p-4 flex flex-col justify-center">
                 <h3 className="font-bold text-sm text-gray-900">SACHIN KUMAR</h3>
                 <p className="text-[var(--color-rplay-green)] text-xs font-semibold mb-3">Head Coach</p>
                 <ul className="text-[10px] text-gray-600 space-y-1">
                   <li className="flex items-start"><span className="mr-1">•</span> BCCI Level 2 Certified</li>
                   <li className="flex items-start"><span className="mr-1">•</span> 15+ Years Experience</li>
                   <li className="flex items-start mt-2 font-medium">Specialization:</li>
                   <li className="flex items-start text-gray-500">Batting & Game Strategy</li>
                 </ul>
               </div>
            </div>
            {/* Coach 2 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-row">
               <div className="w-2/5 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop" alt="Rahul Sharma" className="w-full h-full object-cover" />
               </div>
               <div className="w-3/5 p-4 flex flex-col justify-center">
                 <h3 className="font-bold text-sm text-gray-900">RAHUL SHARMA</h3>
                 <p className="text-[var(--color-rplay-green)] text-xs font-semibold mb-3">Batting Coach</p>
                 <ul className="text-[10px] text-gray-600 space-y-1">
                   <li className="flex items-start"><span className="mr-1">•</span> BCCI Level 1 Certified</li>
                   <li className="flex items-start"><span className="mr-1">•</span> 10+ Years Experience</li>
                   <li className="flex items-start mt-2 font-medium">Specialization:</li>
                   <li className="flex items-start text-gray-500">Batting Technique</li>
                 </ul>
               </div>
            </div>
            {/* Coach 3 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-row">
               <div className="w-2/5 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop" alt="Vikram Rathod" className="w-full h-full object-cover" />
               </div>
               <div className="w-3/5 p-4 flex flex-col justify-center">
                 <h3 className="font-bold text-sm text-gray-900">VIKRAM RATHOD</h3>
                 <p className="text-[var(--color-rplay-green)] text-xs font-semibold mb-3">Bowling Coach</p>
                 <ul className="text-[10px] text-gray-600 space-y-1">
                   <li className="flex items-start"><span className="mr-1">•</span> BCCI Level 2 Certified</li>
                   <li className="flex items-start"><span className="mr-1">•</span> 12+ Years Experience</li>
                   <li className="flex items-start mt-2 font-medium">Specialization:</li>
                   <li className="flex items-start text-gray-500">Fast Bowling</li>
                 </ul>
               </div>
            </div>
            {/* Coach 4 */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-row">
               <div className="w-2/5 bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop" alt="Karthik N" className="w-full h-full object-cover" />
               </div>
               <div className="w-3/5 p-4 flex flex-col justify-center">
                 <h3 className="font-bold text-sm text-gray-900">KARTHIK N</h3>
                 <p className="text-[var(--color-rplay-green)] text-xs font-semibold mb-3">Fielding Coach</p>
                 <ul className="text-[10px] text-gray-600 space-y-1">
                   <li className="flex items-start"><span className="mr-1">•</span> BCCI Level 1 Certified</li>
                   <li className="flex items-start"><span className="mr-1">•</span> 8+ Years Experience</li>
                   <li className="flex items-start mt-2 font-medium">Specialization:</li>
                   <li className="flex items-start text-gray-500">Fielding & Fitness</li>
                 </ul>
               </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button className="border-2 border-[var(--color-rplay-green)] text-[var(--color-rplay-green)] px-6 py-2 rounded text-xs font-bold tracking-wider hover:bg-[var(--color-rplay-green)] hover:text-white transition-colors">
              VIEW ALL COACHES
            </button>
          </div>
        </motion.section>

        {/* Programs and Booking Section Grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Academy Programs */}
          <motion.section {...fadeInUp} className="lg:col-span-3">
            <div className="flex flex-col mb-6">
              <h2 className="text-lg font-black text-gray-900 tracking-wide uppercase">ACADEMY PROGRAMS</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Program 1 */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 text-[var(--color-rplay-green)] mb-3">
                   <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="4" r="2"/><path d="M17 7h-6.5c-.8 0-1.5.5-1.8 1.2l-2.2 4.4c-.3.6-.1 1.3.5 1.6l.8.4c.6.3 1.3.1 1.6-.5l1.6-3.2v4.6l-3.2 3.2c-.4.4-.4 1 0 1.4l.6.6c.4.4 1 .4 1.4 0l3.2-3.2V22c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-6.5l1.5-2 1 2c.2.4.6.6 1 .5l.8-.2c.5-.1.8-.7.6-1.2l-2.2-4.4c-.3-.6-.9-1-1.6-1Z"/></svg>
                </div>
                <h3 className="font-bold text-xs text-gray-900 mb-2">FOUNDATION</h3>
                <p className="text-[10px] text-gray-500 mb-4 flex-grow">For beginners<br/>(Ages 6-11)</p>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2 rounded text-[10px] font-bold tracking-wider hover:bg-opacity-90 mt-auto">
                  LEARN MORE
                </button>
              </div>
              {/* Program 2 */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 text-[var(--color-rplay-green)] mb-3">
                   <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 13.5L3.5 17c-.5.5-.5 1.3 0 1.8l.5.5c.5.5 1.3.5 1.8 0l3.5-3.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="5" r="2"/><path d="M11 22v-4l-2-2-1.5 1.5M16.5 14.5L14 12V8l-2 1-1-2"/></svg>
                </div>
                <h3 className="font-bold text-xs text-gray-900 mb-2">DEVELOPMENT</h3>
                <p className="text-[10px] text-gray-500 mb-4 flex-grow">For intermediate players (Ages 12-16)</p>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2 rounded text-[10px] font-bold tracking-wider hover:bg-opacity-90 mt-auto">
                  LEARN MORE
                </button>
              </div>
              {/* Program 3 */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 text-[var(--color-rplay-green)] mb-3">
                   <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="4" r="2"/><path d="M12 9l3-2 1.5 2.5-3.5 3-1 4 2 5.5"/><path d="M8 22l1.5-6-3.5-3v-4l3-2"/></svg>
                </div>
                <h3 className="font-bold text-xs text-gray-900 mb-2">ELITE</h3>
                <p className="text-[10px] text-gray-500 mb-4 flex-grow">For advanced players (Ages 16+)</p>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2 rounded text-[10px] font-bold tracking-wider hover:bg-opacity-90 mt-auto">
                  LEARN MORE
                </button>
              </div>
              {/* Program 4 */}
              <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 text-[var(--color-rplay-green)] mb-3">
                   <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 10h20M5 10V6M19 10V6M8 10v4M16 10v4M12 22v-4M9 18h6"/></svg>
                </div>
                <h3 className="font-bold text-xs text-gray-900 mb-2">HIGH PERFORMANCE</h3>
                <p className="text-[10px] text-gray-500 mb-4 flex-grow">Special program for serious cricketers</p>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2 rounded text-[10px] font-bold tracking-wider hover:bg-opacity-90 mt-auto">
                  LEARN MORE
                </button>
              </div>
            </div>
          </motion.section>

          {/* Turf Booking */}
          <motion.section {...fadeInUp} className="lg:col-span-2">
            <div className="flex flex-col mb-6">
              <h2 className="text-lg font-black text-gray-900 tracking-wide uppercase">TURF BOOKING</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
              {/* Practice Turf */}
              <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                <h3 className="font-bold text-xs text-gray-900 mb-2 uppercase">PRACTICE TURF</h3>
                <p className="text-[10px] text-gray-500 mb-4 h-8">Ideal for net practice, coaching & sessions</p>
                <div className="mt-auto mb-4">
                  <span className="text-2xl font-black text-[var(--color-rplay-green)]">₹900</span>
                  <span className="text-[10px] text-gray-500 font-bold"> / Hour</span>
                </div>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2.5 rounded text-xs font-bold tracking-wider hover:bg-opacity-90">
                  BOOK NOW
                </button>
              </div>
              
              {/* Match Turf */}
              <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                <h3 className="font-bold text-xs text-gray-900 mb-2 uppercase">MATCH TURF</h3>
                <p className="text-[10px] text-gray-500 mb-4 h-8">Ideal for matches & tournaments</p>
                <div className="mt-auto mb-4">
                  <span className="text-2xl font-black text-[var(--color-rplay-green)]">₹1600</span>
                  <span className="text-[10px] text-gray-500 font-bold"> / Hour</span>
                </div>
                <button className="bg-[var(--color-rplay-green)] text-white w-full py-2.5 rounded text-xs font-bold tracking-wider hover:bg-opacity-90">
                  BOOK NOW
                </button>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Gallery and Location Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Gallery */}
          <motion.section {...fadeInUp}>
            <div className="flex flex-col mb-4">
              <h2 className="text-sm font-black text-gray-900 tracking-wide uppercase">GALLERY</h2>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
               <div className="grid grid-cols-3 gap-2 mb-4">
                 <div className="aspect-[4/3] rounded overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1589304028080-692abce159a4?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                 </div>
                 <div className="aspect-[4/3] rounded overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                 </div>
                 <div className="aspect-[4/3] rounded overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                 </div>
               </div>
               <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-xs font-bold tracking-wider hover:bg-gray-50 transition-colors w-1/3">
                 VIEW GALLERY
               </button>
            </div>
          </motion.section>

          {/* Location */}
          <motion.section {...fadeInUp}>
            <div className="flex flex-col mb-4">
              <h2 className="text-sm font-black text-gray-900 tracking-wide uppercase">LOCATION</h2>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 h-[calc(100%-2rem)]">
              <div className="w-full sm:w-1/2 rounded overflow-hidden relative min-h-[150px]">
                 <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" className="w-full h-full object-cover absolute inset-0" />
                 <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex justify-center items-center">
                    <MapPin className="text-red-600 drop-shadow-md" size={32} />
                 </div>
                 <span className="absolute bottom-1 right-2 text-[8px] text-[var(--color-rplay-green)] font-bold drop-shadow-md">Google Maps Link</span>
              </div>
              <div className="w-full sm:w-1/2 flex flex-col justify-center">
                 <h3 className="font-bold text-sm text-gray-900 mb-2">Classic Indian Cricket<br/>Academy & Turf</h3>
                 <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
                   Sarjapura - Marathahalli Rd,<br/>
                   Sharjapur, Bengaluru,<br/>
                   Karnataka 562125
                 </p>
                 <button className="border border-gray-300 text-[var(--color-rplay-green)] flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-bold tracking-wider hover:bg-gray-50 transition-colors">
                   <MapPin size={14} /> DIRECTIONS
                 </button>
              </div>
            </div>
          </motion.section>

        </div>
      </div>

      {/* Bottom CTA */}
      <motion.section {...fadeInUp} className="bg-[#eef5eb] py-8 border-y border-[#d6eed0]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[var(--color-rplay-green)] shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">READY TO ELEVATE YOUR GAME?</h2>
              <p className="text-xs text-gray-600">Join Classic Indian Cricket Academy & Turf today!</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-[var(--color-rplay-green)] text-white px-8 py-3 rounded text-sm font-bold tracking-wider hover:bg-opacity-90 shadow-md">
              ENROLL NOW
            </button>
            <button className="bg-[#4caf50] text-white px-6 py-3 rounded text-sm font-bold tracking-wider hover:bg-opacity-90 flex items-center shadow-md">
               <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" className="mr-2"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.296-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> 
               +91 98765 43210
            </button>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Sharjapur;
