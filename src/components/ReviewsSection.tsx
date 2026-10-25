import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  date: string;
  rating: number;
  dishRecommended: string;
  comment: string;
  tag: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Anupama Terangpi',
    location: 'Diphu Local',
    date: 'Verified Dine-In',
    rating: 5,
    dishRecommended: 'Chicken Lollipop & Chicken Thukpa',
    comment:
      'Easily one of the finest food spots in Diphu. The Chicken Lollipop is crispy, richly flavored, and served piping hot. The Thukpa has an authentic mountain broth that warms the soul on chilly evenings. Attentive staff and serene atmosphere.',
    tag: 'Dine-In Guest',
  },
  {
    id: 'rev-2',
    name: 'Rohit Mech',
    location: 'Diphu, Assam',
    date: 'Regular Diner',
    rating: 5,
    dishRecommended: 'Steamed Chicken Momos & Fried Rice',
    comment:
      'The momos here are handcrafted perfection. Soft, delicate casing with juicy, fragrant filling and a chilli dip that hits the exact right notes. We love bringing family here for relaxed weekend lunches.',
    tag: 'Family Luncheon',
  },
  {
    id: 'rev-3',
    name: 'Bishal Sharma',
    location: 'Karbi Anglong',
    date: 'Takeaway Order',
    rating: 5,
    dishRecommended: 'Special Chicken Biryani & Chicken Bharta',
    comment:
      'The Chicken Bharta with butter chapatis is rich, creamy, and comforting. Portions are generous, packaging was neat, and food arrived steaming hot. CAFE 1911 maintains real culinary standards.',
    tag: 'Dinner Feast',
  },
  {
    id: 'rev-4',
    name: 'Priyanka Deka',
    location: 'Assam',
    date: 'Verified Visit',
    rating: 5,
    dishRecommended: 'Crispy Chilli Baby Corn & Cold Drinks',
    comment:
      'A wonderful cozy cafe to catch up with friends. Beautiful ambient lighting, polite service, and crisp starters. The crispy chilli baby corn is addictive. A genuine culinary gem in Diphu!',
    tag: 'Afternoon Gathering',
  },
];

export const ReviewsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  return (
    <section id="reviews" className="relative py-28 sm:py-36 bg-[#14110f] overflow-hidden border-t border-[#2d241e]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[#2d241e]">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#c5a880] mb-3">
              <span className="font-serif italic text-sm">Guest Impressions</span>
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
              <span>Diphu Diner Experiences</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#faf7f2] font-normal tracking-tight">
              Honest Diner Words
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#c5a880]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#c5a880]" />
              ))}
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#e8e2d5]/70 font-mono">
              5.0 · Top Rated in Diphu
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#0c0b0a] border border-[#2d241e] p-6 sm:p-7 flex flex-col justify-between hover:border-[#c5a880]/50 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#c5a880]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#c5a880]" />
                    ))}
                  </div>
                  <Quote className="w-4 h-4 text-[#c5a880]/30 group-hover:text-[#c5a880]/60 transition-colors" />
                </div>

                <p className="text-xs sm:text-sm text-[#e8e2d5]/80 font-light leading-relaxed mb-6 italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#2d241e]/60">
                <div className="text-[11px] uppercase tracking-wider text-[#c5a880] mb-1 font-medium">
                  Recommends: {review.dishRecommended}
                </div>
                <div className="flex items-center justify-between text-xs text-[#faf7f2]">
                  <span className="font-serif font-medium">{review.name}</span>
                  <span className="text-[10px] text-[#e8e2d5]/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {review.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Diphu Hospitality Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-[#0c0b0a] border border-[#2d241e] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#c5a880]/30 bg-[#1c1815] flex items-center justify-center text-[#c5a880] shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg text-[#faf7f2] font-normal">
                Committed to Authentic Culinary Care
              </h4>
              <p className="text-xs text-[#e8e2d5]/60 mt-0.5">
                Every dish at CAFE 1911 is prepared fresh upon order in our Diphu kitchen.
              </p>
            </div>
          </div>

          <a
            href="#visit"
            className="px-6 py-3 border border-[#c5a880] text-xs uppercase tracking-[0.2em] text-[#faf7f2] hover:bg-[#c5a880] hover:text-[#0c0b0a] transition-all whitespace-nowrap"
          >
            Visit Our Sanctuary
          </a>
        </div>
      </div>
    </section>
  );
};
