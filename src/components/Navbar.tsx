import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu as MenuIcon, X, Calendar, Phone, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onReserveClick: () => void;
  activeSection: string;
  cartCount: number;
  onOpenCart: () => void;
  onOpenStaffDashboard: () => void;
  onOpenTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReserveClick,
  activeSection,
  cartCount,
  onOpenCart,
  onOpenStaffDashboard,
  onOpenTracking,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Menu', href: '#menu' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'The Experience', href: '#experience' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Visit Us', href: '#visit' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0c0b0a]/90 backdrop-blur-md border-b border-[#2d241e]/60 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-b from-[#0c0b0a]/80 via-[#0c0b0a]/30 to-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          className="font-serif text-xl sm:text-2xl tracking-[0.25em] text-[#faf7f2] uppercase font-light whitespace-nowrap shrink-0 hover:text-[#c5a880] transition-colors"
          aria-label="CAFE 1911 Home"
        >
          CAFE 1911
        </a>

        {/* Zone 2: Navigation Links (single line, subtle hover underline) */}
        <nav
          className="hidden md:flex items-center gap-7 lg:gap-8 text-xs uppercase tracking-[0.2em] font-medium text-[#e8e2d5]/80"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-200 hover:text-[#faf7f2] ${
                  isActive ? 'text-[#c5a880]' : ''
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#c5a880]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action Controls & Order Bag */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Order Bag Button */}
          <button
            onClick={onOpenCart}
            className="relative px-3.5 py-2 text-xs uppercase tracking-[0.15em] text-[#faf7f2] border border-[#2d241e] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors flex items-center gap-2 cursor-pointer bg-[#14110f]/80"
            aria-label="View Order Bag"
          >
            <span className="relative">
              Bag
              {cartCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-[#c5a880] text-[#0c0b0a] font-mono font-bold text-[10px]">
                  {cartCount}
                </span>
              )}
            </span>
          </button>

          {/* Staff Dashboard Portal Link */}
          <button
            onClick={onOpenStaffDashboard}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] font-medium text-[#c5a880]/90 hover:text-[#faf7f2] border border-[#2d241e] hover:border-[#c5a880] transition-colors cursor-pointer bg-[#14110f]/80"
            title="Manager & Kitchen Dashboard"
            aria-label="Staff Dashboard"
          >
            <span>Staff</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onReserveClick}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all duration-300 rounded-none whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Table & Visit</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#faf7f2] hover:text-[#c5a880] transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-[#0c0b0a]/98 border-b border-[#2d241e] overflow-hidden px-6 py-6 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-5 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm uppercase tracking-[0.25em] text-[#e8e2d5] hover:text-[#c5a880] py-1 border-b border-[#2d241e]/40 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Order Bag ({cartCount})</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTracking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#faf7f2] border border-[#2d241e] hover:border-[#c5a880] transition-colors"
                >
                  <span>Track Live Order</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStaffDashboard();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#c5a880] border border-[#2d241e] hover:border-[#c5a880] transition-colors"
                >
                  <span>Staff Order Terminal</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onReserveClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#e8e2d5] border border-[#2d241e] hover:border-[#c5a880]/50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Salon Table Reservation</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
