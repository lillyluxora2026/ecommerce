'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/api/home';

export interface ExtendedFilters {
  priceRange: string; 
  sizes: string[]; 
  categoryId?: string; 
  subcategoryId?: string;
  sort?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ExtendedFilters) => void;
  categories?: Category[];
  initialFilters?: ExtendedFilters;
}

export function FilterModal({ isOpen, onClose, onApply, categories, initialFilters }: FilterModalProps) {
  const [priceRange, setPriceRange] = useState<string>(initialFilters?.priceRange || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters?.categoryId || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialFilters?.subcategoryId || '');

  useEffect(() => {
    if (!isOpen) return;
    setPriceRange(initialFilters?.priceRange || 'all');
    setSelectedCategory(initialFilters?.categoryId || '');
    setSelectedSubcategory(initialFilters?.subcategoryId || '');
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ priceRange, sizes: [], categoryId: selectedCategory, subcategoryId: selectedSubcategory });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-[#382F2A]/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm h-full bg-[#F7F3ED] border-l border-[#D8CBBE] flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#D8CBBE] bg-[#EFE7DE]/60">
          <h2 className="text-2xl font-heading font-normal italic text-[#382F2A]">Refine Collection</h2>
          <button type="button" aria-label="Close filters" onClick={onClose} className="p-2 rounded-full text-[#63574F] hover:text-[#382F2A] hover:bg-[#D8CBBE]/40 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm font-sans">
          {categories && categories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#63574F]">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory(''); // Reset sub on cat change
                }}
                className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] text-xs font-medium text-[#382F2A]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option value={cat.id} key={cat.id}>{cat.name}</option>
                ))}
              </select>

              {selectedCategory && categories.find(c => c.id === selectedCategory)?.subcategories?.length ? (
                <div className="pt-2">
                  <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#63574F] mb-3">Subcategory</h3>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] text-xs font-medium text-[#382F2A]"
                  >
                    <option value="">All Subcategories</option>
                    {categories.find(c => c.id === selectedCategory)?.subcategories?.map(sub => (
                      <option value={sub.id} key={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          )}

          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#63574F]">Price Range</h3>
            <div className="space-y-2.5">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-500', label: 'Under ₹500' },
                { id: '500-1000', label: '₹500 – ₹1,000' },
                { id: 'over-1000', label: 'Over ₹1,000' },
              ].map(option => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                    priceRange === option.id
                      ? 'border-[#8B7768] bg-white text-[#382F2A] font-medium'
                      : 'border-[#D8CBBE] bg-white/60 text-[#63574F] hover:border-[#8B7768]/60'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${priceRange === option.id ? 'border-[#6D5C50]' : 'border-[#B7A596]'}`}>
                    {priceRange === option.id && <div className="w-2 h-2 rounded-full bg-[#6D5C50]" />}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    checked={priceRange === option.id}
                    onChange={() => setPriceRange(option.id)}
                  />
                  <span className="text-xs sm:text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-[#D8CBBE] bg-white flex gap-3">
          <button
            type="button"
            onClick={() => { 
              setPriceRange('all'); 
              setSelectedCategory('');
              setSelectedSubcategory('');
            }}
            className="w-1/3 rounded-full py-3.5 text-xs font-semibold tracking-[0.14em] uppercase border border-[#B7A596] text-[#63574F] hover:bg-[#EFE7DE] transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-full py-3.5 text-xs font-semibold tracking-[0.16em] uppercase bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] transition-colors shadow-sm"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
