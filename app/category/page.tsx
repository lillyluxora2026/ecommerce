'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api/home';
import type { Category } from '@/lib/api/home';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

const FEATURED_CATEGORIES = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Delicate clover pendants, timeless chains, and layered statement necklaces in 18K PVD gold.',
    image: '/images/placeholders/cat-necklaces.svg',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Chunky huggies, twisted gold hoops, and sparkling studs designed for everyday comfort.',
    image: '/images/placeholders/cat-earrings.svg',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Waterproof charm chains, sculpted bangles, and dainty wrist stacks made to never tarnish.',
    image: '/images/placeholders/cat-bracelets.svg',
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Pavé crystal bands, minimal gold bands, and stackable statement rings in skin-friendly steel.',
    image: '/images/placeholders/cat-rings.svg',
  },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-sans text-[#63574F]">
          <Link href="/" className="transition-colors hover:text-[#8B7768]">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <span className="text-[#382F2A] font-medium">Collections</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 border-b border-[#B7A596]/40 pb-8 text-center max-w-2xl mx-auto">
          <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-2 block">
            Lily Luxora
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-3">
            The Collections
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#63574F] leading-relaxed">
            Curated demi-fine jewellery crafted with 18K PVD gold-plated stainless steel. Designed to be 100% waterproof, anti-tarnish, and hypoallergenic for everyday luxury.
          </p>
        </div>

        {/* 4 Signature Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E5DACF] shadow-sm hover:border-[#8B7768]/60 transition-all p-3"
            >
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#EAE1D7]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="pt-3 pb-1 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-normal text-[#382F2A] group-hover:text-[#8B7768] transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#8B7768] transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 text-[11px] font-sans text-[#63574F] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dynamic Category List with Subcategories */}
        {categories.length > 0 && (
          <div className="space-y-12 pt-6 border-t border-[#B7A596]/40">
            <h2 className="font-heading text-2xl font-normal text-[#382F2A] text-center">
              Explore All Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-[#E5DACF] bg-white p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading text-xl font-normal text-[#382F2A]">
                        {cat.name}
                      </h3>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-xs font-sans font-medium text-[#8B7768] hover:text-[#58483D] underline underline-offset-4"
                      >
                        Shop All →
                      </Link>
                    </div>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${sub.slug}`}
                            className="rounded-full border border-[#B7A596]/40 bg-[#F7F3ED] px-3 py-1 text-xs font-sans text-[#382F2A] hover:bg-[#8B7768] hover:text-white transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}