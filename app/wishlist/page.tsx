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
      <main className="w-full bg-white text-[#121212] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#555555] uppercase tracking-[0.16em] text-xs font-sans font-medium mb-2.5 block">
          Saved Pieces
        </span>
        <h1 className="text-2xl sm:text-4xl font-sans font-normal tracking-tight text-[#121212] mb-3">
          Your Wishlist
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#555555] max-w-sm mb-7 leading-relaxed">
          Sign in to view and manage your saved pieces.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-8 py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#EBEBEB] pb-5 mb-7 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-tight text-[#121212]">
              Saved Items ({items.length})
            </h1>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-[13px] font-sans text-[#121212] underline underline-offset-4 hover:opacity-70"
          >
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <p className="text-sm font-sans text-[#555555] animate-pulse">Loading your saved jewellery...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="border border-[#EBEBEB] bg-white py-20 px-4 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-sans font-normal text-[#121212] mb-2">No saved items yet</h2>
            <p className="text-xs sm:text-sm font-sans text-[#555555] max-w-md mx-auto mb-6 leading-relaxed">
              Save your favourite 18K PVD gold-plated pieces from any product page to revisit them later.
            </p>
            <Link
              href="/products"
              className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-6 py-3 text-xs font-sans font-medium tracking-wide inline-block transition-colors"
            >
              Discover pieces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-6 sm:gap-x-5 sm:gap-y-9">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
