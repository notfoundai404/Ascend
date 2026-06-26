import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  stacked?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconSize = 32, stacked = false, variant = 'dark' }) => {
  const textColor = variant === 'dark' ? 'text-white' : 'text-black';
  
  return (
    <div className={`flex ${stacked ? 'flex-col items-center gap-2' : 'items-center gap-3'} select-none ${className}`}>
      <img 
        src="/Logo.png" 
        alt="R-Play Sports Academy" 
        className="object-contain hover:scale-105 transition-transform duration-300"
        style={{ height: `${iconSize * 1.25}px` }}
      />
      <div className={`flex flex-col justify-center leading-none ${stacked ? 'items-center text-center' : ''}`}>
        <span className={`font-display text-2xl md:text-3xl tracking-wider ${textColor} font-bold`} style={{ fontFamily: '"League Gothic", sans-serif' }}>
          R-PLAY
        </span>
        <span className="font-sans text-[9px] md:text-[10px] uppercase font-bold tracking-[0.18em] text-[var(--color-rplay-green)] mt-1">
          sports academy
        </span>
      </div>
    </div>
  );
};

export default Logo;
