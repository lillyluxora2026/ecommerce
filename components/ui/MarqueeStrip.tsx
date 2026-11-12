'use client';

import { ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import { useState } from 'react';

const MESSAGES = [
  {
    text: 'Free Shipping on Orders Above ₹999',
    extra: 'Waterproof • Anti-Tarnish • 18K PVD Gold-Plated',
  },
  {
    text: 'Complimentary Pan-India Express Delivery',
    extra: 'Hypoallergenic Stainless Steel • 18K Gold Finish',
  },
];

export function MarqueeStrip() {
  const [index, setIndex] = useState(0);

  const current = MESSAGES[index];

  return (
    <div
      className="w-full bg-[#56473E] text-[#F7F3ED] text-[11px] sm:text-xs font-sans tracking-wide py-2 px-4 border-b border-[#4A3C33]"
      aria-label="Store announcement"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length)}
          className="text-[#F7F3ED]/80 hover:text-white transition-colors p-1"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-center gap-2 sm:gap-4 text-center px-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <Package className="w-3.5 h-3.5 text-[#C5A574]" />
            <span>{current.text}</span>
          </span>
          <span className="text-[#C5A574]/60">|</span>
          <span className="inline-flex items-center gap-1.5 text-[#F7F3ED]/90 font-light text-[11px] sm:text-xs">
            <Sparkles className="w-3 h-3 text-[#C5A574]" />
            <span>{current.extra}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % MESSAGES.length)}
          className="text-[#F7F3ED]/80 hover:text-white transition-colors p-1"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
