'use client';

import React from 'react';
import Logo from './Logo';
import { ChevronUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapsUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.8!2d77.6!3d12.84!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6b4a3e3e3e3b%3A0x3e3e3e3e3e3e3e3e!2sSurvey%20No.%20106%2F3%2C%20near%20Allen%20Career%20Institute%2C%20Sree%20Narayana%20Nagar%2C%20Chikkadunnasandra%2C%20Bengaluru%2C%20Karnataka%20562125!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=VQ47%2BWF+Bengaluru,+Karnataka';

  return (
    <footer className="w-full bg-[var(--color-rplay-dark)] text-white select-none border-t border-white/5">
      {/* Main Footer */}
      <div className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">

            {/* ── Column 1: Brand + Contact ── */}
            <div className="flex flex-col gap-6">
              <Logo iconSize={40} />
              <div className="flex flex-col gap-5">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--color-rplay-green)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="text-white/60 text-xs font-sans uppercase tracking-widest mb-1">Location</p>
                    <p className="text-white text-sm font-sans leading-relaxed">
                      Survey No. 106/3, near Allen Career Institute,<br />
                      Sree Narayana Nagar, Chikkadunnasandra,<br />
                      Bengaluru, Karnataka 562125
                    </p>
                    <a
                      href="https://plus.codes/VQ47+WF"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1.5 text-xs text-[var(--color-rplay-green)] hover:underline font-mono tracking-wide"
                    >
                      VQ47+WF Bengaluru
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--color-rplay-green)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <div>
                    <p className="text-white/60 text-xs font-sans uppercase tracking-widest mb-1">Phone</p>
                    <a href="tel:+919902843038" className="text-white text-sm font-sans hover:text-[var(--color-rplay-green)] transition-colors duration-200">099028 43038</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--color-rplay-green)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <div>
                    <p className="text-white/60 text-xs font-sans uppercase tracking-widest mb-1">Email</p>
                    <a href="mailto:info@ascendcricket.com" className="text-white text-sm font-sans hover:text-[var(--color-rplay-green)] transition-colors duration-200">info@ascendcricket.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Column 2: Map ── */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <p className="text-white/60 text-xs font-sans uppercase tracking-widest">Find Us</p>
              <div className="relative w-full overflow-hidden rounded-sm" style={{ height: '260px' }}>
                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-sm ring-1 ring-white/10 z-10 pointer-events-none" />
                <iframe
                  title="Ascend Cricket Academy Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.802!2d77.5978!3d12.8436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6cc91e594c47%3A0x3f3e3e3e3e3e3e3e!2sVQ47%2BWF%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(20%) contrast(1.05) brightness(0.9)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://maps.google.com/?q=VQ47+WF+Bengaluru,+Karnataka"
                target="_blank"
                rel="noreferrer"
                className="self-start flex items-center gap-1.5 text-xs text-white/50 hover:text-[var(--color-rplay-green)] transition-colors duration-200 font-sans"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs font-sans tracking-wide">
              © 2026 Ascend Cricket Academy. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              {/* Socials */}
              <div className="flex items-center gap-4 text-white/50">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
              </div>
              {/* Back to top */}
              <button
                onClick={handleScrollToTop}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-200 group focus:outline-none"
              >
                <ChevronUp size={16} className="transform group-hover:-translate-y-0.5 transition-transform duration-200" />
                Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
