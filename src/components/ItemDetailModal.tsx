import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { X, Coffee, Sparkles, Compass, Check } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  currencySymbol: string;
  onClose: () => void;
  onReserveForThis: (itemName: string) => void;
  onAddToCart?: (item: MenuItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  currencySymbol,
  onClose,
  onReserveForThis,
  onAddToCart,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0c0b0a]/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#14110f] border border-[#2d241e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#2d241e] bg-[#0c0b0a]/60">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#c5a880]">
              <span>Tasting Dossier</span>
              {item.isSignature && (
                <>
                  <span>·</span>
                  <span className="text-[#faf7f2]/70">House Signature</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto p-8 space-y-6">
            {/* Optional Item Image */}
            {item.image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#2d241e] bg-[#0c0b0a]">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-3xl sm:text-4xl text-[#faf7f2] font-normal">
                {item.name}
              </h3>
              <span className="font-serif text-2xl text-[#c5a880] tabular-nums font-normal shrink-0">
                {currencySymbol}{item.price.toFixed(2)}
              </span>
            </div>

            {item.origin && (
              <div className="text-xs uppercase tracking-[0.25em] text-[#c5a880]">
                Provenance: {item.origin}
              </div>
            )}

            <p className="font-sans text-sm sm:text-base text-[#e8e2d5]/85 leading-relaxed font-light">
              {item.description}
            </p>

            {/* Tasting Notes */}
            {item.notes && item.notes.length > 0 && (
              <div className="p-4 bg-[#1c1815] border border-[#2d241e]">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] mb-2 font-medium">
                  Aromatic & Flavour Profile
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#faf7f2] font-light">
                  {item.notes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2]/90"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Curated Pairing */}
            {item.pairing && (
              <div className="flex items-start gap-3 text-xs text-[#e8e2d5]/80">
                <Sparkles className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-serif italic text-[#c5a880] text-sm block">Recommended Gastronomic Pairing</span>
                  <span>{item.pairing}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-[#2d241e] bg-[#0c0b0a] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#e8e2d5]/70 hover:text-[#faf7f2] transition-colors"
            >
              Return to Menu
            </button>
            <div className="flex items-center gap-2">
              {onAddToCart && (
                <button
                  onClick={() => {
                    onAddToCart(item);
                    onClose();
                  }}
                  className="px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium text-[#faf7f2] border border-[#c5a880] hover:bg-[#c5a880]/10 transition-colors"
                >
                  Add to Order Bag
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  onReserveForThis(item.name);
                }}
                className="px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors"
              >
                Reserve Salon Table
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
