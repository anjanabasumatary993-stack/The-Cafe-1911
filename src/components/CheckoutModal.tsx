import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CartItem, StoreSettings } from '../types';
import { createFirestoreOrder } from '../firebase/orders';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  CreditCard,
  ChevronRight,
  Banknote,
  QrCode,
  ShieldCheck,
  Info
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currencySymbol: string;
  storeSettings: StoreSettings | null;
  fulfilmentMethod: 'delivery' | 'pickup';
  onOrderSuccess: (orderId: string) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currencySymbol = '₹',
  storeSettings,
  fulfilmentMethod: initialFulfilment,
  onOrderSuccess,
  onClearCart,
}) => {
  const [fulfilment, setFulfilment] = useState<'delivery' | 'pickup'>(initialFulfilment);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'qr'>('cod');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isDemoOrder, setIsDemoOrder] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmed order state (returned ONLY after backend database accepts and responds)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    codFee: number;
    fulfilmentMethod: string;
    paymentMethod: string;
    createdAt: string;
    isDemoOrder: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const estimatedDeliveryFee = fulfilment === 'delivery' && storeSettings ? storeSettings.deliveryFee : 0;
  
  const minCodSubtotal = storeSettings?.minCodSubtotal ?? 500;
  const configCodFee = storeSettings?.codFee ?? 100;
  const isCodEligible = rawSubtotal >= minCodSubtotal;
  const estimatedCodFee = paymentMethod === 'cod' && isCodEligible ? configCodFee : 0;
  const estimatedTotal = rawSubtotal + estimatedDeliveryFee + estimatedCodFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side guard for COD subtotal check
    if (paymentMethod === 'cod' && !isCodEligible) {
      setErrorMessage(
        `Cash on Delivery is not available for food subtotals below ${currencySymbol}${minCodSubtotal}. Your current subtotal is ${currencySymbol}${rawSubtotal}. Please add ${currencySymbol}${minCodSubtotal - rawSubtotal} more to qualify.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          contactNumber,
          fulfilmentMethod: fulfilment,
          paymentMethod,
          deliveryAddress,
          landmark,
          orderNotes,
          isDemoOrder,
          // Only send IDs and quantities; server authoritatively calculates prices, eligibility & totals!
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Persist order in Firestore if client connectivity is available
      try {
        await createFirestoreOrder({
          ...data.order,
          contactNumber,
          deliveryAddress: fulfilment === 'delivery' ? deliveryAddress : 'Café Pickup (CAFE 1911, Diphu)',
          landmark,
          orderNotes,
          createdAtEpoch: Date.now(),
          updatedAt: data.order.createdAt,
          statusHistory: [
            {
              status: 'New',
              timestamp: data.order.createdAt,
              note: 'Order placed by customer and logged into salon management system.',
            },
          ],
        });
      } catch (fErr) {
        console.warn('Note: Firestore order synced via server database fallback:', fErr);
      }

      // Order confirmed by trusted server
      setConfirmedOrder({
        id: data.order.id,
        total: data.order.total,
        subtotal: data.order.subtotal,
        deliveryFee: data.order.deliveryFee,
        codFee: data.order.codFee || 0,
        fulfilmentMethod: data.order.fulfilmentMethod,
        paymentMethod: data.order.paymentMethod,
        createdAt: data.order.createdAt,
        isDemoOrder: data.order.isDemoOrder,
      });

      onClearCart();
      onOrderSuccess(data.order.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while placing your order.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0c0b0a]/90 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#14110f] border border-[#2d241e] shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#2d241e] bg-[#0c0b0a]/60">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block">
              Gourmet Online Ordering
            </span>
            <h3 className="font-serif text-2xl text-[#faf7f2] font-normal">
              {confirmedOrder ? 'Order Confirmed' : 'Checkout & Salon Dispatch'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {!confirmedOrder ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Mode Banner */}
              <div className="p-4 bg-[#1c1815] border border-[#2d241e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="demoOrderToggle"
                    checked={isDemoOrder}
                    onChange={(e) => setIsDemoOrder(e.target.checked)}
                    className="w-4 h-4 accent-[#c5a880] rounded cursor-pointer"
                  />
                  <label htmlFor="demoOrderToggle" className="text-xs text-[#faf7f2] cursor-pointer">
                    <span className="font-medium text-[#c5a880] block">
                      {isDemoOrder ? 'DEMO TEST ORDER (Simulated Kitchen Dispatch)' : 'LIVE RESTAURANT ORDER'}
                    </span>
                    <span className="text-[#e8e2d5]/60 font-light">
                      {isDemoOrder
                        ? 'Simulates actual kitchen terminal order flow without real courier dispatch.'
                        : 'Transmits as an actual live culinary order to CAFE 1911 salon.'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Fulfilment Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfilment('delivery')}
                  className={`p-4 border text-left transition-colors cursor-pointer ${
                    fulfilment === 'delivery'
                      ? 'border-[#c5a880] bg-[#1c1815]'
                      : 'border-[#2d241e] bg-[#0c0b0a] hover:border-[#c5a880]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a880] mb-1">
                    <Truck className="w-4 h-4" />
                    <span>Courier Delivery</span>
                  </div>
                  <p className="text-xs text-[#e8e2d5]/70 font-light">
                    Direct to residence ({storeSettings?.deliveryEstimateMinutes || '35-45 mins'})
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfilment('pickup')}
                  className={`p-4 border text-left transition-colors cursor-pointer ${
                    fulfilment === 'pickup'
                      ? 'border-[#c5a880] bg-[#1c1815]'
                      : 'border-[#2d241e] bg-[#0c0b0a] hover:border-[#c5a880]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a880] mb-1">
                    <Store className="w-4 h-4" />
                    <span>Café Pickup</span>
                  </div>
                  <p className="text-xs text-[#e8e2d5]/70 font-light">
                    Pick up at CAFE 1911 Diphu (Ready in ~15–20 mins)
                  </p>
                </button>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                    Contact Telephone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 60030 12345"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address Fields */}
              {fulfilment === 'delivery' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Delivery Address in Diphu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House / Flat, Locality or Colony in Diphu"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                      Nearby Landmark / Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Diphu Club, Main Road, or prominent landmark"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-2 font-medium">
                  Preparation & Delivery Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Extra hot extraction; discreet contactless delivery."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] font-medium">
                  Select Payment Method *
                </label>

                <div className="space-y-2">
                  {/* Cash on Delivery Option */}
                  <label
                    className={`block p-4 border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#c5a880] bg-[#1c1815]'
                        : 'border-[#2d241e] bg-[#0c0b0a] hover:border-[#c5a880]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#c5a880] cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#c5a880]" />
                          <span className="text-sm font-medium text-[#faf7f2]">Cash on Delivery (COD)</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#c5a880] uppercase tracking-wider">
                        {isCodEligible ? `+${currencySymbol}${configCodFee} Fee` : 'Min ₹500 subtotal'}
                      </span>
                    </div>

                    {/* COD Eligibility Notice */}
                    {!isCodEligible ? (
                      <div className="mt-3 p-3 bg-amber-950/30 border border-amber-600/40 text-amber-200/90 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-300">
                            Cash on Delivery unavailable for orders under {currencySymbol}{minCodSubtotal}
                          </p>
                          <p className="text-[11px] text-amber-200/70 mt-0.5">
                            Current food subtotal: {currencySymbol}{rawSubtotal}. Please add {currencySymbol}{minCodSubtotal - rawSubtotal} more to qualify for Cash on Delivery.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/80 text-[11px] flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                        <span>A temporary {currencySymbol}{configCodFee} COD fee is added for cash handling. Total food subtotal qualifies ({currencySymbol}{rawSubtotal} ≥ {currencySymbol}{minCodSubtotal}).</span>
                      </div>
                    )}
                  </label>

                  {/* Online Payment (UPI, Cards) - Coming Soon */}
                  <div className="p-4 border border-[#2d241e] bg-[#0c0b0a]/50 opacity-60 flex items-center justify-between cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <input type="radio" disabled name="paymentMethod" className="cursor-not-allowed" />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#e8e2d5]/50" />
                        <span className="text-sm text-[#e8e2d5]/70">Online Payment (UPI, Credit/Debit Cards, NetBanking)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/30 rounded">
                      Coming soon
                    </span>
                  </div>

                  {/* QR Payment - Coming Soon */}
                  <div className="p-4 border border-[#2d241e] bg-[#0c0b0a]/50 opacity-60 flex items-center justify-between cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <input type="radio" disabled name="paymentMethod" className="cursor-not-allowed" />
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#e8e2d5]/50" />
                        <span className="text-sm text-[#e8e2d5]/70">Instant QR Payment (Scan & Pay)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/30 rounded">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Pricing Breakdown */}
              <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-2 text-xs">
                <div className="text-[10px] uppercase tracking-widest text-[#c5a880] mb-2 font-medium">
                  Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                </div>

                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-[#e8e2d5]/80">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-[#faf7f2]">
                      {currencySymbol}{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-[#2d241e] flex justify-between text-[#e8e2d5]/70">
                  <span>Food Subtotal</span>
                  <span className="font-mono tabular-nums text-[#faf7f2]">
                    {currencySymbol}{rawSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#e8e2d5]/70">
                  <span>Delivery Fee</span>
                  <span className="font-mono tabular-nums text-[#faf7f2]">
                    {fulfilment === 'delivery'
                      ? estimatedDeliveryFee > 0
                        ? `${currencySymbol}${estimatedDeliveryFee.toFixed(2)}`
                        : 'Complimentary'
                      : 'Salon Pickup'}
                  </span>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[#c5a880]">
                    <span>Cash on Delivery (COD) Fee</span>
                    <span className="font-mono tabular-nums">
                      {isCodEligible ? `${currencySymbol}${estimatedCodFee.toFixed(2)}` : 'Ineligible (< ₹500)'}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#2d241e] flex justify-between text-sm font-serif">
                  <span className="text-[#faf7f2]">Grand Total</span>
                  <span className="text-base text-[#c5a880] font-medium tabular-nums">
                    {currencySymbol}{estimatedTotal.toFixed(2)}
                  </span>
                </div>

                <div className="text-[11px] text-[#e8e2d5]/50 italic pt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Subtotal, COD eligibility, and final total are strictly validated by the server.</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (paymentMethod === 'cod' && !isCodEligible)}
                className="w-full py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all duration-300 rounded-none shadow-[0_4px_20px_rgba(197,168,128,0.2)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Verifying & Recording Order with Kitchen...</span>
                ) : paymentMethod === 'cod' && !isCodEligible ? (
                  <span>Add {currencySymbol}{minCodSubtotal - rawSubtotal} More for COD</span>
                ) : (
                  <>
                    <span>Confirm Order ({currencySymbol}{estimatedTotal.toFixed(2)})</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Order Accepted Screen */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] block mb-2 font-medium">
                  {confirmedOrder.isDemoOrder ? 'DEMO TEST ORDER CONFIRMED BY SERVER' : 'LIVE ORDER ACCEPTED'}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#faf7f2] font-normal">
                  Thank You, Your Order Is In Motion
                </h3>
              </div>

              <div className="bg-[#0c0b0a] border border-[#2d241e] p-6 max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#2d241e] pb-2">
                  <span className="text-[#e8e2d5]/60 uppercase tracking-widest">Order ID:</span>
                  <span className="font-mono text-sm text-[#c5a880] font-semibold">{confirmedOrder.id}</span>
                </div>

                <div className="flex justify-between border-b border-[#2d241e] pb-2">
                  <span className="text-[#e8e2d5]/60">Payment Method:</span>
                  <span className="text-[#faf7f2] uppercase font-mono">{confirmedOrder.paymentMethod} (Pay upon receipt)</span>
                </div>

                <div className="flex justify-between border-b border-[#2d241e] pb-2">
                  <span className="text-[#e8e2d5]/60">Fulfilment Method:</span>
                  <span className="text-[#faf7f2] capitalize">{confirmedOrder.fulfilmentMethod}</span>
                </div>

                <div className="flex justify-between border-b border-[#2d241e] pb-2">
                  <span className="text-[#e8e2d5]/60">Verified Food Subtotal:</span>
                  <span className="font-mono text-[#faf7f2] tabular-nums">
                    {currencySymbol}{confirmedOrder.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-[#2d241e] pb-2">
                  <span className="text-[#e8e2d5]/60">Delivery Fee:</span>
                  <span className="font-mono text-[#faf7f2] tabular-nums">
                    {confirmedOrder.deliveryFee > 0 ? `${currencySymbol}${confirmedOrder.deliveryFee.toFixed(2)}` : 'Complimentary'}
                  </span>
                </div>

                {confirmedOrder.codFee > 0 && (
                  <div className="flex justify-between border-b border-[#2d241e] pb-2 text-[#c5a880]">
                    <span>Cash on Delivery Fee:</span>
                    <span className="font-mono tabular-nums">
                      {currencySymbol}{confirmedOrder.codFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-1 text-sm font-serif">
                  <span className="text-[#faf7f2]">Grand Total:</span>
                  <span className="text-base text-[#c5a880] tabular-nums font-medium">
                    {currencySymbol}{confirmedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#e8e2d5]/70 max-w-md mx-auto leading-relaxed font-light">
                Our kitchen terminal has recorded your order into the salon system. You can track preparation and dispatch in real-time using your unique order ID.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
                <button
                  onClick={onClose}
                  className="w-full py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors cursor-pointer"
                >
                  Return to Salon
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
