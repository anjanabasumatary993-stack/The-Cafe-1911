import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CafeDetails } from '../types';
import { X, Check, MapPin, Clock, Phone, Mail, RotateCcw } from 'lucide-react';
import { INITIAL_CAFE_DETAILS } from '../data/cafeData';

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeDetails: CafeDetails;
  onSave: (details: CafeDetails) => void;
}

export const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
  isOpen,
  onClose,
  cafeDetails,
  onSave,
}) => {
  const [formState, setFormState] = useState<CafeDetails>({ ...cafeDetails });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  const handleReset = () => {
    setFormState({ ...INITIAL_CAFE_DETAILS });
  };

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
        className="relative w-full max-w-2xl bg-[#14110f] border border-[#2d241e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2d241e] bg-[#0c0b0a]/60">
          <h3 className="font-serif text-xl text-[#faf7f2]">
            Edit Café Contact & Location
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
              Café Brand Name
            </label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
              Street Address
            </label>
            <input
              type="text"
              value={formState.address}
              onChange={(e) => setFormState({ ...formState, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
              City & District
            </label>
            <input
              type="text"
              value={formState.city}
              onChange={(e) => setFormState({ ...formState, city: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                Telephone
              </label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                Official Email (Leave blank if unverified)
              </label>
              <input
                type="email"
                placeholder="Hidden until supplied"
                value={formState.email || ''}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none placeholder-[#e8e2d5]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                Weekday Hours
              </label>
              <input
                type="text"
                value={formState.weekdayHours}
                onChange={(e) => setFormState({ ...formState, weekdayHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                Weekend Hours
              </label>
              <input
                type="text"
                value={formState.weekendHours}
                onChange={(e) => setFormState({ ...formState, weekendHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#c5a880] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default CAFE 1911 Details</span>
            </button>
          </div>

          <div className="p-6 -mx-8 -mb-8 border-t border-[#2d241e] bg-[#0c0b0a] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs uppercase tracking-wider text-[#e8e2d5]/70 hover:text-[#faf7f2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors"
            >
              Save Details
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
