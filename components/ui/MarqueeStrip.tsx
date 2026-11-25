'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MESSAGES = [
  'Free Pan-India Shipping on Orders Above ₹999 • 100% Waterproof & Anti-Tarnish',
  '18K PVD Gold-Plated Stainless Steel • Hypoallergenic Everyday Luxury',
];

export function MarqueeStrip() {
  const [index, setIndex] = useState(0);

  return (
    <div
      className="w-full bg-[#121212] text-white text-[11px] sm:text-xs font-sans font-normal tracking-wide py-2 px-3 sm:px-4"
      aria-label="Store announcement"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length)}
          className="text-white/75 hover:text-white transition-colors p-1 shrink-0"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        <p className="text-center truncate px-2 text-[11px] sm:text-xs text-white/95">
          {MESSAGES[index]}
        </p>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % MESSAGES.length)}
          className="text-white/75 hover:text-white transition-colors p-1 shrink-0"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
