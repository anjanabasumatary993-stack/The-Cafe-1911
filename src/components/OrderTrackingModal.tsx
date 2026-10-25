import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Search, Clock, CheckCircle2, Truck, Package, Utensils, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../types';
import { subscribeToOrder } from '../firebase/orders';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

interface TrackingData {
  id: string;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; timestamp: string; note?: string }>;
  createdAt: string;
  fulfilmentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  items: Array<{ name: string; quantity: number }>;
  isDemoOrder: boolean;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
}) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTracking = async (orderId: string) => {
    if (!orderId.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId.trim())}/tracking`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order not found.');
      }
      setTrackingData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to locate order.');
      }
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId && isOpen) {
      setSearchId(initialOrderId);
      fetchTracking(initialOrderId);
    }
  }, [initialOrderId, isOpen]);

  // Real-time Firestore order status stream
  useEffect(() => {
    if (searchId.trim() && isOpen) {
      try {
        const unsubscribe = subscribeToOrder(searchId.trim(), (liveOrder) => {
          if (liveOrder) {
            setTrackingData({
              id: liveOrder.id,
              status: liveOrder.status,
              statusHistory: liveOrder.statusHistory,
              createdAt: liveOrder.createdAt,
              fulfilmentMethod: liveOrder.fulfilmentMethod,
              subtotal: liveOrder.subtotal,
              deliveryFee: liveOrder.deliveryFee,
              total: liveOrder.total,
              currency: liveOrder.currency,
              items: liveOrder.items.map((i) => ({ name: i.name, quantity: i.quantity })),
              isDemoOrder: liveOrder.isDemoOrder,
            });
          }
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn('Real-time tracking subscription notice:', err);
      }
    }
  }, [searchId, isOpen]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchId);
  };

  const stages: OrderStatus[] = ['New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
  const normalizedStatus = trackingData?.status === 'Pending' ? 'New' : trackingData?.status;
  const currentStageIndex = normalizedStatus ? stages.indexOf(normalizedStatus as OrderStatus) : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0c0b0a]/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-[#14110f] border border-[#2d241e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2d241e] bg-[#0c0b0a]/60">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block">
              Live Salon Dispatch
            </span>
            <h3 className="font-serif text-2xl text-[#faf7f2] font-normal">
              Track Your Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ORD-1911-XXXX)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] font-mono text-sm placeholder-[#e8e2d5]/40 focus:border-[#c5a880] focus:outline-none uppercase"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#c5a880] text-[#0c0b0a] text-xs uppercase tracking-wider font-medium hover:bg-[#dfcaa7] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {trackingData && (
            <div className="space-y-6 pt-2">
              {/* Order Status Badge & ID */}
              <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#e8e2d5]/50 block">
                    Order Reference
                  </span>
                  <span className="font-mono text-lg text-[#c5a880] font-semibold">
                    {trackingData.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-[#e8e2d5]/50 block">
                    Current Status
                  </span>
                  <span className="inline-block px-3 py-1 bg-[#1c1815] border border-[#c5a880]/40 text-xs font-medium text-[#faf7f2]">
                    {trackingData.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="p-6 bg-[#1c1815] border border-[#2d241e] space-y-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[#c5a880] font-medium block">
                  Kitchen & Delivery Progress
                </span>

                <div className="space-y-3">
                  {stages.map((st, idx) => {
                    const isCompleted = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div key={st} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-[#c5a880] text-[#0c0b0a] font-bold'
                              : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/40'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-xs uppercase tracking-wider font-medium ${
                              isCurrent ? 'text-[#c5a880]' : isCompleted ? 'text-[#faf7f2]' : 'text-[#e8e2d5]/40'
                            }`}
                          >
                            {st}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items summary */}
              <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#e8e2d5]/50 block mb-1">
                  Ordered Items
                </span>
                {trackingData.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[#e8e2d5]/80">
                    <span>{i.quantity}× {i.name}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#2d241e] flex justify-between text-sm font-serif">
                  <span className="text-[#faf7f2]">Total Amount</span>
                  <span className="text-[#c5a880] tabular-nums">
                    {trackingData.currency}{trackingData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
