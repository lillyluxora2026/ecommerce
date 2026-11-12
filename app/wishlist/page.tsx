'use client';

import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { getOrCreateCustomer } from '@/lib/api/customer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/api/home';
import { projectProductRow, SELLABLE_VARIANT_SELECT, type ProductRowLike } from '@/lib/api/sellable-variants';

type WishlistProductRow = {
  id: string;
  title: string;
  slug: string;
  is_free_delivery?: boolean | null;
  product_variants?: Array<Record<string, unknown>> | null;
  product_media?: Array<{ media_url?: string | null; position?: number | null }> | null;
};

type WishlistItemRow = {
  product_id: string;
  products: WishlistProductRow | WishlistProductRow[] | null;
};

function getWishlistProduct(item: WishlistItemRow): WishlistProductRow | null {
  if (Array.isArray(item.products)) {
    return item.products[0] ?? null;
  }

  return item.products ?? null;
}

export default function WishlistPage() {
  const { user, setAuthModalOpen } = useUserStore();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchWishlist() {
      const customerId = await getOrCreateCustomer(user!);
      if (!customerId) {
         setItems([]);
         setLoading(false);
         return;
      }

      // First find the user's wishlist
      const { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })
        .limit(1);
      
      // Since it's a test, if there is no wishlist, let's just show empty
      if (!wishlist || wishlist.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Then fetch items
      const { data: wishlistItems } = await supabase
        .from('wishlist_items')
        .select(`
          product_id,
          products (
            id, title, slug, is_free_delivery,
            product_variants (
              ${SELLABLE_VARIANT_SELECT}
            ),
            product_media ( media_url, position )
          )
        `)
        .eq('wishlist_id', wishlist[0].id);

      if (wishlistItems) {
        const shaped = (wishlistItems as WishlistItemRow[])
          .flatMap((item): Product[] => {
            const p = getWishlistProduct(item);

            if (!p) {
              return [];
            }

            const projected = projectProductRow(p as ProductRowLike);

            return [{
              ...projected,
              image: projected.image || '/images/placeholders/product-fallback.svg',
            }];
          });

        setItems(shaped);
      }
      setLoading(false);
    }
    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Saved Pieces
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          Your Wishlist
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-sm mb-8 leading-relaxed">
          Please sign in to view and manage your saved 18K PVD gold-plated and stainless steel favourites.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Sign In to Account
        </button>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#B7A596]/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-1">
              Personal Wishlist
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
              Saved Items ({items.length})
            </h1>
          </div>
          <Link
            href="/products"
            className="text-xs font-sans font-medium text-[#8B7768] hover:text-[#58483D] underline underline-offset-4"
          >
            ← Explore Catalogue
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <p className="text-sm font-sans text-[#63574F] animate-pulse">Loading your saved jewellery...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white py-24 px-4 text-center shadow-xs max-w-xl mx-auto">
            <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-2">No Saved Items Yet</h2>
            <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-md mx-auto mb-6 leading-relaxed">
              Click the heart icon on any product to save your favourite 18K PVD gold-plated pieces for later.
            </p>
            <Link
              href="/products"
              className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-medium tracking-wide uppercase inline-block shadow-sm"
            >
              Discover New Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
