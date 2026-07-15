'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface CoachingStep {
  label: string;
  sublabel: string;
  description: string;
  // bat angle in radians, 0 = upright
  batAngle: number;
  // bat lift as fraction of full arc (0=resting, 1=full backswing)
  batLift: number;
  // accent color shade index
  colorIndex: number;
}

const coachingSteps: CoachingStep[] = [
  {
    label: 'BEGINNER',
    sublabel: 'Foundation',
    description:
      'Mastering fundamental skills, basic rules, and building confidence in core techniques.',
    batAngle: 0.05,   // almost perfectly upright — at rest, learning grip & stance
    batLift: 0.05,
    colorIndex: 0,
  },
  {
    label: 'INTERMEDIATE',
    sublabel: 'Skill Refinement',
    description:
      'Skill refinement, game strategies, and physical conditioning for competitive play.',
    batAngle: 0.55,   // bat raised to ~45° — mid-backswing, technique developing
    batLift: 0.5,
    colorIndex: 1,
  },
  {
    label: 'ADVANCED',
    sublabel: 'Elite Performance',
    description:
      'Specialize in specific roles, mental resilience, and advanced tactics for high-level performance.',
    batAngle: 1.15,   // full backswing — power drive loaded
    batLift: 1.0,
    colorIndex: 2,
  },
  {
    label: 'ONE-ON-ONE',
    sublabel: 'Personalised',
    description:
      'Tailored sessions to target individual strengths, address weaknesses, and enhance game intelligence.',
    batAngle: 0.3,    // precise defensive guard angle — controlled, purposeful
    batLift: 0.3,
    colorIndex: 3,
  },
];

// Brand-consistent gradient steps
const gradientPairs = [
  ['#0B0F1E', '#184fe7ff'],  // dark → brand blue (beginner)
  ['#111827', '#163ec3ff'],  // dark → mid blue (intermediate)
  ['#0f172a', '#1d4ed8'],  // darker → strong blue (advanced)
  ['#0B0F1E', '#1848ccff'],  // back to brand (one-on-one)
];

export const ScrollStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(`${coachingSteps.length * 150}vh`);

  // Use shorter scroll height on mobile devices
  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768;
      setSectionHeight(`${coachingSteps.length * (isMobile ? 90 : 150)}vh`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.001,
  });

  const stepProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, coachingSteps.length - 1]
  );

  useEffect(() => {
    const unsubscribe = stepProgress.on('change', (v) => {
      const step = Math.max(0, Math.min(Math.floor(v + 0.15), coachingSteps.length - 1));
      setCurrentStep(step);
    });
    return unsubscribe;
  }, [stepProgress]);

  // Canvas animation — bat angle interpolates per coaching level
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, springProgress.get())); // 0→1

      // Which step are we between?
      const scaled = p * (coachingSteps.length - 1);
      const idx = Math.min(Math.floor(scaled), coachingSteps.length - 2);
      const next = Math.min(idx + 1, coachingSteps.length - 1);
      const t = scaled - idx;

      const stepA = coachingSteps[idx];
      const stepB = coachingSteps[next];

      // Clear canvas — transparent, page bg shows through
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // ── Cricket Ball (Pitched and Hit) ──
      const hitP = 0.73;
      let ballX = cx;
      let ballY = cy + 20;

      const throwDistance = Math.max(rect.width * 0.6, 600);

      if (p < hitP) {
        // Ball pitched from the right
        const approachP = p / hitP; // 0 to 1
        ballX = cx + throwDistance * (1 - approachP);

        const bounceP = 0.6;
        if (approachP < bounceP) {
          const t = approachP / bounceP;
          const startY = cy - 50;
          const groundY = cy + 150;
          ballY = startY + (groundY - startY) * t * t;
        } else {
          const t = (approachP - bounceP) / (1 - bounceP);
          const groundY = cy + 150;
          const batY = cy + 20;
          ballY = groundY - (groundY - batY) * t;
          ballY -= t * (1 - t) * 50;
        }
      } else {
        // Hit!
        const flyP = (p - hitP) / (1 - hitP); // 0 to 1
        ballX = cx + flyP * throwDistance * 1.5;
        const startY = cy + 20;
        ballY = startY - flyP * 800 + flyP * flyP * 400;
      }

      const ballRadius = 6 + p * 2;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = `#dc2626`; // Red cricket ball
      ctx.fill();

      // Seam and stitches
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate(p * Math.PI * 10);
      ctx.beginPath();
      ctx.moveTo(0, -ballRadius);
      ctx.lineTo(0, ballRadius);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2, -ballRadius * 0.5); ctx.lineTo(2, -ballRadius * 0.5);
      ctx.moveTo(-2, 0); ctx.lineTo(2, 0);
      ctx.moveTo(-2, ballRadius * 0.5); ctx.lineTo(2, ballRadius * 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── Cricket bat — full rotation + grows with scroll ──
      const batScale = 0.55 + p * 0.75;        // grows from 0.55× to 1.3×
      const batRotation = p * Math.PI * 2;      // 0 → full 360°

      ctx.save();
      ctx.translate(cx, cy + 20);
      ctx.rotate(batRotation);
      ctx.scale(batScale, batScale);

      const alpha = 0.7 + p * 0.3;

      // Handle
      ctx.fillStyle = `rgba(180, 140, 100, ${alpha})`;
      ctx.beginPath();
      ctx.roundRect(-5, -145, 10, 65, 3);
      ctx.fill();

      // Grip wrap lines
      ctx.strokeStyle = `rgba(27, 58, 140, ${alpha * 0.5})`;
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 5; g++) {
        const gy = -140 + g * 12;
        ctx.beginPath();
        ctx.moveTo(-5, gy);
        ctx.lineTo(5, gy);
        ctx.stroke();
      }

      // Shoulder (taper)
      ctx.fillStyle = `rgba(200, 160, 110, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(-5, -80);
      ctx.lineTo(-24, -65);
      ctx.lineTo(24, -65);
      ctx.lineTo(5, -80);
      ctx.closePath();
      ctx.fill();

      // Blade
      ctx.fillStyle = `rgba(220, 180, 130, ${alpha})`;
      ctx.beginPath();
      ctx.roundRect(-26, -65, 52, 130, [0, 0, 8, 8]);
      ctx.fill();

      // Centre ridge
      ctx.strokeStyle = `rgba(180, 140, 90, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, 60);
      ctx.stroke();

      // Edge highlight
      ctx.strokeStyle = `rgba(27, 58, 140, ${alpha * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-26, -65, 52, 130);

      ctx.restore();

      frameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [springProgress]);

  return (
    <section
      id="journey"
      ref={containerRef}
      className="relative w-full bg-[#1B3A8C]"
      style={{ height: sectionHeight }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between px-6 sm:px-10 md:px-16 lg:px-24 pt-24 pb-10 md:pt-32 md:pb-16">

          {/* Top label */}
          <div className="text-center w-full">
            <motion.p
              initial={{ opacity: 0, y: -16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-white/70 font-bold"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              Coaching Module
            </motion.p>
          </div>

          {/* Centre content — swaps per step */}
          <div className="flex-1 flex items-center justify-start">
            {coachingSteps.map((step, index) => (
              <motion.div
                key={index}
                className="absolute max-w-xl px-4 left-4 sm:left-auto"
                initial={{ opacity: 0, y: 18 }}
                animate={{
                  opacity: currentStep === index ? 1 : 0,
                  y: currentStep === index ? 0 : 18,
                  pointerEvents: currentStep === index ? 'auto' : 'none',
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Step label */}
                <p
                  className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white/70 font-bold mb-3"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  {step.sublabel}
                </p>

                {/* Level heading */}
                <h2
                  className="font-bold uppercase text-white leading-none mb-4"
                  style={{
                    fontFamily: '"League Gothic", sans-serif',
                    fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                    letterSpacing: '-0.01em',
                    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {step.label}
                </h2>

                {/* Accent line */}
                <motion.div
                  className="h-[2px] bg-gradient-to-r from-white/60 to-transparent mb-5"
                  initial={{ width: 0 }}
                  animate={{ width: currentStep === index ? '4rem' : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />

                {/* Description */}
                <p
                  className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-sm"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
};

export default ScrollStory;
