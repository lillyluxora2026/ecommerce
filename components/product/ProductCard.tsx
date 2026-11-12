'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { toggleWishlistProduct } from '@/lib/api/wishlist';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price?: number;
    image: string;
    stock: number;
    allow_preorder: boolean;
    rating?: number;
    review_count?: number;
    variantId?: string;
    is_free_delivery?: boolean;
    material?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.stock === 0;
  const isPreorder = false;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const addItem = useCartStore((state) => state.addItem);
  const { user, setAuthModalOpen } = useUserStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock,
      variantId: product.variantId,
      is_free_delivery: product.is_free_delivery,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setWishlistLoading(true);
      const res = await toggleWishlistProduct(user, product.id);
      setIsWishlisted(res.isWishlisted);
    } catch {
      // Ignore or let user retry
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group flex flex-col justify-between">
      {/* Rounded Luxury Photo Tile */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#EAE1D7] border border-[#E0D4C6] shadow-xs">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
              isSoldOut ? 'opacity-55 grayscale' : ''
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badges on Top-Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {discount > 0 && !isSoldOut && (
            <span className="rounded-full bg-[#8B7768] text-[#F7F3ED] text-[10px] font-sans font-medium uppercase tracking-[0.12em] px-2.5 py-0.5">
              {discount}% OFF
            </span>
          )}
          {isPreorder && (
            <span className="rounded-full bg-[#C5A574] text-[#382F2A] text-[10px] font-sans font-semibold uppercase tracking-[0.12em] px-2.5 py-0.5">
              PREORDER
            </span>
          )}
          {isSoldOut && (
            <span className="rounded-full bg-[#382F2A] text-[#F7F3ED] text-[10px] font-sans font-medium uppercase tracking-[0.12em] px-2.5 py-0.5">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Heart on Top-Right */}
        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#382F2A] shadow-xs backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:text-[#8B7768]"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              isWishlisted ? 'fill-[#8B7768] text-[#8B7768]' : 'text-[#382F2A]'
            }`}
          />
        </button>
      </div>

      {/* Product Details + Always-Visible Mocha Pill CTA */}
      <div className="pt-2.5 px-0.5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="group-hover:text-[#8B7768] transition-colors">
            <h3 className="font-sans text-xs sm:text-sm font-medium text-[#382F2A] line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-xs sm:text-sm font-semibold text-[#382F2A]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {Boolean(product.original_price && product.original_price > product.price) && (
                <span className="font-sans text-[11px] text-[#8B7E76] line-through">
                  ₹{product.original_price!.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {(product.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-sans text-[#63574F]">
                <Star className="w-3 h-3 fill-[#C5A574] text-[#C5A574]" />
                <span>{product.rating}</span>
                {product.review_count ? <span className="text-[#8B7E76]">({product.review_count})</span> : null}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isSoldOut}
          className={`mt-2.5 w-full rounded-full py-2 px-3 text-[11px] font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-xs ${
            isSoldOut
              ? 'bg-[#D8CBBE]/60 text-[#8B7E76] cursor-not-allowed'
              : addedAnimation
                ? 'bg-[#382F2A] text-[#F7F3ED]'
                : 'bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED]'
          }`}
        >
          <ShoppingCart className="h-3 w-3" />
          <span>{isSoldOut ? 'Sold Out' : addedAnimation ? 'Added to Bag' : isPreorder ? 'Preorder' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
