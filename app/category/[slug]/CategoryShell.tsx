'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { getProductsByCategory, type CategoryBanner } from '@/lib/api/product';
import { getSubcategories } from '@/lib/api/home';
import type { Product, Category } from '@/lib/api/home';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

interface CategoryShellProps {
  slug: string;
}

// ── Reusable Pagination ───────────────────────────────────────
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
    <div className="mt-16 flex flex-col items-center gap-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#8B7E76] font-sans">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B7A596]/40 bg-white text-[#382F2A] transition-all hover:border-[#8B7768] hover:text-[#8B7768] disabled:cursor-not-allowed disabled:opacity-30 shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {getPages().map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-10 w-10 items-center justify-center text-sm text-[#8B7E76]"
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
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-sans font-medium transition-all shadow-xs ${
                  p === currentPage
                    ? 'border-[#6D5C50] bg-[#6D5C50] text-[#F7F3ED]'
                    : 'border-[#B7A596]/40 bg-white text-[#382F2A] hover:border-[#8B7768] hover:text-[#8B7768]'
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B7A596]/40 bg-white text-[#382F2A] transition-all hover:border-[#8B7768] hover:text-[#8B7768] disabled:cursor-not-allowed disabled:opacity-30 shadow-xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {totalPages > 5 && (
        <div className="flex items-center gap-2 text-xs text-[#63574F] font-sans">
          <span className="uppercase tracking-[0.18em]">Go to page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = Math.min(totalPages, Math.max(1, Number((e.target as HTMLInputElement).value)));
                onPageChange(val);
              }
            }}
            className="w-14 rounded-full border border-[#D8CBBE] bg-white px-3 py-1.5 text-center text-xs text-[#382F2A] outline-none focus:border-[#8B7768]"
          />
        </div>
      )}
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────
export default function CategoryShell({ slug }: CategoryShellProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryBanner, setCategoryBanner] = useState<CategoryBanner | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setCurrentPage(1);
    Promise.all([
      getProductsByCategory(slug),
      getSubcategories(slug),
    ]).then(([{ products: prods, categoryName: name, categoryBanner: banner }, subs]) => {
      setProducts(prods);
      setFiltered(prods);
      setCategoryName(name);
      setCategoryBanner(banner);
      setSubcategories(subs);
      setLoading(false);
    }).catch((err) => {
      console.error('CategoryShell fetch error:', err);
      setLoading(false);
    });
  }, [slug]);

  const handleApplyFilters = (filters: { priceRange: string; sizes: string[]; sort?: string }) => {
    let result = [...products];

    if (filters.priceRange === 'under-500') result = result.filter(p => p.price < 500);
    else if (filters.priceRange === '500-1000') result = result.filter(p => p.price >= 500 && p.price <= 1000);
    else if (filters.priceRange === 'over-1000') result = result.filter(p => p.price > 1000);

    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);

    setFiltered(result);
    setCurrentPage(1); // reset to page 1 on filter change
  };

  // Pagination
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
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        {/* Category banner */}
        {categoryBanner ? (
          <section className="relative mb-10 overflow-hidden rounded-2xl bg-white border border-[#E5DACF] shadow-sm">
            <div className="relative min-h-[260px] md:min-h-[360px]">
              <Image
                src={categoryBanner.bannerImage}
                alt={categoryBanner.bannerTitle}
                fill
                className="hidden object-cover md:block"
                sizes="100vw"
              />
              <Image
                src={categoryBanner.bannerMobileImage}
                alt={categoryBanner.bannerTitle}
                fill
                className="object-cover md:hidden"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#382F2A]/70 via-[#382F2A]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
                <div className="max-w-2xl space-y-2">
                  <span className="inline-flex border border-[#D8CBBE]/70 bg-[#EFE7DE]/90 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#6D5C50] rounded-full font-sans font-medium">
                    {categoryBanner.bannerKicker || 'Lily Luxora Collection'}
                  </span>
                  <h1 className="text-3xl font-heading font-normal tracking-tight text-white md:text-5xl">
                    {categoryBanner.bannerTitle}
                  </h1>
                  {categoryBanner.bannerDescription ? (
                    <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-white/90">
                      {categoryBanner.bannerDescription}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#63574F] mb-6">
          <Link href="/" className="hover:text-[#8B7768] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <Link href="/category" className="hover:text-[#8B7768] transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <span className="text-[#382F2A] font-medium">{categoryName}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#B7A596]/40 pb-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A]">
              {categoryName}
            </h1>
            <p className="text-[#63574F] font-sans text-xs sm:text-sm mt-2">
              {loading ? (
                <span className="inline-block h-4 w-32 animate-pulse rounded bg-white" />
              ) : (
                <>
                  Showing {filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + PRODUCTS_PER_PAGE, filtered.length)} of{' '}
                  {filtered.length} demi-fine piece{filtered.length !== 1 ? 's' : ''} · 18K PVD Gold &amp; Waterproof
                </>
              )}
            </p>
          </div>
          <ProductFilters onApply={handleApplyFilters} />
        </div>

        {/* Subcategory pills */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            <span className="rounded-full px-4 py-1.5 text-xs font-sans font-semibold border border-[#6D5C50] bg-[#6D5C50] text-[#F7F3ED] shadow-xs">
              All
            </span>
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="rounded-full px-4 py-1.5 text-xs font-sans font-medium border border-[#B7A596]/40 bg-white text-[#382F2A] hover:border-[#8B7768] hover:text-[#8B7768] transition-all shadow-xs"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(PRODUCTS_PER_PAGE).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[#EFE7DE]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-[#63574F] rounded-3xl border border-[#D8CBBE] bg-white shadow-xs">
          <p className="mb-4 text-2xl font-heading text-[#382F2A]">No products in this category</p>
          <Link
            href="/category"
            className="inline-flex rounded-full bg-[#6D5C50] px-6 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.16em] text-[#F7F3ED] hover:bg-[#58483D] transition-colors"
          >
            Browse all collections
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
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
