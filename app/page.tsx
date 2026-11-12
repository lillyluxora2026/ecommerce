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
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { DEFAULT_SITE_URL, getSiteUrl } from '@/lib/server/site-url';

const SITE_URL = getSiteUrl() || DEFAULT_SITE_URL;

export const metadata: Metadata = {
  title: {
    absolute: 'Lily Luxora — Everyday Elegance, Made to Last',
  },
  description:
    '18K PVD Gold-Plated, Stainless Steel, Waterproof & Anti-Tarnish Demi-Fine Jewellery. Necklaces, earrings, bracelets and rings crafted for everyday luxury.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lily Luxora — Everyday Elegance, Made to Last',
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
  logo: `${SITE_URL}/logo.svg`,
  sameAs: ['https://www.instagram.com/lilyluxora'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer concierge',
      availableLanguage: ['English', 'Malayalam', 'Hindi'],
    },
  ],
};

const CATEGORIES = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    image: '/images/placeholders/cat-necklaces.svg',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    image: '/images/placeholders/cat-earrings.svg',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    image: '/images/placeholders/cat-bracelets.svg',
  },
  {
    name: 'Rings',
    slug: 'rings',
    image: '/images/placeholders/cat-rings.svg',
  },
];

const BESTSELLERS = [
  {
    id: 'pearl-clover-necklace',
    name: 'Pearl Clover Necklace',
    slug: 'pearl-clover-necklace',
    price: 1299,
    rating: 4.9,
    reviews: 128,
    image: '/images/placeholders/prod-pearl-clover.svg',
  },
  {
    id: 'twisted-hoop-earrings',
    name: 'Twisted Hoop Earrings',
    slug: 'twisted-hoop-earrings',
    price: 899,
    rating: 4.8,
    reviews: 96,
    image: '/images/placeholders/prod-twisted-hoops.svg',
  },
  {
    id: 'ocean-charm-bracelet',
    name: 'Ocean Charm Bracelet',
    slug: 'ocean-charm-bracelet',
    price: 1499,
    rating: 4.9,
    reviews: 72,
    image: '/images/placeholders/prod-ocean-charm.svg',
  },
  {
    id: 'dual-band-crystal-ring',
    name: 'Dual Band Crystal Ring',
    slug: 'dual-band-crystal-ring',
    price: 999,
    rating: 4.8,
    reviews: 64,
    image: '/images/placeholders/prod-dual-band.svg',
  },
];

const REVIEWS = [
  {
    id: 1,
    name: 'Anjali S.',
    avatar: '/images/placeholders/avatar-anjali.svg',
    quote: 'The quality is amazing! Totally waterproof and still looks brand new.',
  },
  {
    id: 2,
    name: 'Meera K.',
    avatar: '/images/placeholders/avatar-meera.svg',
    quote: 'Elegant, lightweight and perfect for everyday wear. Highly recommend!',
  },
  {
    id: 3,
    name: 'Riya P.',
    avatar: '/images/placeholders/avatar-riya.svg',
    quote: 'Beautiful collection and super fast delivery. Lily Luxora is now my go-to!',
  },
];

const INSTAGRAM_POSTS = [
  { id: 1, image: '/images/placeholders/ig-1.svg' },
  { id: 2, image: '/images/placeholders/ig-2.svg' },
  { id: 3, image: '/images/placeholders/ig-3.svg' },
  { id: 4, image: '/images/placeholders/ig-4.svg' },
  { id: 5, image: '/images/placeholders/ig-5.svg' },
  { id: 6, image: '/images/placeholders/ig-6.svg' },
];

function SectionHeader({
  title,
  rightAction,
}: {
  title: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center my-4 sm:my-5">
      <div className="flex items-center gap-3 sm:gap-4 text-center">
        {/* Left tapered line flourish */}
        <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-r from-transparent via-[#B7A596] to-[#B7A596]" />
        <h2 className="font-heading text-2xl sm:text-[28px] lg:text-[30px] font-normal text-[#382F2A] italic tracking-[0.02em]">
          {title}
        </h2>
        {/* Right tapered line flourish */}
        <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-l from-transparent via-[#B7A596] to-[#B7A596]" />
      </div>
      {rightAction && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {rightAction}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <main className="w-full bg-[#F7F3ED] text-[#382F2A] overflow-hidden">
        {/* ─── 1. HERO SECTION (EDITORIAL SPLIT + PLACEHOLDER) ──────────────── */}
        <section className="relative w-full bg-gradient-to-r from-[#EFE6DC] via-[#F4EDE4] to-[#E6DACD] border-b border-[#D8CBBE]/60 overflow-hidden">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-4 sm:space-y-5 z-10">
              <span className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.26em] text-[#8B7768]">
                Demi-Fine Jewellery
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-normal italic leading-[1.08] tracking-tight text-[#382F2A]">
                Everyday Elegance,
                <br />
                Made to Last
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#63574F] leading-relaxed max-w-md">
                18K PVD Gold-Plated &bull; Stainless Steel
                <br />
                Waterproof &amp; Anti-Tarnish Jewellery
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-7 py-3 text-xs sm:text-sm font-sans font-medium tracking-wide transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <span>Shop the Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center gap-2 pt-3" aria-hidden="true">
                <span className="w-5 h-1.5 rounded-full bg-[#6D5C50]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7A596]/70" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7A596]/70" />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[14/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D8CBBE] bg-[#EFE7DE] shadow-sm">
                <Image
                  src="/images/placeholders/hero-editorial.svg"
                  alt="Lily Luxora — Hero Campaign Placeholder"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. SHOP BY CATEGORY ───────────────────────────────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
          <SectionHeader title="Shop by Category" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mt-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#EAE1D7] border border-[#E0D4C6] shadow-sm">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-106"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="flex items-center gap-1.5 font-heading text-base sm:text-[17px] text-[#382F2A] group-hover:text-[#8B7768] transition-colors mt-1">
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 3. BRAND BENEFITS STRIP ───────────────────────────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="rounded-2xl bg-[#EFE7DE] border border-[#D8CBBE] px-6 py-4 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5">
              <Droplets className="w-6 h-6 text-[#8B7768] stroke-[1.6] shrink-0" />
              <div className="flex flex-col">
                <span className="font-sans text-xs sm:text-[13px] font-semibold text-[#382F2A]">
                  Waterproof
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#63574F]">
                  Wear it every day
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Shield className="w-6 h-6 text-[#8B7768] stroke-[1.6] shrink-0" />
              <div className="flex flex-col">
                <span className="font-sans text-xs sm:text-[13px] font-semibold text-[#382F2A]">
                  Anti-Tarnish
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#63574F]">
                  Long-lasting shine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Sparkles className="w-6 h-6 text-[#8B7768] stroke-[1.6] shrink-0" />
              <div className="flex flex-col">
                <span className="font-sans text-xs sm:text-[13px] font-semibold text-[#382F2A]">
                  18K PVD Gold-Plated
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#63574F]">
                  Premium &amp; durable finish
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Gem className="w-6 h-6 text-[#8B7768] stroke-[1.6] shrink-0" />
              <div className="flex flex-col">
                <span className="font-sans text-xs sm:text-[13px] font-semibold text-[#382F2A]">
                  Stainless Steel
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#63574F]">
                  Skin-friendly &amp; durable
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. BESTSELLERS ────────────────────────────────────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
          <SectionHeader
            title="Bestsellers"
            rightAction={
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors underline underline-offset-4"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mt-4">
            {BESTSELLERS.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E5DACF] shadow-sm hover:border-[#8B7768]/60 transition-all p-3"
              >
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F7F3ED]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <button
                    type="button"
                    aria-label="Add to Wishlist"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#382F2A] border border-[#B7A596]/30 shadow-xs transition-transform hover:scale-110 hover:text-[#8B7768]"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2.5 pb-0.5 flex flex-col gap-1 flex-1 justify-between">
                  <div>
                    <h3 className="font-sans text-xs sm:text-[13px] font-semibold text-[#382F2A] line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-sans text-sm sm:text-base font-bold text-[#382F2A]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-sans text-[#63574F]">
                        <Star className="w-3 h-3 text-[#C5A574] fill-[#C5A574]" />
                        <span className="font-medium text-[#382F2A]">{item.rating}</span>
                        <span className="text-[#8B7E76]">({item.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/product/${item.slug}`}
                    className="mt-2.5 w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-2 px-3 text-[11px] font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. NEW ARRIVALS CAMPAIGN BANNER ────────────────────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center rounded-2xl sm:rounded-3xl overflow-hidden bg-[#EFE6DC] border border-[#E0D4C6] shadow-sm">
            <div className="md:col-span-7 relative aspect-[2/1] w-full h-full min-h-[200px]">
              <Image
                src="/images/placeholders/new-arrivals-banner.svg"
                alt="New Arrivals — The Latest in Timeless Shine"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>

            <div className="md:col-span-5 flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10 space-y-3">
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768]">
                New Arrivals
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-normal italic leading-tight text-[#382F2A]">
                The Latest in
                <br />
                Timeless Shine
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#63574F]">
                Fresh pieces for your every mood.
              </p>
              <div className="pt-1">
                <Link
                  href="/products?sort=new"
                  className="inline-flex items-center gap-2 rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium tracking-wide transition-all shadow-sm"
                >
                  <span>Shop New Arrivals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. CUSTOMER REVIEWS (LOVED BY OUR CUSTOMERS) ───────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
          <SectionHeader title="Loved by Our Customers" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 mt-4">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E5DACF] p-4 sm:p-5 shadow-xs"
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#B7A596]/40 shrink-0 bg-[#E0D4C6]">
                  <Image
                    src={rev.avatar}
                    alt={rev.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-0.5 text-[#C5A574]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-sans text-[11px] sm:text-xs text-[#382F2A] italic leading-snug line-clamp-2">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                  <span className="font-sans text-[10px] font-medium text-[#8B7768]">
                    — {rev.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7. INSTAGRAM GALLERY (AS SEEN ON INSTAGRAM) ─────────────── */}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <SectionHeader
            title="As Seen on Instagram"
            rightAction={
              <a
                href="https://www.instagram.com/lilyluxora/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-sans font-medium text-[#382F2A] hover:text-[#8B7768] transition-colors underline underline-offset-4"
              >
                <span>@lilyluxora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            }
          />

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mt-4">
            {INSTAGRAM_POSTS.map((item) => (
              <a
                key={item.id}
                href="https://www.instagram.com/lilyluxora/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#EBE2D8] border border-[#E0D4C6] shadow-xs block transition-transform duration-300 hover:-translate-y-1"
              >
                <Image
                  src={item.image}
                  alt={`Lily Luxora Instagram post ${item.id}`}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-106"
                  sizes="(max-width: 640px) 33vw, 16vw"
                />
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}