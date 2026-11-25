import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import {
  Droplets,
  Shield,
  Sparkles,
  Gem,
  ArrowRight,
  Star,
} from 'lucide-react';
import { DEFAULT_SITE_URL, getSiteUrl } from '@/lib/server/site-url';
import { getHomeBannerSettings } from '@/lib/server/app-settings';
import { getCategories } from '@/lib/api/home';
import { getProducts } from '@/lib/api/product';
import { HomeHeroCarousel } from '@/components/home/HomeHeroCarousel';
import { ProductCard } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

const SITE_URL = getSiteUrl() || DEFAULT_SITE_URL;

export const metadata: Metadata = {
  title: {
    absolute: 'Lily Luxora — Everyday Demi-Fine Jewellery',
  },
  description:
    '18K PVD Gold-Plated, Stainless Steel, Waterproof & Anti-Tarnish Demi-Fine Jewellery. Necklaces, earrings, bracelets and cuffs crafted for everyday wear.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lily Luxora — Everyday Demi-Fine Jewellery',
    description:
      '18K PVD Gold-Plated, Stainless Steel, Waterproof & Anti-Tarnish Jewellery.',
    url: '/',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lily Luxora',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-v2.png`,
  sameAs: ['https://www.instagram.com/lilyluxora'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer concierge',
      availableLanguage: ['English', 'Malayalam', 'Hindi'],
    },
  ],
};

const REVIEWS = [
  {
    id: 1,
    name: 'Anjali S.',
    quote: 'Zero tarnish even after wearing it daily in the shower. The gold tone looks genuinely fine.',
  },
  {
    id: 2,
    name: 'Meera K.',
    quote: 'Lightweight, super clean finish, and pairs effortlessly with both office and evening looks.',
  },
  {
    id: 3,
    name: 'Riya P.',
    quote: 'Fast Pan-India shipping and thoughtful packaging. My favourite everyday jewellery stop.',
  },
];

export default async function Home() {
  const [bannerSettings, categories, products] = await Promise.all([
    getHomeBannerSettings(),
    getCategories(),
    getProducts(),
  ]);

  // Build "Shop by Collection" 4-card grid matching clean Dawn layout
  const topCategories = categories.slice(0, 3);
  const collectionCards = [
    {
      name: 'Under Rs. 1,799',
      href: '/products?maxPrice=1799',
      image:
        'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113334.jpg.jpg',
    },
    ...topCategories.map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      image: cat.image,
    })),
  ].slice(0, 4);

  const featuredProducts = products.slice(0, 8);
  const storyImage =
    bannerSettings.promiseImageUrl &&
    !bannerSettings.promiseImageUrl.endsWith('.svg')
      ? bannerSettings.promiseImageUrl
      : 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113451.jpg.jpg';

  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <main className="w-full bg-white text-[#121212] overflow-x-clip">
        {/* ─── 1. HERO BANNER ───────────────────────────────────────── */}
        <HomeHeroCarousel slides={bannerSettings.slides} />

        {/* ─── 2. SHOP BY COLLECTION (2-COL MOBILE / 4-COL DESKTOP) ─── */}
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-4 sm:pb-6">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <h2 className="font-sans text-[22px] sm:text-[26px] font-normal tracking-[-0.01em] text-[#121212]">
              Shop by Collection
            </h2>
            <Link
              href="/category"
              className="text-[13px] font-sans text-[#555555] hover:text-[#121212] underline underline-offset-4 transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-8">
            {collectionCards.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex flex-col min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#121212]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 font-sans text-[14px] sm:text-[15px] font-normal text-[#121212]">
                  <span>{item.name}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3. FEATURED PRODUCTS GRID (MINIMALIST SQUARE CARDS) ─── */}
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-6 sm:pb-10">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <h2 className="font-sans text-[22px] sm:text-[26px] font-normal tracking-[-0.01em] text-[#121212]">
              Featured Collection
            </h2>
            <Link
              href="/products"
              className="text-[13px] font-sans text-[#555555] hover:text-[#121212] underline underline-offset-4 transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-9">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-[#121212] hover:bg-[#2C2C2C] text-white px-8 py-3 text-[13px] font-sans font-medium tracking-wide transition-colors"
            >
              View all products
            </Link>
          </div>
        </section>

        {/* ─── 4. BRAND PROMISE STRIP ───────────────────────────────── */}
        <section className="border-y border-[#EBEBEB] bg-[#F8F8F8] py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-[#121212] shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <h3 className="font-sans text-[13px] sm:text-sm font-medium text-[#121212]">
                  Waterproof
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Safe in showers &amp; everyday wear
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#121212] shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <h3 className="font-sans text-[13px] sm:text-sm font-medium text-[#121212]">
                  Anti-Tarnish
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Long-lasting lustre guaranteed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#121212] shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <h3 className="font-sans text-[13px] sm:text-sm font-medium text-[#121212]">
                  18K PVD Gold-Plated
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Vacuum-bonded radiant finish
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Gem className="w-5 h-5 text-[#121212] shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <h3 className="font-sans text-[13px] sm:text-sm font-medium text-[#121212]">
                  Hypoallergenic Steel
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Nickel-free surgical 316L base
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. EDITORIAL PROMISE SPLIT ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-10 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
            <div className="md:col-span-6 relative aspect-square sm:aspect-[5/4] w-full overflow-hidden bg-[#F6F6F6]">
              <Image
                src={storyImage}
                alt={bannerSettings.promiseTitle}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="md:col-span-6 space-y-4 md:pl-4">
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#555555] block">
                {bannerSettings.promiseKickerText}
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#121212]">
                {bannerSettings.promiseTitle}
              </h2>
              <p className="font-sans text-sm text-[#555555] leading-relaxed max-w-lg">
                {bannerSettings.promiseDescription}
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-[#121212] bg-white hover:bg-[#121212] hover:text-white text-[#121212] px-6 py-3 text-[13px] font-sans font-medium transition-colors"
                >
                  <span>Read our story</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. CUSTOMER NOTES ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 pb-8 sm:pb-12">
          <h2 className="font-sans text-[22px] sm:text-[26px] font-normal tracking-[-0.01em] text-[#121212] mb-5">
            Loved by Our Customers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="border border-[#EBEBEB] bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-0.5 text-[#121212]" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-sans text-[13px] sm:text-sm text-[#121212] leading-relaxed">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>
                <span className="font-sans text-xs font-medium text-[#555555]">
                  — {rev.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
