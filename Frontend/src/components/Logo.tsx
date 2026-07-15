'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  variant?: 'dark' | 'light';
  singleLine?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconSize = 32, variant = 'dark', singleLine = false }) => {
  const headingColor = variant === 'dark' ? 'text-white' : 'text-[var(--color-rplay-green)]';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/AscendLogo.webp"
        alt="Ascend Cricket Academy"
        className="object-contain flex-shrink-0 hover:scale-105 transition-transform duration-300"
        style={{ height: `${iconSize * 1.8}px`, width: 'auto' }}
      />
      <div
        className="flex flex-col justify-center"
        style={{ gap: '3px' }}
      >
        <span
          className={`${headingColor} font-black uppercase block whitespace-nowrap`}
          style={{
            fontFamily: '"League Gothic", sans-serif',
            fontSize: `${iconSize * 1.1}px`,
            lineHeight: 1,
            letterSpacing: '0.06em',
            textShadow: variant === 'dark' ? '0 0 20px rgba(255,255,255,0.15)' : 'none',
          }}
        >
          {singleLine ? 'ASCEND CRICKET ACADEMY' : 'ASCEND'}
        </span>
        {!singleLine && (
          <>
            <span
              className="block w-full bg-[var(--color-rplay-green)]"
              style={{ height: '3px' }}
            />
            <span
              className="text-[var(--color-rplay-green)] font-black uppercase block whitespace-nowrap"
              style={{
                fontFamily: '"League Gothic", sans-serif',
                fontSize: `${iconSize * 0.65}px`,
                lineHeight: 1,
                letterSpacing: '0.12em',
              }}
            >
              CRICKET ACADEMY
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Logo;
