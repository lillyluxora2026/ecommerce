'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageSlide } from '@/lib/server/app-settings';

type HomeHeroCarouselProps = {
  slides: HomepageSlide[];
};

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] || slides[0];

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-[#D8CBBE]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            priority={index === 0}
            className="hidden object-cover object-center md:block"
            sizes="100vw"
          />
          <Image
            src={slide.mobileImageUrl || slide.imageUrl}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover object-center md:hidden"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Subtle warm luxury vignette overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#382F2A]/85 via-[#382F2A]/30 to-[#382F2A]/20" />

      {/* Hero Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-7xl flex-col gap-5 p-6 sm:p-10 md:p-16 lg:p-20">
        <div className="flex items-center gap-2">
          <span className="inline-block h-[1px] w-8 bg-[#C5A574]" />
          <span className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.3em] text-[#C5A574]">
            {activeSlide.badgeText}
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-light leading-[1.08] tracking-tight text-[#F7F3ED] max-w-3xl">
          {activeSlide.title}{' '}
          {activeSlide.highlightText && (
            <span className="font-normal italic text-[#C5A574]">
              {activeSlide.highlightText}
            </span>
          )}
        </h1>

        <p className="max-w-xl text-sm sm:text-base font-sans leading-relaxed text-[#F7F3ED]/90 font-light">
          {activeSlide.description}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href={activeSlide.ctaHref}
            className="group inline-flex items-center justify-center gap-3 bg-[#8B7768] hover:bg-[#735F51] text-[#F7F3ED] px-8 py-4 text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-all shadow-[0_8px_24px_rgba(56,47,42,0.2)]"
          >
            <span>{activeSlide.ctaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/category"
            className="inline-flex items-center justify-center border border-white/60 hover:bg-white/10 text-white px-8 py-4 text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-all backdrop-blur-sm"
          >
            <span>View Collections</span>
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute right-6 bottom-8 z-20 hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F7F3ED]/60 bg-[#382F2A]/30 text-[#F7F3ED] backdrop-blur transition-all hover:bg-[#F7F3ED] hover:text-[#382F2A]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F7F3ED]/60 bg-[#382F2A]/30 text-[#F7F3ED] backdrop-blur transition-all hover:bg-[#F7F3ED] hover:text-[#382F2A]"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 z-20 flex gap-2 sm:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-[#C5A574]' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
