'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '@/lib/api/home';

export interface ExtendedFilters {
  priceRange: string;
  sizes: string[];
  categoryId?: string;
  subcategoryId?: string;
  sort?: string;
  maxPrice?: number | null;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ExtendedFilters) => void;
  categories?: Category[];
  initialFilters?: ExtendedFilters;
}

function FilterModalContent({
  onClose,
  onApply,
  categories,
  initialFilters,
}: Omit<FilterModalProps, 'isOpen'>) {
  const [priceRange, setPriceRange] = useState<string>(initialFilters?.priceRange || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters?.categoryId || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialFilters?.subcategoryId || '');
  const [sort, setSort] = useState<string>(initialFilters?.sort || 'featured');
  const [maxPrice, setMaxPrice] = useState<number | null>(initialFilters?.maxPrice ?? null);

  const handleApply = () => {
    onApply({
      priceRange,
      sizes: [],
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      sort,
      maxPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-sm h-full bg-white border-l border-[#EBEBEB] flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <h2 className="text-base font-sans font-medium text-[#121212]">Filter and sort</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7 text-sm font-sans">
          {/* Sort Selector */}
          <div className="space-y-3">
            <label htmlFor="modal-sort" className="block text-xs font-medium uppercase tracking-[0.12em] text-[#555555]">
              Sort by
            </label>
            <select
              id="modal-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-white border border-[#D4D4D4] px-3.5 py-2.5 outline-none focus:border-[#121212] text-xs font-normal text-[#121212]"
            >
              <option value="featured">Featured</option>
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {categories && categories.length > 0 && (
            <div className="space-y-3">
              <label htmlFor="modal-category" className="block text-xs font-medium uppercase tracking-[0.12em] text-[#555555]">
                Collection
              </label>
              <select
                id="modal-category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="w-full bg-white border border-[#D4D4D4] px-3.5 py-2.5 outline-none focus:border-[#121212] text-xs font-normal text-[#121212]"
              >
                <option value="">All Collections</option>
                {categories.map((cat) => (
                  <option value={cat.id} key={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {selectedCategory && categories.find((c) => c.id === selectedCategory)?.subcategories?.length ? (
                <div className="pt-2 space-y-2">
                  <label htmlFor="modal-subcategory" className="block text-xs font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Subcategory
                  </label>
                  <select
                    id="modal-subcategory"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-white border border-[#D4D4D4] px-3.5 py-2.5 outline-none focus:border-[#121212] text-xs font-normal text-[#121212]"
                  >
                    <option value="">All Subcategories</option>
                    {categories
                      .find((c) => c.id === selectedCategory)
                      ?.subcategories?.map((sub) => (
                        <option value={sub.id} key={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}
            </div>
          )}

          {/* Price Filter */}
          <div className="space-y-3">
            <span className="block text-xs font-medium uppercase tracking-[0.12em] text-[#555555]">
              Price
            </span>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-1799', label: 'Under Rs. 1,799' },
                { id: '1799-2000', label: 'Rs. 1,800 – Rs. 2,000' },
                { id: 'over-2000', label: 'Above Rs. 2,000' },
              ].map((option) => {
                const isSelected =
                  option.id === 'under-1799'
                    ? maxPrice === 1799 || priceRange === 'under-1799'
                    : !maxPrice && priceRange === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 cursor-pointer border px-3.5 py-2.5 transition-colors ${
                      isSelected
                        ? 'border-[#121212] bg-[#F8F8F8] text-[#121212] font-medium'
                        : 'border-[#E5E5E5] bg-white text-[#555555] hover:border-[#121212]/40'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#121212]' : 'border-[#BDBDBD]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#121212]" />}
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => {
                        if (option.id === 'under-1799') {
                          setMaxPrice(1799);
                          setPriceRange('all');
                        } else {
                          setMaxPrice(null);
                          setPriceRange(option.id);
                        }
                      }}
                    />
                    <span className="text-xs sm:text-sm">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[#EBEBEB] bg-white flex gap-3">
          <button
            type="button"
            onClick={() => {
              setPriceRange('all');
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSort('featured');
              setMaxPrice(null);
            }}
            className="w-1/3 py-3 text-xs font-medium tracking-wide border border-[#D4D4D4] text-[#121212] hover:border-[#121212] transition-colors"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 text-xs font-medium tracking-wide bg-[#121212] hover:bg-[#2C2C2C] text-white transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilterModal({ isOpen, onClose, onApply, categories, initialFilters }: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <FilterModalContent
      onClose={onClose}
      onApply={onApply}
      categories={categories}
      initialFilters={initialFilters}
    />
  );
}
