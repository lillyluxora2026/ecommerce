'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Product, Category } from '@/lib/api/home';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import type { ExtendedFilters } from '@/components/modals/FilterModal';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DEFAULT_FILTERS: ExtendedFilters = {
  priceRange: 'all',
  sizes: [],
  sort: 'featured',
  maxPrice: null,
};

const PRODUCTS_PER_PAGE = 12;

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
          {pages.map((p, i) =>
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
                aria-label={`Go to page ${p}`}
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
  const [searchText, setSearchText] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<ExtendedFilters>(() => {
    const categorySlugParam = searchParams.get('category')?.trim().toLowerCase() || '';
    const subcategorySlugParam = searchParams.get('subcategory')?.trim().toLowerCase() || '';
    const sortParam = searchParams.get('sort')?.trim() || 'featured';
    const maxPriceParam = Number(searchParams.get('maxPrice'));

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
      maxPrice: Number.isFinite(maxPriceParam) && maxPriceParam > 0 ? maxPriceParam : null,
    };
  });
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(searchParams.get('page') || 1)));

  const deferredSearchText = useDeferredValue(searchText);
  const activeCategoryObj = useMemo(
    () => categories.find((cat) => cat.id === filters.categoryId),
    [categories, filters.categoryId]
  );

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

  useEffect(() => {
    const query = searchParams.get('search');
    if (query && query.trim().length >= 2) {
      if (typeof window !== 'undefined') {
        const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
        if (fbq) {
          fbq('track', 'Search', {
            search_string: query.trim(),
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

    return result;
  }, [deferredSearchText, filters, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const pageEnd = pageStart + PRODUCTS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageEnd);

  function handlePageChange(page: number) {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
    updateParams({ page: next === 1 ? null : String(next) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const syncFilterUrl = (nextFilters: ExtendedFilters) => {
    const cat = categories.find((c) => c.id === nextFilters.categoryId);
    const sub = cat?.subcategories?.find((s) => s.id === nextFilters.subcategoryId);
    updateParams({
      category: cat?.slug || null,
      subcategory: sub?.slug || null,
      sort: nextFilters.sort && nextFilters.sort !== 'featured' ? nextFilters.sort : null,
      maxPrice: nextFilters.maxPrice ? String(nextFilters.maxPrice) : null,
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
    setFilters({ ...DEFAULT_FILTERS, categoryId: '', subcategoryId: '', maxPrice: null });
    setSearchText('');
    setFiltersResetKey((k) => k + 1);
    setCurrentPage(1);
    updateParams({ search: null, category: null, subcategory: null, sort: null, maxPrice: null, page: null });
  };

  const pageHeading = filters.maxPrice
    ? `Under Rs. ${filters.maxPrice.toLocaleString('en-IN')}`
    : activeCategoryObj
      ? activeCategoryObj.name
      : 'All Jewellery';

  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Minimal Header */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-[-0.01em] text-[#121212]">
            {pageHeading}
          </h1>
        </div>

        {/* Search & Quick Category Links */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2.5 border border-[#E5E5E5] bg-[#FAFAFA] px-3.5 py-2.5 focus-within:border-[#121212] transition-colors">
            <Search className="h-4 w-4 shrink-0 text-[#555555]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                const nextSearch = e.target.value;
                setSearchText(nextSearch);
                setCurrentPage(1);
                updateParams({ search: nextSearch.trim() || null, page: null });
              }}
              placeholder="Search necklaces, bracelets, earrings..."
              className="w-full bg-transparent text-xs sm:text-sm font-sans outline-none placeholder:text-[#737373] text-[#121212]"
            />
            {searchText || filters.categoryId || filters.subcategoryId || filters.maxPrice || (filters.priceRange && filters.priceRange !== 'all') ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1 text-[#555555] hover:text-[#121212] transition-colors"
                aria-label="Clear search and filters"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Category filter">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                aria-pressed={!filters.categoryId && !filters.maxPrice}
                className={`px-3.5 py-1.5 text-xs font-sans transition-colors border ${
                  !filters.categoryId && !filters.maxPrice
                    ? 'bg-[#121212] text-white border-[#121212]'
                    : 'bg-white text-[#121212] border-[#E5E5E5] hover:border-[#121212]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const isActive = filters.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-1.5 text-xs font-sans transition-colors border ${
                      isActive
                        ? 'bg-[#121212] text-white border-[#121212]'
                        : 'bg-white text-[#121212] border-[#E5E5E5] hover:border-[#121212]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {filters.maxPrice ? (
                <button
                  type="button"
                  onClick={() => handleApplyFilters({ ...filters, maxPrice: null })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans bg-[#121212] text-white border border-[#121212]"
                >
                  <span>Under Rs. {filters.maxPrice.toLocaleString('en-IN')}</span>
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          )}

          {activeCategoryObj?.subcategories && activeCategoryObj.subcategories.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleSubcategorySelect('')}
                className={`px-3 py-1 text-xs font-sans border transition-colors ${
                  !filters.subcategoryId
                    ? 'bg-[#F3F3F3] text-[#121212] border-[#121212]'
                    : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#121212]'
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
                    className={`px-3 py-1 text-xs font-sans border transition-colors ${
                      isSubActive
                        ? 'bg-[#F3F3F3] text-[#121212] border-[#121212]'
                        : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#121212]'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Dawn-Style Filter & Sort + Count Bar */}
        <div className="mb-5 sm:mb-7">
          <ProductFilters
            key={filtersResetKey}
            onApply={handleApplyFilters}
            categories={categories}
            value={filters}
            productCount={filtered.length}
          />
        </div>

        {/* Clean 2-col Mobile / 4-col Desktop Product Grid */}
        {filtered.length === 0 ? (
          <div className="border border-[#EBEBEB] bg-white py-20 text-center text-[#555555]">
            <p className="mb-2 text-lg font-sans text-[#121212]">No jewellery found</p>
            <p className="mb-6 text-xs text-[#737373]">
              Try adjusting your search or filters to see more pieces.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="bg-[#121212] text-white px-6 py-2.5 text-xs font-sans font-medium tracking-wide hover:bg-[#2C2C2C] transition-colors"
            >
              Clear filters
            </button>
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
