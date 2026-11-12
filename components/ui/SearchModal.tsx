'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Clock3, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api/product';
import type { Product } from '@/lib/api/home';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = Product;

const RECENT_SEARCHES_KEY = 'lily-luxora-recent-searches';

// Normalize: lowercase + collapse hyphens/spaces so
// "anti tarnish", "antitarnish", "anti-tarnish" all match the same products
function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')   // hyphens/underscores → space
    .replace(/\s+/g, ' ')     // collapse multiple spaces
    .trim();
}

function normalizeSearchValue(value: string) {
  return normalizeForSearch(value);
}

function getSearchableTokens(product: SearchResult) {
  const raw = [
    product.name,
    product.brand,
    product.material,
    product.collection,
    ...(product.variants?.flatMap((variant) => Object.values(variant.options || {})) || []),
  ]
    .filter(Boolean)
    .join(' ');

  // Return both raw lowercase AND hyphen-normalized version so both match
  const lower = raw.toLowerCase();
  const normalized = normalizeForSearch(raw);
  return lower === normalized ? lower : `${lower} ${normalized}`;
}

function getSearchScore(product: SearchResult, rawQuery: string) {
  const query = normalizeForSearch(rawQuery);
  if (!query) return 0;

  // Normalize product fields too
  const title = normalizeForSearch(product.name);
  const brand = normalizeForSearch(product.brand || '');
  const material = normalizeForSearch(product.material || '');
  const collection = normalizeForSearch(product.collection || '');
  const tokens = getSearchableTokens(product);

  let score = 0;

  if (title.startsWith(query)) score += 120;
  else if (title.includes(query)) score += 80;

  if (brand.startsWith(query)) score += 48;
  else if (brand.includes(query)) score += 30;

  if (material.startsWith(query)) score += 32;
  else if (material.includes(query)) score += 20;

  if (collection.startsWith(query)) score += 24;
  else if (collection.includes(query)) score += 14;

  if (tokens.includes(query)) score += 12;
  if (product.stock > 0) score += 8;

  return score;
}

function getRecentSearches() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  if (typeof window === 'undefined') return [];

  const normalized = term.trim();
  if (!normalized) return getRecentSearches();

  const nextSearches = [
    normalized,
    ...getRecentSearches().filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, 6);

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
  return nextSearches;
}

function highlightMatch(text: string, query: string) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return text;

  // Try exact match first, then try with hyphens stripped from source text
  const lowerText = text.toLowerCase();
  const normalizedText = normalizeForSearch(text);

  // Direct match in original text
  const directIdx = lowerText.indexOf(normalizedQuery);
  if (directIdx !== -1) {
    return (
      <>
        {text.slice(0, directIdx)}
        <span className="text-[#8B7768] font-medium underline decoration-[#C5A574]/60 underline-offset-2">{text.slice(directIdx, directIdx + normalizedQuery.length)}</span>
        {text.slice(directIdx + normalizedQuery.length)}
      </>
    );
  }

  // Match after normalizing (e.g. "anti tarnish" matches "Anti-Tarnish")
  const normIdx = normalizedText.indexOf(normalizedQuery);
  if (normIdx !== -1) {
    // Highlight entire word range as a block since offsets differ after normalization
    return (
      <>
        {text.split(new RegExp(`(${normalizedQuery.replace(/\s+/g, '[-\\s]?')})`, 'i'))
          .map((part, i) =>
            i % 2 === 1
              ? <span key={i} className="text-[#8B7768] font-medium underline decoration-[#C5A574]/60 underline-offset-2">{part}</span>
              : part
          )}
      </>
    );
  }

  return text;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());

  const trimmedQuery = query.trim();

  const closeSearch = useCallback(() => {
    setActiveIndex(-1);
    onClose();
  }, [onClose]);

  const openSearchResults = useCallback((term: string) => {
    const normalized = term.trim();
    if (normalized.length < 2) return;

    setRecentSearches(saveRecentSearch(normalized));
    closeSearch();
    router.push(`/products?search=${encodeURIComponent(normalized)}`);
  }, [closeSearch, router]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (!isOpen) {
      const resetTimer = window.setTimeout(() => {
        setQuery('');
        setResults([]);
        setLoading(false);
        setActiveIndex(-1);
      }, 300);

      return () => {
        document.body.style.overflow = '';
        window.clearTimeout(resetTimer);
      };
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;

    const fetchResults = async () => {
      if (trimmedQuery.length < 2) {
        setResults([]);
        setActiveIndex(-1);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getProducts(undefined, trimmedQuery);
      if (cancelled) return;

      const ranked = data
        .map((product) => ({
          product,
          score: getSearchScore(product, trimmedQuery),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score || left.product.price - right.product.price)
        .slice(0, 8)
        .map((entry) => entry.product);

      setResults(ranked);
      setActiveIndex(ranked.length > 0 ? 0 : -1);
      setLoading(false);
    };

    const debounce = window.setTimeout(() => {
      void fetchResults();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(debounce);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
        return;
      }

      if (event.key === 'ArrowDown' && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
      }

      if (event.key === 'ArrowUp' && results.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
      }

      if (event.key === 'Enter') {
        if (activeIndex >= 0 && results[activeIndex]) {
          event.preventDefault();
          if (trimmedQuery) {
            setRecentSearches(saveRecentSearch(trimmedQuery));
          }
          closeSearch();
          router.push(`/product/${results[activeIndex].slug}`);
          return;
        }

        if (trimmedQuery.length >= 2) {
          event.preventDefault();
          openSearchResults(trimmedQuery);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, closeSearch, isOpen, openSearchResults, results, router, trimmedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#F7F3ED]/98 backdrop-blur-md animate-in fade-in duration-200 text-[#382F2A]">
      <div className="border-b border-[#D8CBBE] bg-[#EFE7DE]/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-6">
          <div className="flex flex-1 items-center gap-4">
            <Search className="w-5 h-5 text-[#8B7768]" />
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Search necklaces, earrings, bracelets, 18K gold..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-xl sm:text-2xl font-heading text-[#382F2A] outline-none placeholder:text-[#8B7E76]"
              />
              <p className="mt-1.5 text-[11px] font-sans uppercase tracking-[0.2em] text-[#63574F]">
                {trimmedQuery.length >= 2 ? 'Use arrow keys to browse and Enter to open' : 'Type at least 2 letters to start'}
              </p>
            </div>
          </div>
          <button type="button" onClick={closeSearch} className="p-2 rounded-full text-[#63574F] hover:text-[#382F2A] hover:bg-[#D8CBBE]/40 transition-colors" aria-label="Close search">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden p-6 font-sans">
        {trimmedQuery.length < 2 ? (
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-[#D8CBBE] bg-white p-6 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8B7768]">Curated Search</span>
              <h2 className="mt-2.5 text-2xl font-heading font-normal italic text-[#382F2A]">Find timeless pieces faster</h2>
              <p className="mt-2.5 max-w-xl text-xs sm:text-sm leading-6 text-[#63574F]">
                Search matches product names, collections, 18K PVD gold finishes, waterproof essentials, and jewellery categories. Press <span className="font-semibold text-[#382F2A]">/</span> anywhere to open search.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {['Necklace', 'Hoops', 'Clover', 'Bracelet', 'Ring'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-[#D8CBBE] bg-[#F7F3ED] px-4 py-1.5 text-xs font-medium text-[#382F2A] transition-colors hover:border-[#8B7768] hover:bg-[#EFE7DE]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#D8CBBE] bg-[#EFE7DE]/60 p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#63574F]">
                <Clock3 className="h-4 w-4 text-[#8B7768]" />
                Recent searches
              </div>
              <div className="mt-4 space-y-2.5">
                {recentSearches.length > 0 ? (
                  recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#D8CBBE] bg-white px-4 py-3 text-left text-xs sm:text-sm text-[#382F2A] transition-colors hover:border-[#8B7768]"
                    >
                      <span>{term}</span>
                      <ArrowRight className="h-4 w-4 text-[#8B7768]" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm leading-6 text-[#63574F]">Your recent searches will appear here after you explore pieces.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-[#63574F]">
                {loading ? 'Searching collection...' : `${results.length} result${results.length === 1 ? '' : 's'} for "${trimmedQuery}"`}
              </p>
              <button
                type="button"
                onClick={() => openSearchResults(trimmedQuery)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8B7768] transition-colors hover:text-[#382F2A]"
              >
                View all matches
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {!loading && results.length === 0 ? (
              <div className="rounded-3xl border border-[#D8CBBE] bg-white p-8 text-center">
                <p className="text-xl font-heading text-[#382F2A]">No matching pieces found</p>
                <p className="mt-2 text-xs sm:text-sm text-[#63574F]">
                  Try searching for Necklace, Earrings, Bracelet, Ring, or 18K PVD Gold.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((product, index) => {
                  const isSoldOut = product.stock === 0;
                  const isPreorder = false;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        if (trimmedQuery) {
                          setRecentSearches(saveRecentSearch(trimmedQuery));
                        }
                        closeSearch();
                      }}
                      className={cn(
                        'group flex items-center gap-4 rounded-2xl border border-[#D8CBBE] bg-white p-4 transition-all hover:border-[#8B7768] hover:shadow-xs',
                        activeIndex === index && 'border-[#8B7768] bg-[#EFE7DE]/40'
                      )}
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#EFE7DE] border border-[#D8CBBE]/40 shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-heading text-lg text-[#382F2A]">
                            {highlightMatch(product.name, trimmedQuery)}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                              isSoldOut && 'bg-[#EFE7DE] text-[#63574F]',
                              isPreorder && 'bg-[#C5A574]/25 text-[#8B7768]',
                              !isSoldOut && !isPreorder && 'bg-[#2C6E49]/15 text-[#2C6E49]'
                            )}
                          >
                            {isSoldOut ? 'Sold out' : isPreorder ? 'Preorder' : 'In stock'}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[#63574F] line-clamp-1">
                          {[product.brand, product.collection, product.material].filter(Boolean).join(' · ') || 'Lily Luxora Demi-Fine'}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-semibold text-[#382F2A]">₹{product.price.toFixed(0)}</span>
                          {product.original_price ? (
                            <span className="text-xs text-[#8B7E76] line-through">₹{product.original_price.toFixed(0)}</span>
                          ) : null}
                          {product.is_free_delivery ? (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B7768]">Free Delivery</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
