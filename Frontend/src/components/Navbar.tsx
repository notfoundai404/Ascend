import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-black border-b border-white/5 h-20 flex items-center`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" onClick={(e) => handleLinkClick(e, 'home')}>
            <Logo iconSize={36} />
          </a>

          {/* Center Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 font-sans text-sm font-semibold tracking-wider text-white">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, 'home')}
              className="text-[var(--color-rplay-green)] hover:text-[var(--color-rplay-green)] transition-colors duration-200"
            >
              HOME
            </a>
            <a
              href="#about"
              onClick={(e) => handleLinkClick(e, 'about')}
              className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
            >
              ABOUT US
            </a>
            <Link
              to="/academy"
              className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
            >
              ACADEMIES
            </Link>
            <a
              href="#facilities"
              onClick={(e) => handleLinkClick(e, 'facilities')}
              className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
            >
              FACILITIES
            </a>
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, 'contact')}
              className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
            >
              CONTACT
            </a>
          </div>

          {/* Right Section - Socials & Button - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-4 text-white/80">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
            <a
              href="#join"
              onClick={(e) => handleLinkClick(e, 'join')}
              className="bg-[var(--color-rplay-green)] text-white font-semibold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-opacity-95 transform active:scale-95 transition-all shadow-[0_0_15px_rgba(94,186,66,0.3)] hover:shadow-[0_0_20px_rgba(94,186,66,0.5)] font-sans"
            >
              ENROLL NOW
            </a>
          </div>

          {/* Hamburger Menu - Mobile/Tablet */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white hover:text-[var(--color-rplay-green)] transition-colors duration-200 p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 transition-all duration-300 lg:hidden flex flex-col justify-center items-center ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6 text-center text-xl font-bold tracking-widest text-white">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            HOME
          </a>
          <a
            href="#about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            ABOUT US
          </a>
          <Link
            to="/academy"
            onClick={() => setIsOpen(false)}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            ACADEMIES
          </Link>
          <a
            href="#facilities"
            onClick={(e) => handleLinkClick(e, 'facilities')}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            FACILITIES
          </a>
          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            CONTACT
          </a>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-white/85">
            <a href="https://facebook.com" className="hover:text-white transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" className="hover:text-white transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://twitter.com" className="hover:text-white transition-colors duration-200">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
          </div>

          <a
            href="#join"
            onClick={(e) => handleLinkClick(e, 'join')}
            className="mt-6 bg-[var(--color-rplay-green)] text-white font-bold text-sm tracking-widest px-8 py-3 rounded hover:bg-opacity-95 font-sans"
          >
            ENROLL NOW
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
