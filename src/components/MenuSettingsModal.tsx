import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { X, Check, DollarSign, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface MenuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  currencySymbol: string;
  onUpdateCurrency: (symbol: string) => void;
  onUpdateItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  onResetDefaults: () => void;
}

export const MenuSettingsModal: React.FC<MenuSettingsModalProps> = ({
  isOpen,
  onClose,
  items,
  currencySymbol,
  onUpdateCurrency,
  onUpdateItem,
  onResetDefaults,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(currencySymbol);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const currencies = [
    { label: 'Indian Rupee (₹)', symbol: '₹' },
    { label: 'Euro (€)', symbol: '€' },
    { label: 'US Dollar ($)', symbol: '$' },
    { label: 'British Pound (£)', symbol: '£' },
    { label: 'Swiss Franc (CHF)', symbol: 'CHF ' },
    { label: 'UAE Dirham (AED)', symbol: 'AED ' },
  ];

  const handleCurrencySelect = (sym: string) => {
    setSelectedCurrency(sym);
    onUpdateCurrency(sym);
  };

  const displayedItems = filterCategory === 'all'
    ? items
    : items.filter(i => i.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0c0b0a]/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-[#14110f] border border-[#2d241e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2d241e] bg-[#0c0b0a]/60">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-[#c5a880]" />
            <h3 className="font-serif text-xl text-[#faf7f2]">
              Menu & Pricing Editor
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="p-8 border-b border-[#2d241e] bg-[#1c1815]/50">
          <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-3 font-medium">
            Global Menu Currency
          </label>
          <div className="flex flex-wrap gap-2">
            {currencies.map((c) => (
              <button
                key={c.symbol}
                onClick={() => handleCurrencySelect(c.symbol)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCurrency === c.symbol
                    ? 'bg-[#c5a880] text-[#0c0b0a]'
                    : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/80 hover:text-[#faf7f2]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item Pricing Table */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-[#e8e2d5]/50">
              Live Editable Price Catalogue ({items.length} items)
            </span>
            <button
              onClick={onResetDefaults}
              className="text-xs text-[#c5a880] hover:underline flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="space-y-3">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#0c0b0a] border border-[#2d241e] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base text-[#faf7f2] truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#c5a880]/80">
                      [{item.category}]
                    </span>
                  </div>
                  <p className="text-xs text-[#e8e2d5]/60 truncate font-light">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#c5a880]">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={item.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        onUpdateItem(item.id, { price: val });
                      }
                    }}
                    className="w-20 px-2 py-1 bg-[#14110f] border border-[#2d241e] text-sm text-[#faf7f2] font-mono tabular-nums focus:border-[#c5a880] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2d241e] bg-[#0c0b0a] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
