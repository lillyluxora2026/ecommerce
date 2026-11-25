'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { FilterModal, ExtendedFilters } from '@/components/modals/FilterModal';
import type { Category } from '@/lib/api/home';

interface ProductFiltersProps {
  onApply?: (filters: ExtendedFilters) => void;
  categories?: Category[];
  value?: ExtendedFilters;
  productCount?: number;
}

export function ProductFilters({ onApply, categories, value, productCount }: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [internalFilters, setInternalFilters] = useState<ExtendedFilters>({
    priceRange: 'all',
    sizes: [],
    sort: 'featured',
    maxPrice: null,
  });

  const activeFilters = value ?? internalFilters;
  const sort = activeFilters.sort || 'featured';
  const activeFilterCount =
    (activeFilters.categoryId ? 1 : 0) +
    (activeFilters.subcategoryId ? 1 : 0) +
    (activeFilters.maxPrice ? 1 : 0) +
    (activeFilters.priceRange && activeFilters.priceRange !== 'all' ? 1 : 0);

  const handleApplyFilters = (filters: ExtendedFilters) => {
    const nextFilters = {
      ...filters,
      sort: filters.sort || sort,
    };
    if (!value) setInternalFilters(nextFilters);
    onApply?.(nextFilters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const nextFilters = { ...activeFilters, sort: newSort };
    if (!value) setInternalFilters(nextFilters);
    onApply?.(nextFilters);
  };

  return (
    <>
      <div className="flex w-full items-center justify-between gap-4 border-y border-[#EBEBEB] py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-2 text-[13px] sm:text-sm font-sans font-normal text-[#121212] hover:opacity-70 transition-opacity"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
            <span>Filter and sort</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#121212] px-1 text-[10px] font-medium text-white tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 border-l border-[#EBEBEB] pl-6">
            <label htmlFor="inline-sort" className="text-xs font-sans text-[#555555]">
              Sort by:
            </label>
            <div className="relative inline-flex items-center">
              <select
                id="inline-sort"
                value={sort}
                onChange={handleSortChange}
                className="appearance-none bg-transparent pr-5 text-xs sm:text-[13px] font-sans text-[#121212] outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
              </select>
              <ChevronDown className="pointer-events-none w-3.5 h-3.5 text-[#555555] -ml-4" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {typeof productCount === 'number' && (
          <span className="text-xs sm:text-[13px] font-sans text-[#555555] tabular-nums">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
        )}
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        categories={categories}
        initialFilters={activeFilters}
      />
    </>
  );
}
