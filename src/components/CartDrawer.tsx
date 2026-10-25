import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, StoreSettings } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, Store, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currencySymbol: string;
  storeSettings: StoreSettings | null;
  fulfilmentMethod: 'delivery' | 'pickup';
  onSetFulfilmentMethod: (method: 'delivery' | 'pickup') => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currencySymbol,
  storeSettings,
  fulfilmentMethod,
  onSetFulfilmentMethod,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)
  );

  const deliveryFee = fulfilmentMethod === 'delivery' && storeSettings ? storeSettings.deliveryFee : 0;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const minOrder = storeSettings ? storeSettings.minOrderAmount : 20.0;
  const isBelowMin = fulfilmentMethod === 'delivery' && subtotal < minOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0c0b0a]/80 backdrop-blur-sm"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-screen max-w-md bg-[#14110f] border-l border-[#2d241e] shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#2d241e] flex items-center justify-between bg-[#0c0b0a]/60">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
              <h3 className="font-serif text-xl text-[#faf7f2] font-normal tracking-wide">
                Your Order Bag
              </h3>
              <span className="text-xs font-mono text-[#c5a880] tabular-nums">
                ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfilment Toggle */}
          <div className="px-6 py-3 bg-[#1c1815] border-b border-[#2d241e] flex items-center gap-2">
            <button
              onClick={() => onSetFulfilmentMethod('delivery')}
              className={`flex-1 py-2 text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                fulfilmentMethod === 'delivery'
                  ? 'bg-[#c5a880] text-[#0c0b0a] font-medium'
                  : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/70 hover:text-[#faf7f2]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Courier Delivery</span>
            </button>

            <button
              onClick={() => onSetFulfilmentMethod('pickup')}
              className={`flex-1 py-2 text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                fulfilmentMethod === 'pickup'
                  ? 'bg-[#c5a880] text-[#0c0b0a] font-medium'
                  : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/70 hover:text-[#faf7f2]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Salon Pickup</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#e8e2d5]/60">
                <ShoppingBag className="w-12 h-12 text-[#c5a880]/30 mb-4" />
                <p className="font-serif text-xl text-[#faf7f2] mb-1">Your bag is empty</p>
                <p className="text-xs text-[#e8e2d5]/60 max-w-xs font-light mb-6">
                  Select artisanal espresso, hand-poured micro-lots, or fresh patisserie from our signature menu.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors cursor-pointer"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#0c0b0a] border border-[#2d241e] flex gap-4 items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base text-[#faf7f2] truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs text-[#c5a880] font-mono tabular-nums">
                      {currencySymbol}{item.unitPrice.toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 bg-[#14110f] border border-[#2d241e] hover:border-[#c5a880] text-[#faf7f2] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono text-xs tabular-nums text-[#faf7f2]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 bg-[#14110f] border border-[#2d241e] hover:border-[#c5a880] text-[#faf7f2] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-[#e8e2d5]/40 hover:text-red-400 transition-colors ml-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#2d241e] bg-[#0c0b0a] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#e8e2d5]/70">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#faf7f2] tabular-nums">
                    {currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#e8e2d5]/70">
                  <span>
                    {fulfilmentMethod === 'delivery' ? 'Courier Delivery Fee' : 'Salon Pickup'}
                  </span>
                  <span className="font-mono text-[#faf7f2] tabular-nums">
                    {fulfilmentMethod === 'delivery' ? `${currencySymbol}${deliveryFee.toFixed(2)}` : 'Complimentary'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#2d241e]/70 flex justify-between text-sm">
                  <span className="font-serif text-[#faf7f2]">Total Amount</span>
                  <span className="font-serif text-lg text-[#c5a880] font-medium tabular-nums">
                    {currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Minimum Order Warning */}
              {isBelowMin && (
                <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs font-light">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Minimum courier order is {currencySymbol}{minOrder.toFixed(2)}. Add {currencySymbol}{(minOrder - subtotal).toFixed(2)} more to proceed.
                  </span>
                </div>
              )}

              <button
                disabled={isBelowMin}
                onClick={onProceedCheckout}
                className="w-full py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all duration-300 rounded-none shadow-[0_4px_20px_rgba(197,168,128,0.2)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
