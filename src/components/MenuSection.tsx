import React, { useState } from 'react';
import { MenuItem } from '../types';
import { MENU_CATEGORIES } from '../data/cafeData';
import { Edit3, Check, ChevronRight, SlidersHorizontal, Search, X } from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  currencySymbol: string;
  onUpdateItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  onSelectDetailItem: (item: MenuItem) => void;
  onOpenPricingModal: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  currencySymbol = '₹',
  onUpdateItem,
  onSelectDetailItem,
  onOpenPricingModal,
  onAddToCart,
}) => {
  const [activeCategory, setActiveCategory] = useState<MenuItem['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');

  const visibleItems = items.filter((item) => !item.isHidden);

  const filteredItems = visibleItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const currentCategoryData = MENU_CATEGORIES.find((c) => c.id === activeCategory);
  // Prioritize Chicken Lollipop or Chicken Bharta if present and signature
  const featuredItem = filteredItems.find((item) => item.isSignature) || filteredItems[0];

  const handleStartEditPrice = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditPriceValue(item.price.toFixed(2));
  };

  const handleSavePrice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const num = parseFloat(editPriceValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateItem(id, { price: num });
    }
    setEditingItemId(null);
  };

  return (
    <section id="menu" className="relative py-28 sm:py-36 bg-[#14110f] overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(197,168,128,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#2d241e]">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#c5a880] mb-3">
              <span className="font-serif italic text-sm">Chapter II</span>
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
              <span>Authentic Provisions</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#faf7f2] font-normal tracking-tight">
              The CAFE 1911 Menu
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPricingModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c5a880] border border-[#c5a880]/30 hover:border-[#c5a880] hover:bg-[#c5a880]/10 transition-colors cursor-pointer"
              title="Customize currency and adjust item prices"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pricing & Currency ({currencySymbol})</span>
            </button>
          </div>
        </div>

        {/* Customer Dish Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#e8e2d5]/40" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Chicken Lollipop, Bharta, Momos, Thukpa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-xs text-[#faf7f2] placeholder-[#e8e2d5]/40 focus:border-[#c5a880] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#e8e2d5]/40 hover:text-[#faf7f2]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`relative px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeCategory === 'all'
                ? 'text-[#0c0b0a] bg-[#c5a880]'
                : 'text-[#e8e2d5]/70 hover:text-[#faf7f2] bg-[#1c1815] border border-[#2d241e]/70'
            }`}
          >
            All Dishes ({visibleItems.length})
          </button>

          {MENU_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            const catCount = visibleItems.filter((i) => i.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[#0c0b0a] bg-[#c5a880]'
                    : 'text-[#e8e2d5]/70 hover:text-[#faf7f2] bg-[#1c1815] border border-[#2d241e]/70'
                }`}
              >
                <span>{category.label}</span>
                {catCount > 0 && <span className="ml-1.5 opacity-60 text-[10px]">({catCount})</span>}
              </button>
            );
          })}
        </div>

        {/* Category Description Banner */}
        {currentCategoryData && activeCategory !== 'all' && (
          <div className="mb-10 text-xs sm:text-sm text-[#e8e2d5]/60 font-light italic max-w-2xl font-serif">
            {currentCategoryData.description}
          </div>
        )}

        {/* Featured Showcase Item */}
        {!searchQuery && featuredItem && (
          <div className="mb-14 bg-[#1c1815] border border-[#2d241e] overflow-hidden group hover:border-[#c5a880]/40 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Media / Decorative Emblem Column */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden bg-gradient-to-br from-[#1c1815] via-[#14110f] to-[#0c0b0a] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-[#2d241e]">
                {featuredItem.image ? (
                  <>
                    <img
                      src={featuredItem.image}
                      alt={featuredItem.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1815] via-transparent to-transparent lg:hidden" />
                  </>
                ) : (
                  <div className="text-center space-y-3 relative z-10">
                    <div className="w-16 h-16 mx-auto rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-[#0c0b0a]/70">
                      <span className="font-serif italic text-2xl text-[#c5a880]">1911</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#c5a880]">
                      Signature Specialty
                    </div>
                    <p className="text-xs text-[#e8e2d5]/50 font-serif italic max-w-xs">
                      Cooked fresh to order in our Diphu kitchen
                    </p>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-[#0c0b0a]/80 backdrop-blur-md px-3 py-1 border border-[#c5a880]/40 text-[10px] uppercase tracking-[0.2em] text-[#c5a880]">
                  Master Selection
                </div>
              </div>

              {/* Editorial details side */}
              <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880]">
                      {featuredItem.origin || 'CAFE 1911 Diphu Specialty'}
                    </span>
                    <span className="font-serif text-2xl text-[#faf7f2] tabular-nums">
                      {currencySymbol}{featuredItem.price.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#faf7f2] font-normal mb-4">
                    {featuredItem.name}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[#e8e2d5]/80 leading-relaxed font-light mb-6">
                    {featuredItem.description}
                  </p>

                  {/* Tasting notes */}
                  {featuredItem.notes && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#c5a880]/90 mb-4 font-light">
                      <span className="uppercase tracking-widest text-[#e8e2d5]/50 text-[10px]">Flavor Profile:</span>
                      {featuredItem.notes.map((note, idx) => (
                        <React.Fragment key={note}>
                          {idx > 0 && <span className="text-[#2d241e]">·</span>}
                          <span>{note}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {featuredItem.pairing && (
                    <div className="text-xs text-[#e8e2d5]/60 font-light">
                      <span className="font-serif italic text-[#c5a880]">Recommended Accompaniment: </span>
                      <span>{featuredItem.pairing}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-[#2d241e] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onSelectDetailItem(featuredItem)}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#faf7f2] hover:text-[#c5a880] transition-colors cursor-pointer group"
                    >
                      <span>Dish Details & Notes</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      onClick={(e) => handleStartEditPrice(e, featuredItem)}
                      className="text-[11px] uppercase tracking-wider text-[#e8e2d5]/50 hover:text-[#c5a880] flex items-center gap-1.5 cursor-pointer"
                      title="Edit price"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(featuredItem);
                    }}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>+ Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Menu List Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-[#e8e2d5]/50">
            <p className="font-serif text-xl text-[#faf7f2] mb-2">No culinary items match your search</p>
            <p className="text-xs">Try searching for other ingredients or clear your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectDetailItem(item)}
                className="group cursor-pointer p-4 -mx-4 rounded-none hover:bg-[#1c1815]/60 transition-colors border-b border-[#2d241e]/50 pb-6"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-serif text-xl sm:text-2xl text-[#faf7f2] font-normal group-hover:text-[#c5a880] transition-colors">
                      {item.name}
                    </h4>
                    {item.isSignature && (
                      <span className="w-1.5 h-1.5 bg-[#c5a880] rotate-45 inline-block shrink-0" title="House Signature" />
                    )}
                  </div>

                  {/* Price or Inline Edit */}
                  <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#c5a880]">{currencySymbol}</span>
                        <input
                          type="number"
                          step="1"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-xs bg-[#0c0b0a] border border-[#c5a880] text-[#faf7f2] font-mono tabular-nums focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSavePrice(e, item.id)}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg sm:text-xl text-[#faf7f2] tabular-nums font-normal">
                          {currencySymbol}{item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => handleStartEditPrice(e, item)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#e8e2d5]/40 hover:text-[#c5a880] transition-opacity"
                          title="Edit price"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Description */}
                <p className="font-sans text-xs sm:text-sm text-[#e8e2d5]/70 leading-relaxed font-light mt-2 mb-3">
                  {item.description}
                </p>

                {/* Unboxed Metadata & Notes with Add to Bag */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#e8e2d5]/50 font-light">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.origin && (
                      <span>{item.origin}</span>
                    )}
                    {item.origin && item.notes && <span>·</span>}
                    {item.notes && (
                      <span className="text-[#c5a880]/80">{item.notes.join(', ')}</span>
                    )}
                    {item.dietary && (
                      <>
                        <span>·</span>
                        <span className="text-[#e8e2d5]/60">{item.dietary.join(', ')}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#c5a880] hover:text-[#0c0b0a] hover:bg-[#c5a880] border border-[#c5a880]/40 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add to order bag"
                  >
                    <span>+ Add to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editorial Footnote */}
        <div className="mt-16 pt-8 border-t border-[#2d241e] flex flex-col sm:flex-row items-center justify-between text-xs text-[#e8e2d5]/50 gap-4">
          <p className="font-serif italic">
            All culinary dishes are prepared fresh to order at CAFE 1911, Diphu.
          </p>
          <p className="font-sans tracking-widest uppercase text-[10px] text-[#c5a880]">
            Priced in {currencySymbol} · Inclusive of Taxes
          </p>
        </div>
      </div>
    </section>
  );
};
