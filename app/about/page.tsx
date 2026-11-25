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
    <main className="w-full bg-white text-[#121212] min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-10 text-center">
        <span className="text-[#555555] uppercase tracking-[0.2em] text-xs font-sans font-medium mb-3 block">
          Our Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-sans font-normal leading-tight tracking-tight text-[#121212] mb-5">
          Everyday Elegance, Made to Last.
        </h1>
        <p className="text-sm sm:text-base font-sans text-[#555555] max-w-2xl mx-auto leading-relaxed">
          We founded Lily Luxora with a simple philosophy: fine jewellery aesthetics shouldn’t come with fragile upkeep, and everyday pieces shouldn’t tarnish after a few wears.
        </p>
      </section>

      {/* Brand Craftsmanship Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="space-y-5 text-[#555555] font-sans text-sm leading-relaxed">
          <span className="text-[#121212] text-xs uppercase tracking-[0.16em] font-medium block">
            Craftsmanship &amp; Material
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-normal text-[#121212] leading-snug">
            Why 18K PVD Gold-Plating Matters
          </h2>
          <p>
            Traditional gold-plated jewellery fades quickly because conventional electroplating leaves a fragile surface film. At <strong className="text-[#121212] font-medium">Lily Luxora</strong>, we utilize <strong className="text-[#121212] font-medium">Physical Vapour Deposition (PVD)</strong> vacuum coating over surgical-grade 316L stainless steel.
          </p>
          <p>
            You can shower with it, swim, apply perfume, and live freely in your pieces without worrying about dulling or skin irritation.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-7 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors inline-flex items-center gap-2"
            >
              <span>Explore collection</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/category"
              className="border border-[#121212] bg-white hover:bg-[#F5F5F5] text-[#121212] px-7 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
            >
              View categories
            </Link>
          </div>
        </div>

        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-[#F6F6F6]">
          <Image
            src="https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113451.jpg.jpg"
            alt="Lily Luxora demi-fine jewellery"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 border-t border-[#EBEBEB]">
        <div className="max-w-xl mb-10">
          <h2 className="font-sans text-2xl sm:text-3xl font-normal text-[#121212]">
            The Four Pillars of Lily Luxora
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-6 flex flex-col gap-3">
            <Droplets className="w-5 h-5 text-[#121212]" strokeWidth={1.5} />
            <h3 className="font-sans text-base font-medium text-[#121212]">100% Waterproof</h3>
            <p className="font-sans text-xs text-[#555555] leading-relaxed">
              Engineered to accompany you everywhere. Safe in water, showers, and humidity.
            </p>
          </div>

          <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-6 flex flex-col gap-3">
            <Shield className="w-5 h-5 text-[#121212]" strokeWidth={1.5} />
            <h3 className="font-sans text-base font-medium text-[#121212]">Anti-Tarnish</h3>
            <p className="font-sans text-xs text-[#555555] leading-relaxed">
              No fading or skin discoloration. Long-lasting golden lustre sealed cleanly.
            </p>
          </div>

          <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-6 flex flex-col gap-3">
            <Sparkles className="w-5 h-5 text-[#121212]" strokeWidth={1.5} />
            <h3 className="font-sans text-base font-medium text-[#121212]">18K PVD Gold</h3>
            <p className="font-sans text-xs text-[#555555] leading-relaxed">
              Rich 18-karat gold finish vacuum-bonded for everyday durability.
            </p>
          </div>

          <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-6 flex flex-col gap-3">
            <Gem className="w-5 h-5 text-[#121212]" strokeWidth={1.5} />
            <h3 className="font-sans text-base font-medium text-[#121212]">Hypoallergenic</h3>
            <p className="font-sans text-xs text-[#555555] leading-relaxed">
              Surgical 316L stainless steel base. 100% nickel-free and lead-free.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
