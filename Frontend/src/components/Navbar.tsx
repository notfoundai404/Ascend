'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'HOME', id: 'home' },
  { label: 'ABOUT', id: 'about' },
  { label: 'COACHING', id: 'journey' },
  { label: 'NEWS', id: 'academies' },
  { label: 'CONTACT', id: 'join' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      const navbarHeight = 80; // 5rem = 80px
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-gray-200 h-20 flex items-center ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" onClick={(e) => handleLinkClick(e, 'home')}>
            <Logo iconSize={36} variant="light" singleLine />
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 font-sans text-sm font-semibold tracking-wider text-gray-800">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className="relative py-1 transition-colors duration-200 group"
              >
                <span className={activeSection === link.id ? 'text-[var(--color-rplay-green)]' : 'hover:text-[var(--color-rplay-green)]'}>
                  {link.label}
                </span>
                {/* Active underline indicator */}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[var(--color-rplay-green)] transition-all duration-300 ${
                    activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            ))}
          </div>

          {/* Right Section - Socials & Button - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-500">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors duration-200">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/ascend_sg2026/" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors duration-200">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors duration-200">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
            <a
              href="/login"
              className="bg-[var(--color-rplay-green)] text-white font-semibold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-opacity-95 transform active:scale-95 transition-all shadow-[0_0_15px_rgba(27,58,140,0.4)] hover:shadow-[0_0_20px_rgba(27,58,140,0.6)] font-sans"
            >
              LOGIN
            </a>
          </div>

          {/* Hamburger Menu - Mobile/Tablet */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-800 hover:text-[var(--color-rplay-green)] transition-colors duration-200 p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-rplay-green)] origin-left"
          style={{ scaleX: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-300 lg:hidden flex flex-col justify-center items-center ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6 text-center text-xl font-bold tracking-widest text-gray-800">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              className={`transition-colors duration-200 ${activeSection === link.id ? 'text-[var(--color-rplay-green)]' : 'hover:text-[var(--color-rplay-green)]'}`}
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center justify-center gap-6 mt-8 text-gray-500">
            <a href="https://facebook.com" className="hover:text-gray-900 transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/ascend_sg2026/" className="hover:text-gray-900 transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://twitter.com" className="hover:text-gray-900 transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
          </div>

          <a
            href="/login"
            className="mt-6 bg-[var(--color-rplay-green)] text-white font-bold text-sm tracking-widest px-8 py-3 rounded hover:bg-opacity-95 font-sans"
          >
            LOGIN
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
