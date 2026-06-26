import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const AcademyNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

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

  const links = [
    { name: 'ACADEMY HUB', href: '/academy', active: location.pathname === '/academy' },
    { name: 'SHARJAPUR', href: '/sharjapur', active: location.pathname === '/sharjapur' },
    { name: 'K R PURAM', href: '#krpuram', active: false },
    { name: 'BOOK TURF', href: '#book', active: false },
    { name: 'ELITE PROGRAMS', href: '#elite', active: false },
    { name: 'STUDENT PORTAL', href: '#portal', active: false },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 h-20 flex items-center ${scrolled ? 'shadow-sm' : ''}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <Logo iconSize={36} variant="light" />
          </Link>

          {/* Center Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 font-sans text-[11px] font-bold tracking-widest text-gray-800">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative py-2 hover:text-[var(--color-rplay-green)] transition-colors duration-200 ${
                  link.active ? 'text-black' : ''
                }`}
              >
                {link.name}
                {link.active && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-rplay-green)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section - Button - Desktop */}
          <div className="hidden lg:flex items-center">
            <a
              href="#join"
              className="bg-[var(--color-rplay-green)] text-white font-semibold text-xs tracking-widest px-6 py-2.5 rounded hover:bg-opacity-95 transform active:scale-95 transition-all font-sans"
            >
              JOIN ACADEMY
            </a>
          </div>

          {/* Hamburger Menu - Mobile/Tablet */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-black hover:text-[var(--color-rplay-green)] transition-colors duration-200 p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-300 lg:hidden flex flex-col justify-center items-center ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6 text-center text-xl font-bold tracking-widest text-black">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`hover:text-[var(--color-rplay-green)] transition-colors duration-200 ${
                link.active ? 'text-[var(--color-rplay-green)]' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <a
            href="#join"
            onClick={() => setIsOpen(false)}
            className="mt-6 bg-[var(--color-rplay-green)] text-white font-bold text-sm tracking-widest px-8 py-3 rounded hover:bg-opacity-95 font-sans"
          >
            JOIN ACADEMY
          </a>
        </div>
      </div>
    </>
  );
};

export default AcademyNavbar;
