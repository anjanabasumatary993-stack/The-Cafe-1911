import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GALLERY_ITEMS } from '../data/cafeData';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const items = Array.isArray(GALLERY_ITEMS) ? GALLERY_ITEMS : [];

  const openLightbox = (index: number) => {
    if (index >= 0 && index < items.length) {
      setSelectedItemIndex(index);
    }
  };

  const closeLightbox = useCallback(() => {
    setSelectedItemIndex(null);
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex !== null && items.length > 0) {
      setSelectedItemIndex((selectedItemIndex - 1 + items.length) % items.length);
    }
  }, [selectedItemIndex, items.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex !== null && items.length > 0) {
      setSelectedItemIndex((selectedItemIndex + 1) % items.length);
    }
  }, [selectedItemIndex, items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, closeLightbox, handlePrev, handleNext]);

  if (items.length === 0) {
    return null;
  }

  const currentItem = selectedItemIndex !== null && selectedItemIndex < items.length ? items[selectedItemIndex] : null;

  return (
    <section id="gallery" className="relative py-28 sm:py-36 bg-[#0c0b0a] overflow-hidden border-t border-[#2d241e]/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[#2d241e]">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#c5a880] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Visual Anthology</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#faf7f2] font-normal tracking-tight">
              Atmosphere & Culinary Gallery
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#e8e2d5]/60 max-w-sm font-light">
            A curated visual glimpse into CAFE 1911 in Diphu — from sizzling appetizers to serene, welcoming spaces.
          </p>
        </div>

        {/* Dynamic Responsive Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const isFeatured = index === 0 || index === 1;
            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden bg-[#14110f] border border-[#2d241e] hover:border-[#c5a880]/60 transition-all duration-500 cursor-pointer ${
                  isFeatured ? 'sm:col-span-2 lg:col-span-2 aspect-[16/10]' : 'aspect-[4/3] sm:aspect-[4/5]'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a]/90 via-[#0c0b0a]/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-1">
                      {item.category} {item.subtitle ? `· ${item.subtitle}` : ''}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl text-[#faf7f2] font-normal leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-[#faf7f2]/20 flex items-center justify-center text-[#faf7f2] group-hover:border-[#c5a880] group-hover:text-[#c5a880] transition-colors shrink-0 bg-[#0c0b0a]/60">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedItemIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-[#0c0b0a]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Top Lightbox Bar */}
            <div className="flex items-center justify-between text-xs text-[#e8e2d5]/70" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.25em] text-[#c5a880] font-sans font-medium">
                  {currentItem.category}
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums text-[#faf7f2]/80">
                  {selectedItemIndex + 1} / {items.length}
                </span>
              </div>

              <button
                onClick={closeLightbox}
                className="p-2 border border-[#2d241e] hover:border-[#c5a880] text-[#faf7f2] hover:text-[#c5a880] transition-colors rounded-none cursor-pointer"
                aria-label="Close image viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Image Container */}
            <div
              className="relative max-w-5xl mx-auto my-auto flex items-center justify-center w-full max-h-[75vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentItem.image}
                alt={currentItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] max-w-full object-contain border border-[#2d241e] shadow-2xl"
              />

              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-3 bg-[#0c0b0a]/80 border border-[#2d241e] text-[#faf7f2] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors cursor-pointer"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-3 bg-[#0c0b0a]/80 border border-[#2d241e] text-[#faf7f2] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors cursor-pointer"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Details Caption */}
            <div
              className="max-w-2xl mx-auto text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-serif text-xl sm:text-2xl text-[#faf7f2] font-normal mb-1">
                {currentItem.title}
              </h4>
              {currentItem.details && (
                <p className="font-sans text-xs sm:text-sm text-[#e8e2d5]/75 font-light">
                  {currentItem.details}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
