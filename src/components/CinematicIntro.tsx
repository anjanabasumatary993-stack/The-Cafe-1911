import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  isReplay?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, isReplay = false }) => {
  const [step, setStep] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !isReplay) {
      setPrefersReducedMotion(true);
      onComplete();
      return;
    }

    // Sequence timing
    // Step 0: near-black, warm glow appears
    // Step 1: delicate gold line expands (at 600ms)
    // Step 2: "1911" revealed (at 1400ms)
    // Step 3: "CAFE" animates into position (at 2300ms)
    // Step 4: Tagline "AN ART OF SLOW LIVING" fades in with tracking (at 3200ms)
    // Step 5: Smooth exit transition (at 4400ms)
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1400);
    const t3 = setTimeout(() => setStep(3), 2300);
    const t4 = setTimeout(() => setStep(4), 3200);
    const t5 = setTimeout(() => {
      setStep(5);
      setTimeout(onComplete, 900);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete, isReplay]);

  if (prefersReducedMotion && !isReplay) {
    return null;
  }

  return (
    <AnimatePresence>
      {step < 5 && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0b0a] overflow-hidden select-none"
        >
          {/* Top-Right Quick Close */}
          <button
            onClick={onComplete}
            className="absolute top-6 right-6 p-2 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer z-20"
            aria-label="Close prologue"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Subtle Warm Atmospheric Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1.2 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="absolute pointer-events-none w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.25)_0%,rgba(45,36,30,0.15)_45%,transparent_70%)] blur-3xl"
          />

          {/* Delicate Gold Line */}
          <div className="relative w-48 h-[1px] mb-8 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={step >= 1 ? { scaleX: 1, opacity: 0.8 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#c5a880] to-transparent origin-center"
            />
          </div>

          {/* Center Brand Monogram & Lockup */}
          <div className="relative flex flex-col items-center text-center px-4">
            {/* "1911" Cinematic Typography */}
            <div className="overflow-hidden py-1">
              <motion.div
                initial={{ y: 50, opacity: 0, letterSpacing: '0.3em' }}
                animate={
                  step >= 2
                    ? { y: 0, opacity: 1, letterSpacing: '0.18em' }
                    : { y: 50, opacity: 0, letterSpacing: '0.3em' }
                }
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-light text-[#faf7f2] tracking-widest drop-shadow-[0_4px_24px_rgba(197,168,128,0.15)]"
              >
                1911
              </motion.div>
            </div>

            {/* "CAFE" Animate into Position */}
            <div className="overflow-hidden mt-1">
              <motion.div
                initial={{ y: -30, opacity: 0, letterSpacing: '0.6em' }}
                animate={
                  step >= 3
                    ? { y: 0, opacity: 0.9, letterSpacing: '0.45em' }
                    : { y: -30, opacity: 0, letterSpacing: '0.6em' }
                }
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-base font-sans font-medium uppercase text-[#c5a880]"
              >
                C A F E
              </motion.div>
            </div>

            {/* Tagline Reveal: AN ART OF SLOW LIVING */}
            <div className="overflow-hidden mt-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={
                  step >= 4
                    ? { opacity: 0.75, y: 0 }
                    : { opacity: 0, y: 15 }
                }
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.35em] text-[#e8e2d5]"
              >
                An Art of Slow Living
              </motion.div>
            </div>
          </div>

          {/* Delicate Bottom Divider */}
          <div className="relative w-24 h-[1px] mt-10 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={step >= 3 ? { scaleX: 1, opacity: 0.5 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#c5a880] to-transparent"
            />
          </div>

          {/* Skip Intro Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1, scale: 1.02 }}
            onClick={onComplete}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest text-[#faf7f2]/70 border border-[#faf7f2]/15 hover:border-[#c5a880]/50 hover:text-[#faf7f2] transition-colors rounded-none bg-[#14110f]/60 backdrop-blur-sm cursor-pointer"
            aria-label="Skip cinematic introduction"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
