import React, { useState } from 'react';
import { ArrowUp, Play, Check, Send } from 'lucide-react';
import { CafeDetails } from '../types';

interface FooterProps {
  cafeDetails: CafeDetails;
  onReplayIntro: () => void;
  onOpenStaffDashboard?: () => void;
  onOpenTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  cafeDetails,
  onReplayIntro,
  onOpenStaffDashboard,
  onOpenTracking,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 2000);
    }
  };

  return (
    <footer className="relative bg-[#0c0b0a] border-t border-[#2d241e] pt-20 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#2d241e]/60">
          {/* Brand & Vision (col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-[#faf7f2] uppercase font-light">
              CAFE 1911
            </h3>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c5a880]">
              An Art of Slow Living
            </p>
            <p className="text-sm text-[#e8e2d5]/70 font-light leading-relaxed max-w-sm pt-2">
              A culinary sanctuary in Diphu dedicated to freshly prepared delicacies, comforting meals, and genuine hospitality.
            </p>

            {/* Actions: Replay & Order Tracking */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={onReplayIntro}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c5a880] hover:text-[#faf7f2] transition-colors cursor-pointer group"
              >
                <Play className="w-3.5 h-3.5 text-[#c5a880] group-hover:scale-110 transition-transform" />
                <span>Replay Cinematic Prologue</span>
              </button>

              {onOpenTracking && (
                <button
                  onClick={onOpenTracking}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8e2d5]/60 hover:text-[#c5a880] transition-colors cursor-pointer text-left"
                >
                  <span>Track Online Food Order</span>
                </button>
              )}

              {onOpenStaffDashboard && (
                <button
                  onClick={onOpenStaffDashboard}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#c5a880]/70 hover:text-[#c5a880] transition-colors cursor-pointer text-left pt-1"
                >
                  <span>Staff Orders & Operations Terminal →</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links (col-span-3) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs uppercase tracking-[0.25em] text-[#c5a880] mb-4 font-medium">
              Navigation
            </div>
            <ul className="space-y-2.5 text-xs uppercase tracking-[0.18em] text-[#e8e2d5]/75">
              <li>
                <a href="#hero" className="hover:text-[#c5a880] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#c5a880] transition-colors">
                  Guest Reviews
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#c5a880] transition-colors">
                  Signature Menu
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-[#c5a880] transition-colors">
                  The Experience
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#c5a880] transition-colors">
                  Immersive Gallery
                </a>
              </li>
              <li>
                <a href="#visit" className="hover:text-[#c5a880] transition-colors">
                  Reservations & Visit
                </a>
              </li>
            </ul>
          </div>

          {/* Gazette / Private Dispatch (col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-medium">
              The Salon Gazette
            </div>
            <p className="text-xs text-[#e8e2d5]/70 font-light leading-relaxed">
              Receive announcements on seasonal chef specials, regional festival preparations, and culinary updates.
            </p>

            {!newsletterSubscribed ? (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 pt-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#14110f] border border-[#2d241e] text-[#faf7f2] placeholder-[#e8e2d5]/40 focus:border-[#c5a880] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#c5a880] py-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You have been inscribed in the Gazette.</span>
              </div>
            )}

            <div className="pt-2 text-xs text-[#e8e2d5]/50 font-light">
              <span>{cafeDetails.address}, {cafeDetails.city}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#e8e2d5]/50 gap-4">
          <p className="font-light">
            © {new Date().getFullYear()} {cafeDetails.name}. All rights reserved. Slow Living Hospitality.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8e2d5]/60 hover:text-[#c5a880] transition-colors cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
