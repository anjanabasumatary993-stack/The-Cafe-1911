/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CinematicIntro } from './components/CinematicIntro';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { GallerySection } from './components/GallerySection';
import { ReservationSection } from './components/ReservationSection';
import { Footer } from './components/Footer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { MenuSettingsModal } from './components/MenuSettingsModal';
import { EditDetailsModal } from './components/EditDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { StaffDashboardModal } from './components/StaffDashboardModal';
import { INITIAL_MENU_ITEMS, INITIAL_CAFE_DETAILS } from './data/cafeData';
import { MenuItem, CafeDetails, CartItem, StoreSettings } from './types';
import { testFirestoreConnection } from './firebase/config';

export default function App() {
  const [hasCompletedIntro, setHasCompletedIntro] = useState<boolean>(true);
  const [isReplayingIntro, setIsReplayingIntro] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Backend Store Settings (fees, min order, delivery estimates, COD rules)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  // Cart & Online Ordering State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cafe1911_cart');
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      // Filter out stale demo items (e.g. sig-1, esp-1, etc.)
      const valid = parsed.filter(item => INITIAL_MENU_ITEMS.some(m => m.id === item.id));
      return valid;
    } catch {
      return [];
    }
  });

  const [fulfilmentMethod, setFulfilmentMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStaffDashboardOpen, setIsStaffDashboardOpen] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/staff');
  });
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(undefined);

  // Live editable menu & location state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  const [cafeDetails, setCafeDetails] = useState<CafeDetails>(() => {
    try {
      const savedStr = localStorage.getItem('cafe1911_details');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        // If saved contains obsolete demo address (Janpath, Paris, etc.), reset to INITIAL_CAFE_DETAILS
        if (saved && typeof saved.address === 'string' && (saved.address.includes('Janpath') || saved.address.includes('Paris') || !saved.address.includes('Diphu'))) {
          localStorage.setItem('cafe1911_details', JSON.stringify(INITIAL_CAFE_DETAILS));
          return INITIAL_CAFE_DETAILS;
        }
        return saved;
      }
      return INITIAL_CAFE_DETAILS;
    } catch {
      return INITIAL_CAFE_DETAILS;
    }
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    try {
      return localStorage.getItem('cafe1911_currency') || '₹';
    } catch {
      return '₹';
    }
  });

  // Modal inspection states
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useState<boolean>(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState<boolean>(false);

  // Fetch backend store configuration
  const fetchStoreConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
        if (data.currency) {
          setCurrencySymbol(data.currency);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server config, using defaults:', err);
    }
  };

  // Fetch live menu from server
  const fetchLiveMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setMenuItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live menu from server, using local catalog:', err);
    }
  };

  useEffect(() => {
    fetchStoreConfig();
    fetchLiveMenu();
    testFirestoreConnection();

    // Listen to popstate for /staff route navigation
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/staff')) {
        setIsStaffDashboardOpen(true);
      } else {
        setIsStaffDashboardOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cafe1911_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Active section scroll tracking
  useEffect(() => {
    const sectionIds = ['hero', 'menu', 'reviews', 'experience', 'gallery', 'visit'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Staff Dashboard Navigation
  const handleOpenStaff = () => {
    setIsStaffDashboardOpen(true);
    try {
      window.history.pushState({}, '', '/staff');
    } catch {}
  };

  const handleCloseStaff = () => {
    setIsStaffDashboardOpen(false);
    try {
      if (window.location.pathname.startsWith('/staff')) {
        window.history.pushState({}, '', '/');
      }
    } catch {}
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: 1,
          category: item.category,
          image: item.image,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
  };

  const handleIntroComplete = useCallback(() => {
    setHasCompletedIntro(true);
    setIsReplayingIntro(false);
  }, []);

  const handleReplayIntro = () => {
    setIsReplayingIntro(true);
  };

  const handleUpdateMenuItem = (id: string, updatedFields: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      return updated;
    });
  };

  const handleResetMenuDefaults = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    fetchLiveMenu();
  };

  const handleUpdateCurrency = (symbol: string) => {
    setCurrencySymbol(symbol);
    try {
      localStorage.setItem('cafe1911_currency', symbol);
    } catch {}
  };

  const handleUpdateCafeDetails = (updated: Partial<CafeDetails>) => {
    setCafeDetails((prev) => {
      const merged = { ...prev, ...updated };
      try {
        localStorage.setItem('cafe1911_details', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const handleReserveClick = () => {
    const el = document.getElementById('visit');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreExperience = () => {
    const el = document.getElementById('experience');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDiscoverMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-[#faf7f2] font-sans selection:bg-[#c5a880]/30 selection:text-[#faf7f2]">
      {/* Cinematic Intro (plays on demand via footer replay) */}
      {isReplayingIntro && (
        <CinematicIntro
          onComplete={handleIntroComplete}
          isReplay={isReplayingIntro}
        />
      )}

      {/* Primary Navigation with Order Bag & Staff access */}
      <Navbar
        onReserveClick={handleReserveClick}
        activeSection={activeSection}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenStaffDashboard={handleOpenStaff}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          onExploreExperience={handleExploreExperience}
          onDiscoverMenu={handleDiscoverMenu}
        />

        {/* Signature Menu Section with Add to Bag */}
        <MenuSection
          items={menuItems}
          currencySymbol={currencySymbol}
          onUpdateItem={handleUpdateMenuItem}
          onSelectDetailItem={(item) => setSelectedDetailItem(item)}
          onOpenPricingModal={() => setIsMenuSettingsOpen(true)}
          onAddToCart={handleAddToCart}
        />

        {/* Guest Reviews Section */}
        <ReviewsSection />

        {/* The Experience Section */}
        <ExperienceSection />

        {/* Immersive Gallery Section */}
        <GallerySection />

        {/* Reservations & Visit Us Section */}
        <ReservationSection
          cafeDetails={cafeDetails}
          onUpdateCafeDetails={handleUpdateCafeDetails}
          onOpenEditDetailsModal={() => setIsEditDetailsOpen(true)}
        />
      </main>

      {/* Luxury Footer with Staff & Tracking links */}
      <Footer
        cafeDetails={cafeDetails}
        onReplayIntro={handleReplayIntro}
        onOpenStaffDashboard={handleOpenStaff}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currencySymbol={currencySymbol}
        storeSettings={storeSettings}
        fulfilmentMethod={fulfilmentMethod}
        onSetFulfilmentMethod={setFulfilmentMethod}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currencySymbol={currencySymbol}
        storeSettings={storeSettings}
        fulfilmentMethod={fulfilmentMethod}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={handleClearCart}
      />

      {/* Customer Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderId={activeTrackingOrderId}
      />

      {/* Private Staff Dashboard Modal */}
      <StaffDashboardModal
        isOpen={isStaffDashboardOpen}
        onClose={handleCloseStaff}
        onSettingsUpdated={fetchStoreConfig}
        onMenuUpdated={fetchLiveMenu}
      />

      {/* Item Detail / Tasting Notes Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        currencySymbol={currencySymbol}
        onClose={() => setSelectedDetailItem(null)}
        onReserveForThis={handleReserveClick}
        onAddToCart={handleAddToCart}
      />

      {/* Menu & Pricing Editor Modal */}
      <MenuSettingsModal
        isOpen={isMenuSettingsOpen}
        onClose={() => setIsMenuSettingsOpen(false)}
        items={menuItems}
        currencySymbol={currencySymbol}
        onUpdateCurrency={handleUpdateCurrency}
        onUpdateItem={handleUpdateMenuItem}
        onResetDefaults={handleResetMenuDefaults}
      />

      {/* Café Details & Contact Editor Modal */}
      <EditDetailsModal
        isOpen={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        cafeDetails={cafeDetails}
        onSave={handleUpdateCafeDetails}
      />
    </div>
  );
}
