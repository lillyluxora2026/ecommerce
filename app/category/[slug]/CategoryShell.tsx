'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { getProductsByCategory, type CategoryBanner } from '@/lib/api/product';
import { getSubcategories } from '@/lib/api/home';
import type { Product, Category } from '@/lib/api/home';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import type { ExtendedFilters } from '@/components/modals/FilterModal';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

interface CategoryShellProps {
  slug: string;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="mt-14 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center border border-[#E5E5E5] bg-white text-[#121212] transition-colors hover:border-[#121212] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-1.5">
          {getPages().map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-[#737373]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`flex h-9 w-9 items-center justify-center border text-xs font-sans transition-colors tabular-nums ${
                  p === currentPage
                    ? 'border-[#121212] bg-[#121212] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#121212] hover:border-[#121212]'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center border border-[#E5E5E5] bg-white text-[#121212] transition-colors hover:border-[#121212] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function CategoryShell({ slug }: CategoryShellProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryBanner, setCategoryBanner] = useState<CategoryBanner | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<ExtendedFilters>({
    priceRange: 'all',
    sizes: [],
    sort: 'featured',
    maxPrice: null,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    Promise.all([getProductsByCategory(slug), getSubcategories(slug)])
      .then(([{ products: prods, categoryName: name, categoryBanner: banner }, subs]) => {
        if (cancelled) return;
        setProducts(prods);
        setFiltered(prods);
        setCategoryName(name);
        setCategoryBanner(banner);
        setSubcategories(subs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('CategoryShell fetch error:', err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleApplyFilters = (filters: ExtendedFilters) => {
    setActiveFilters(filters);
    let result = [...products];

    if (filters.maxPrice && filters.maxPrice > 0) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.priceRange === 'under-500') result = result.filter((p) => p.price < 500);
    else if (filters.priceRange === '500-1000') result = result.filter((p) => p.price >= 500 && p.price <= 1000);
    else if (filters.priceRange === 'over-1000') result = result.filter((p) => p.price > 1000);
    else if (filters.priceRange === 'under-1799') result = result.filter((p) => p.price <= 1799);
    else if (filters.priceRange === '1799-2000') result = result.filter((p) => p.price > 1799 && p.price <= 2000);
    else if (filters.priceRange === 'over-2000') result = result.filter((p) => p.price > 2000);

    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);

    setFiltered(result);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const paginated = useMemo(
    () => filtered.slice(pageStart, pageStart + PRODUCTS_PER_PAGE),
    [filtered, pageStart]
  );

  function handlePageChange(page: number) {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Clean Category Title Banner if banner image exists */}
        {categoryBanner ? (
          <section className="relative mb-6 overflow-hidden bg-[#F6F6F6]">
            <div className="relative h-[200px] sm:h-[260px] md:h-[300px]">
              {categoryBanner.bannerMobileImage &&
              categoryBanner.bannerMobileImage !== categoryBanner.bannerImage ? (
                <>
                  <Image
                    src={categoryBanner.bannerImage}
                    alt={categoryBanner.bannerTitle}
                    fill
                    priority
                    fetchPriority="high"
                    className="hidden object-cover md:block"
                    sizes="(min-width: 768px) 100vw, 1px"
                  />
                  <Image
                    src={categoryBanner.bannerMobileImage}
                    alt={categoryBanner.bannerTitle}
                    fill
                    priority
                    fetchPriority="high"
                    className="object-cover md:hidden"
                    sizes="(max-width: 767px) 100vw, 1px"
                  />
                </>
              ) : (
                <Image
                  src={categoryBanner.bannerImage}
                  alt={categoryBanner.bannerTitle}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover"
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
                <div className="max-w-xl space-y-1.5">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/85 font-sans font-medium block">
                    {categoryBanner.bannerKicker || 'Collection'}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-sans font-normal tracking-tight text-white">
                    {categoryBanner.bannerTitle}
                  </h1>
                  {categoryBanner.bannerDescription ? (
                    <p className="max-w-lg text-xs sm:text-sm leading-relaxed text-white/90 line-clamp-2">
                      {categoryBanner.bannerDescription}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-[-0.01em] text-[#121212]">
              {categoryName || 'Collection'}
            </h1>
          </div>
        )}

        {/* Subcategory pills */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-3.5 py-1.5 text-xs font-sans border border-[#121212] bg-[#121212] text-white">
              All
            </span>
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="px-3.5 py-1.5 text-xs font-sans border border-[#E5E5E5] bg-white text-[#121212] hover:border-[#121212] transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Minimalist Toolbar matching Screenshot 1 */}
        <div className="mb-5 sm:mb-7">
          <ProductFilters
            onApply={handleApplyFilters}
            value={activeFilters}
            productCount={loading ? undefined : filtered.length}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-9">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="aspect-square animate-pulse bg-[#F3F3F3]" />
                  <div className="h-3.5 w-3/4 animate-pulse bg-[#F3F3F3]" />
                  <div className="h-3.5 w-1/2 animate-pulse bg-[#F3F3F3]" />
                </div>
              ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#555555] border border-[#EBEBEB] bg-white">
            <p className="mb-4 text-lg font-sans text-[#121212]">No products in this collection</p>
            <Link
              href="/products"
              className="inline-flex bg-[#121212] px-6 py-2.5 text-xs font-sans font-medium tracking-wide text-white hover:bg-[#2C2C2C] transition-colors"
            >
              Browse all jewellery
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-9">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </main>
  );
}
