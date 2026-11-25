'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api/home';
import type { Category } from '@/lib/api/home';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

const FEATURED_CATEGORIES = [
  {
    name: 'Under Rs. 1,799',
    href: '/products?maxPrice=1799',
    image: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113334.jpg.jpg',
  },
  {
    name: 'Necklaces',
    href: '/category/necklaces',
    image: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113317.jpg.jpg',
  },
  {
    name: 'Bracelets',
    href: '/category/bracelets',
    image: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113451.jpg.jpg',
  },
  {
    name: 'Earrings',
    href: '/category/earrings',
    image: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113218.jpg.jpg',
  },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs font-sans text-[#555555]">
          <Link href="/" className="transition-colors hover:text-[#121212]">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <span className="text-[#121212]">Collections</span>
        </nav>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-[-0.01em] text-[#121212]">
            Shop by Collection
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-sans text-[#555555] max-w-xl">
            Waterproof, anti-tarnish 18K PVD gold-plated jewellery crafted for everyday wear.
          </p>
        </div>

        {/* 4 Clean Square Collection Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-8 mb-14">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#121212]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 font-sans text-[14px] sm:text-[15px] font-normal text-[#121212]">
                <span>{cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>

        {/* Dynamic Category List with Subcategories */}
        {categories.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-[#EBEBEB]">
            <h2 className="font-sans text-xl sm:text-2xl font-normal text-[#121212]">
              All Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-[#EBEBEB] bg-white p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-sans text-base font-medium text-[#121212]">
                        {cat.name}
                      </h3>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-sans text-[#121212] hover:underline underline-offset-4"
                      >
                        <span>Shop</span>
                        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                      </Link>
                    </div>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3.5">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${sub.slug}`}
                            className="border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-1.5 text-xs font-sans text-[#121212] hover:border-[#121212] hover:bg-white transition-colors"
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
