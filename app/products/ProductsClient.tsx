'use client';

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Product, Category } from '@/lib/api/home';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import type { ExtendedFilters } from '@/components/modals/FilterModal';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DEFAULT_FILTERS: ExtendedFilters = {
  priceRange: 'all',
  sizes: [],
  sort: 'featured',
};

const PRODUCTS_PER_PAGE = 12;

// ── Search normalization ──────────────────────────────────────
// "anti tarnish", "antitarnish", "anti-tarnish" all match the same products
function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesSearch(product: Product, query: string) {
  if (!query) return true;
  const normalizedQuery = normalizeForSearch(query);
  const searchableText = normalizeForSearch(
    [
      product.name,
      product.brand,
      product.material,
      product.collection,
      ...(product.variants?.flatMap((v) => Object.values(v.options || {})) || []),
    ]
      .filter(Boolean)
      .join(' ')
  );
  return searchableText.includes(normalizedQuery);
}

function matchesSelectedSizes(product: Product, sizes: string[]) {
  if (sizes.length === 0) return true;
  return (
    product.variants?.some((v) =>
      Object.values(v.options || {}).some((val) => sizes.includes(String(val).toUpperCase()))
    ) ?? false
  );
}

// ── Pagination component ──────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  function getPageNumbers() {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  const pages = getPageNumbers();

  return (
    <div className="mt-16 flex flex-col items-center gap-4">
      {/* Page info text */}
      <p className="text-xs uppercase tracking-[0.24em] text-[#8B7E76] font-sans">
        Page {currentPage} of {totalPages}
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B7A596]/40 bg-white text-[#382F2A] transition-all hover:border-[#8B7768] hover:text-[#8B7768] disabled:cursor-not-allowed disabled:opacity-30 shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1.5">
          {pages.map((p, i) =>
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
                aria-label={`Go to page ${p}`}
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

        {/* Next */}
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

      {/* Jump to page — only show if more than 5 pages */}
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

// ── Main page ──────────────────────────────────────────────────
export function ProductsClient({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading] = useState(false);
  const [searchText, setSearchText] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<ExtendedFilters>(() => {
    const categorySlugParam = searchParams.get('category')?.trim().toLowerCase() || '';
    const subcategorySlugParam = searchParams.get('subcategory')?.trim().toLowerCase() || '';
    const sortParam = searchParams.get('sort')?.trim() || 'featured';

    const matchedCategory = categorySlugParam
      ? initialCategories.find(
          (cat) => cat.slug.toLowerCase() === categorySlugParam || cat.id === categorySlugParam
        )
      : undefined;
    const matchedSubcategory =
      matchedCategory && subcategorySlugParam
        ? matchedCategory.subcategories?.find(
            (sub) => sub.slug.toLowerCase() === subcategorySlugParam || sub.id === subcategorySlugParam
          )
        : undefined;

    return {
      priceRange: 'all',
      sizes: [],
      categoryId: matchedCategory?.id || '',
      subcategoryId: matchedSubcategory?.id || '',
      sort: sortParam,
    };
  });
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(searchParams.get('page') || 1)));

  const deferredSearchText = useDeferredValue(searchText);
  const activeCategoryObj = useMemo(
    () => categories.find((cat) => cat.id === filters.categoryId),
    [categories, filters.categoryId]
  );

  // Sync URL params
  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  // Data is fetched on the server now.

  // Track Search events
  useEffect(() => {
    const query = searchParams.get('search');
    if (query && query.trim().length >= 2) {
      if (typeof window !== 'undefined') {
        const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
        if (fbq) {
          fbq('track', 'Search', {
            search_string: query.trim()
          });
        }
      }
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (deferredSearchText.trim()) {
      result = result.filter((p) => matchesSearch(p, deferredSearchText));
    }

    if (filters.categoryId) {
      result = result.filter(
        (p) => p.categoryId === filters.categoryId || p.parentCategoryId === filters.categoryId
      );
    }

    if (filters.subcategoryId) {
      result = result.filter((p) => p.categoryId === filters.subcategoryId);
    }

    if (filters.sizes.length > 0) {
      result = result.filter((p) => matchesSelectedSizes(p, filters.sizes));
    }

    if (filters.priceRange === 'under-500') result = result.filter((p) => p.price < 500);
    else if (filters.priceRange === '500-1000') result = result.filter((p) => p.price >= 500 && p.price <= 1000);
    else if (filters.priceRange === 'over-1000') result = result.filter((p) => p.price > 1000);

    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [deferredSearchText, filters, products]);

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageEnd = pageStart + PRODUCTS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageEnd);

  function handlePageChange(page: number) {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
    updateParams({ page: next === 1 ? null : String(next) });
    // Smooth scroll to top of product grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const syncFilterUrl = (nextFilters: ExtendedFilters) => {
    const cat = categories.find((c) => c.id === nextFilters.categoryId);
    const sub = cat?.subcategories?.find((s) => s.id === nextFilters.subcategoryId);
    updateParams({
      category: cat?.slug || null,
      subcategory: sub?.slug || null,
      sort: nextFilters.sort && nextFilters.sort !== 'featured' ? nextFilters.sort : null,
      page: null,
    });
  };

  const handleApplyFilters = (nextFilters: ExtendedFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
    syncFilterUrl(nextFilters);
  };

  const handleCategorySelect = (categoryId: string) => {
    const nextFilters: ExtendedFilters = {
      ...filters,
      categoryId,
      subcategoryId: '',
    };
    setFilters(nextFilters);
    setCurrentPage(1);
    syncFilterUrl(nextFilters);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const nextFilters: ExtendedFilters = {
      ...filters,
      subcategoryId,
    };
    setFilters(nextFilters);
    setCurrentPage(1);
    syncFilterUrl(nextFilters);
  };

  const handleClearAll = () => {
    setFilters({ ...DEFAULT_FILTERS, categoryId: '', subcategoryId: '' });
    setSearchText('');
    setFiltersResetKey((k) => k + 1);
    setCurrentPage(1);
    updateParams({ search: null, category: null, subcategory: null, sort: null, page: null });
  };

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-sans text-[#63574F]">
          <Link href="/" className="transition-colors hover:text-[#8B7768]">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <span className="text-[#382F2A] font-medium">All Jewellery</span>
        </nav>

        {/* Header + filters */}
        <div className="mb-8 flex flex-col gap-5 border-b border-[#B7A596]/40 pb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-[#8B7768] text-xs font-sans uppercase tracking-[0.22em] font-medium block mb-1">
                {activeCategoryObj ? `${activeCategoryObj.name} Collection` : 'The Complete Catalogue'}
              </span>
              <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A]">
                {activeCategoryObj ? activeCategoryObj.name : 'All Jewellery'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-sans text-[#63574F]">
                {loading ? (
                  <span className="inline-block h-4 w-48 animate-pulse rounded bg-white" />
                ) : (
                  <>
                    Showing {filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageEnd, filtered.length)} of{' '}
                    {filtered.length} demi-fine piece{filtered.length !== 1 ? 's' : ''}
                    {searchText.trim() ? ` for "${searchText.trim()}"` : ''} · 18K PVD Gold &amp; Waterproof
                  </>
                )}
              </p>
            </div>
            <ProductFilters key={filtersResetKey} onApply={handleApplyFilters} categories={categories} value={filters} />
          </div>

          {/* Search bar */}
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white p-3.5 md:p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 shrink-0 text-[#8B7768]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  const nextSearch = e.target.value;
                  setSearchText(nextSearch);
                  setCurrentPage(1);
                  updateParams({ search: nextSearch.trim() || null, page: null });
                }}
                placeholder="Search necklaces, earrings, bracelets, rings, 18K gold, waterproof..."
                className="w-full bg-transparent text-xs sm:text-sm font-sans outline-none placeholder:text-[#8B7E76] text-[#382F2A]"
              />
              {searchText || filters.categoryId || filters.subcategoryId || (filters.priceRange && filters.priceRange !== 'all') ? (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-full border border-[#B7A596]/40 p-1.5 text-[#63574F] transition-colors hover:border-[#8B7768] hover:text-[#8B7768]"
                  aria-label="Clear search and filters"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Category Filter Strip */}
          {categories.length > 0 && (
            <div className="space-y-2.5" role="region" aria-label="Category filter">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('')}
                  aria-pressed={!filters.categoryId}
                  className={`rounded-full px-4 py-2 text-xs font-sans font-medium transition-all ${
                    !filters.categoryId
                      ? 'bg-[#6D5C50] text-[#F7F3ED] shadow-xs border border-[#6D5C50]'
                      : 'bg-white text-[#382F2A] border border-[#D8CBBE] hover:border-[#8B7768] hover:bg-[#EFE7DE]/60'
                  }`}
                >
                  All Jewellery
                </button>
                {categories.map((cat) => {
                  const isActive = filters.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      aria-pressed={isActive}
                      className={`rounded-full px-4 py-2 text-xs font-sans font-medium transition-all ${
                        isActive
                          ? 'bg-[#6D5C50] text-[#F7F3ED] shadow-xs border border-[#6D5C50]'
                          : 'bg-white text-[#382F2A] border border-[#D8CBBE] hover:border-[#8B7768] hover:bg-[#EFE7DE]/60'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Subcategory Pills when active category has children */}
              {activeCategoryObj?.subcategories && activeCategoryObj.subcategories.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-sans uppercase tracking-[0.16em] text-[#8B7E76] mr-1">
                    Refine:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSubcategorySelect('')}
                    aria-pressed={!filters.subcategoryId}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-sans font-medium transition-all ${
                      !filters.subcategoryId
                        ? 'bg-[#EFE7DE] text-[#382F2A] border border-[#8B7768]'
                        : 'bg-white/80 text-[#63574F] border border-[#D8CBBE] hover:border-[#8B7768]'
                    }`}
                  >
                    All {activeCategoryObj.name}
                  </button>
                  {activeCategoryObj.subcategories.map((sub) => {
                    const isSubActive = filters.subcategoryId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubcategorySelect(sub.id)}
                        aria-pressed={isSubActive}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-sans font-medium transition-all ${
                          isSubActive
                            ? 'bg-[#EFE7DE] text-[#382F2A] border border-[#8B7768]'
                            : 'bg-white/80 text-[#63574F] border border-[#D8CBBE] hover:border-[#8B7768]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array(PRODUCTS_PER_PAGE).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/70 border border-[#E5DACF]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-[#B7A596]/40 bg-white rounded-2xl py-24 text-center text-[#63574F] shadow-sm">
            <p className="mb-2 text-xl font-heading text-[#382F2A]">No jewellery found</p>
            <p className="mb-6 text-xs text-[#8B7E76]">Try adjusting your search or filters to explore more of our collection.</p>
            <button
              onClick={handleClearAll}
              className="rounded-full bg-[#6D5C50] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium tracking-wide transition-colors hover:bg-[#58483D]"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
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


