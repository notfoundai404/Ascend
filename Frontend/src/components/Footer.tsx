import React from 'react';
import Logo from './Logo';
import { ChevronUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="w-full bg-[var(--color-rplay-dark)] text-white select-none">
      {/* Top Footer Bar (Socials + Back to Top) */}
      <div className="bg-[#0b0b0b] border-y border-white/5 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Social Icons */}
          <div className="flex items-center gap-5 text-white/60">
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

          {/* Back to Top */}
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-200 group focus:outline-none"
          >
            BACK TO TOP
            <ChevronUp size={16} className="transform group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Main Footer Block (Logo + Copyright + Links) */}
      <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-6">
        {/* R-Play Logo */}
        <Logo iconSize={40} className="mb-2" stacked={true} />

        {/* Copyright */}
        <p className="text-white/40 text-xs font-sans tracking-wide">
          © 2024 R-Play Sports Academy. All Rights Reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs font-sans text-white/50 tracking-wider">
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span className="text-white/20">|</span>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[var(--color-rplay-green)] transition-colors duration-200"
          >
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
