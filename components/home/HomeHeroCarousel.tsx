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
    <section className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[680px] min-h-[420px] overflow-hidden bg-[#F3F3F3]">
      {slides.map((slide, index) => {
        const isFirst = index === 0;
        const hasDistinctMobileImage =
          Boolean(slide.mobileImageUrl) && slide.mobileImageUrl !== slide.imageUrl;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {hasDistinctMobileImage ? (
              <>
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={isFirst}
                  fetchPriority={isFirst ? 'high' : 'low'}
                  loading={isFirst ? undefined : 'lazy'}
                  className="hidden object-cover object-center md:block"
                  sizes="(min-width: 768px) 100vw, 1px"
                />
                <Image
                  src={slide.mobileImageUrl}
                  alt={slide.title}
                  fill
                  priority={isFirst}
                  fetchPriority={isFirst ? 'high' : 'low'}
                  loading={isFirst ? undefined : 'lazy'}
                  className="object-cover object-center md:hidden"
                  sizes="(max-width: 767px) 100vw, 1px"
                />
              </>
            ) : (
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={isFirst}
                fetchPriority={isFirst ? 'high' : 'low'}
                loading={isFirst ? undefined : 'lazy'}
                className="object-cover object-center"
                sizes="100vw"
              />
            )}
          </div>
        );
      })}

      {/* Clean contrast scrim along bottom edge for crisp white type */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

      {/* Minimalist Dawn Hero Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-8 sm:px-6 sm:pb-12 lg:px-10 lg:pb-16">
        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-white/90">
          {activeSlide.badgeText}
        </span>

        <h1 className="font-sans text-3xl sm:text-5xl lg:text-[54px] font-normal leading-[1.1] tracking-tight text-white max-w-2xl">
          {activeSlide.title}{' '}
          {activeSlide.highlightText && (
            <span className="block sm:inline text-white/95">
              {activeSlide.highlightText}
            </span>
          )}
        </h1>

        <p className="max-w-lg text-xs sm:text-sm font-sans leading-relaxed text-white/85 font-normal line-clamp-2 sm:line-clamp-none">
          {activeSlide.description}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href={activeSlide.ctaHref || '/products'}
            className="group inline-flex items-center justify-center gap-2 bg-white text-[#121212] hover:bg-[#F5F5F5] px-6 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
          >
            <span>{activeSlide.ctaLabel || 'Shop now'}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center border border-white/80 text-white hover:bg-white/15 px-6 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
          >
            <span>Shop all</span>
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute right-6 bottom-8 z-20 hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#121212] transition-colors hover:bg-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#121212] transition-colors hover:bg-white"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
