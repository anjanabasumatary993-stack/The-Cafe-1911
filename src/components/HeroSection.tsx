import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Compass, UtensilsCrossed, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onExploreExperience: () => void;
  onDiscoverMenu: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreExperience,
  onDiscoverMenu,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const heroImagePath = '/src/assets/images/hero_cafe_cinematic_1792906516946.jpg';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0c0b0a] pt-24 pb-12"
    >
      {/* Background Image Container with Cinematic Zoom & Scrims */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {!imageError ? (
          <motion.img
            src={heroImagePath}
            alt="Interior of Cafe 1911 with natural sunlight and walnut millwork"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={imageLoaded ? { scale: 1, opacity: 0.55 } : { opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* Graceful Luxury Fallback */
          <div className="w-full h-full bg-gradient-to-b from-[#1c1815] via-[#14110f] to-[#0c0b0a]" />
        )}

        {/* Multi-layered cinematic scrims to guarantee WCAG AA contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0b0a]/90 via-[#0c0b0a]/40 to-[#0c0b0a]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,11,10,0.6)_100%)]" />
      </div>

      {/* Floating Delicate Editorial Labels */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-6 hidden md:flex items-center justify-between text-[11px] tracking-[0.25em] uppercase text-[#c5a880]/80">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <span className="w-1.5 h-1.5 bg-[#c5a880]/60 rotate-45 inline-block" />
          <span>Authentic Flavours & Mountain Craft</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <span>RCRJ+2MP, Diphu, Assam</span>
          <span className="w-1.5 h-1.5 bg-[#c5a880]/60 rotate-45 inline-block" />
        </motion.div>
      </div>

      {/* Main Center Editorial Content */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 text-center my-auto flex flex-col items-center">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm font-sans uppercase tracking-[0.35em] text-[#c5a880] mb-5"
        >
          The Art of Luxury Hospitality
        </motion.div>

        {/* Primary Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#faf7f2] leading-[1.08] tracking-tight text-balance max-w-4xl"
        >
          Some Moments Deserve to Be Savoured.
        </motion.h1>

        {/* Fine Hairline Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c5a880]/60 to-transparent my-6"
        />

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-sans text-base sm:text-lg md:text-xl text-[#e8e2d5]/85 max-w-2xl font-light leading-relaxed text-balance"
        >
          Exceptional coffee. Thoughtfully crafted flavours. An atmosphere made for slowing down.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <button
            onClick={onExploreExperience}
            className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all duration-300 rounded-none shadow-[0_4px_24px_rgba(197,168,128,0.25)] flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Explore The Experience</span>
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={onDiscoverMenu}
            className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#faf7f2] border border-[#faf7f2]/25 hover:border-[#c5a880] hover:text-[#c5a880] hover:bg-[#c5a880]/5 transition-all duration-300 rounded-none flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Discover Our Menu</span>
            <UtensilsCrossed className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Editorial Bar with Scroll Indicator */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex items-end justify-between">
        {/* Curatorial Heritage Note */}
        <div className="hidden lg:block text-left text-xs text-[#e8e2d5]/60 max-w-xs font-light leading-relaxed">
          <p className="font-serif italic text-sm text-[#c5a880]/90 mb-1">Diphu Culinary Haven</p>
          <p>Handcrafted Momos · Sizzling Chicken Lollipop · Comforting Thukpa & Biryani</p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('menu')}
          className="mx-auto lg:mx-0 flex flex-col items-center gap-2 group cursor-pointer text-[#e8e2d5]/70 hover:text-[#c5a880] transition-colors focus:outline-none"
          aria-label="Scroll to menu"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans">Scroll to Menu</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="p-1 border border-[#c5a880]/30 rounded-full group-hover:border-[#c5a880] transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5 text-[#c5a880]" />
          </motion.div>
        </button>

        {/* Curatorial Operating Times */}
        <div className="hidden lg:block text-right text-xs text-[#e8e2d5]/60 font-light leading-relaxed">
          <p className="font-serif italic text-sm text-[#c5a880]/90 mb-1">Hours of Hospitality</p>
          <p>Monday–Sunday: 9:30 AM – 9:00 PM</p>
        </div>
      </div>
    </section>
  );
};
