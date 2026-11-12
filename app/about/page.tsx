import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Droplets, Shield, Sparkles, Gem, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Everyday Elegance, Made to Last',
  description: 'Learn about Lily Luxora — specializing in waterproof, anti-tarnish 18K PVD gold-plated stainless steel demi-fine jewellery.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Lily Luxora — Demi-Fine Luxury Jewellery',
    description: '18K PVD Gold-Plated, Stainless Steel, Waterproof & Anti-Tarnish Jewellery.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto px-4 md:px-12 pt-16 md:pt-24 pb-12 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.26em] text-xs font-sans font-semibold mb-3 block">
          The Lily Luxora Story
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-normal leading-tight tracking-tight text-[#382F2A] mb-6">
          Everyday Elegance, Made to Last.
        </h1>
        <p className="text-sm md:text-base font-sans text-[#63574F] max-w-2xl mx-auto leading-relaxed">
          We founded Lily Luxora with a simple yet uncompromising philosophy: fine jewellery aesthetics shouldn’t come with fragile upkeep, and everyday jewellery shouldn’t tarnish after a few wears.
        </p>
        <div className="h-[1px] w-24 bg-[#B7A596]/60 mx-auto mt-8" />
      </section>

      {/* Brand Craftsmanship Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-6 text-[#63574F] font-sans text-xs sm:text-sm leading-relaxed">
          <span className="text-[#8B7768] text-xs uppercase tracking-[0.2em] font-medium block">
            Craftsmanship &amp; Technology
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-normal text-[#382F2A] leading-snug">
            Why 18K PVD Gold-Plating Changes Everything
          </h2>
          <p>
            Traditional gold-plated jewellery fades and discolors quickly because conventional electroplating only leaves a fragile surface film. At <strong>Lily Luxora</strong>, we utilize <strong>Physical Vapour Deposition (PVD)</strong> — an advanced aerospace vacuum coating process.
          </p>
          <p>
            During PVD coating, genuine 18-karat gold is vaporized into an atomic plasma and bonded directly to the surface of medical-grade 316L stainless steel. The result is a durable, scratch-resistant bond that is up to <strong>10 times thicker and stronger</strong> than standard plating.
          </p>
          <p>
            You can shower with it, swim in the sea, apply lotion, and break a sweat at the gym. Lily Luxora pieces retain their warm, authentic golden radiance day after day, year after year.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link 
              href="/products" 
              className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-7 py-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] transition-all shadow-sm flex items-center gap-2"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/category" 
              className="rounded-full border border-[#B7A596] hover:border-[#8B7768] bg-white text-[#382F2A] px-7 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] transition-all"
            >
              View Categories
            </Link>
          </div>
        </div>

        {/* Studio Visual Representation */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E5DACF] shadow-sm">
          <Image
            src="/images/placeholders/brand-story.svg"
            alt="Lily Luxora demi-fine jewellery studio placeholder"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="max-w-6xl mx-auto px-4 md:px-12 py-16 border-t border-[#B7A596]/40">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[#8B7768] uppercase tracking-[0.2em] text-xs font-sans font-medium block mb-2">
            Our Commitments
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[#382F2A]">
            The Four Pillars of Lily Luxora
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-1">
              <Droplets className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A]">100% Waterproof</h3>
            <p className="font-sans text-xs text-[#63574F] leading-relaxed">
              Engineered to accompany you everywhere. Safe in water, showers, oceans, and perfume.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-1">
              <Shield className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A]">Anti-Tarnish</h3>
            <p className="font-sans text-xs text-[#63574F] leading-relaxed">
              No greenish residue, no fading. The warm champagne-gold luster is sealed at the molecular level.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-1">
              <Sparkles className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A]">18K PVD Gold</h3>
            <p className="font-sans text-xs text-[#63574F] leading-relaxed">
              Genuine 18-karat gold finish deposited in high-vacuum chambers for an authentic luxury feel.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-1">
              <Gem className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A]">Hypoallergenic</h3>
            <p className="font-sans text-xs text-[#63574F] leading-relaxed">
              Surgical 316L stainless steel base. 100% nickel-free and lead-free for ultra-sensitive skin.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}