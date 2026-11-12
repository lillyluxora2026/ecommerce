'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterModal, ExtendedFilters } from '@/components/modals/FilterModal';
import type { Category } from '@/lib/api/home';

interface ProductFiltersProps {
  onApply?: (filters: ExtendedFilters) => void;
  categories?: Category[];
  value?: ExtendedFilters;
}

export function ProductFilters({ onApply, categories, value }: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [internalFilters, setInternalFilters] = useState<ExtendedFilters>({
    priceRange: 'all',
    sizes: [],
    sort: 'featured',
  });

  const activeFilters = value ?? internalFilters;
  const sort = activeFilters.sort || 'featured';
  const activeFilterCount =
    (activeFilters.categoryId ? 1 : 0) +
    (activeFilters.subcategoryId ? 1 : 0) +
    (activeFilters.priceRange && activeFilters.priceRange !== 'all' ? 1 : 0);

  const handleApplyFilters = (filters: ExtendedFilters) => {
    const nextFilters = { ...filters, sort };
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
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#D8CBBE] bg-white px-5 py-2.5 text-[#382F2A] hover:border-[#8B7768] hover:bg-[#EFE7DE]/60 transition-colors text-xs font-sans font-medium tracking-wide"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B7768]" />
          <span>Filter</span>
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6D5C50] px-1.5 text-[10px] font-semibold text-[#F7F3ED]">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        
        <div className="rounded-full border border-[#D8CBBE] bg-white px-5 py-2.5 hover:border-[#8B7768] transition-colors">
          <select 
            value={sort}
            onChange={handleSortChange}
            aria-label="Sort products"
            className="bg-transparent appearance-none outline-none text-xs font-sans font-medium tracking-wide cursor-pointer pr-4 text-[#382F2A]"
          >
            <option value="featured">Featured</option>
            <option value="new">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
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
