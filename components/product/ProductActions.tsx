'use client';

import { useEffect, useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { AddToCartButton } from './AddToCartButton';
import { Product } from '@/lib/api/home';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { useUserStore } from '@/store/userStore';
import { isProductWishlisted, toggleWishlistProduct } from '@/lib/api/wishlist';

interface ProductActionsProps {
  product: Product;
  isStickyMobile?: boolean;
  selectedVariant?: {
    id?: string;
    price?: number;
    stock?: number;
    allowPreorder?: boolean;
    label?: string;
    image?: string;
  } | null;
}

export function ProductActions({ product, isStickyMobile, selectedVariant }: ProductActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuthModalOpen } = useUserStore();
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const effectiveVariantId = selectedVariant?.id ?? product.variantId;
  const allowPreorder = selectedVariant?.allowPreorder ?? product.allow_preorder;
  const isPreorder = effectiveStock === 0 && allowPreorder;
  const maxSelectableQuantity = effectiveStock > 0 ? effectiveStock : allowPreorder ? 10 : 1;
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setQuantity(1);
  }, [effectiveVariantId]);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistState() {
      if (!user) {
        if (!cancelled) setIsWishlisted(false);
        return;
      }

      try {
        const saved = await isProductWishlisted(user, product.id);
        if (!cancelled) {
          setIsWishlisted(saved);
        }
      } catch {
        if (!cancelled) {
          setIsWishlisted(false);
        }
      }
    }

    loadWishlistState();

    return () => {
      cancelled = true;
    };
  }, [user, product.id]);

  const decrementQuantity = () => setQuantity((current) => Math.max(1, current - 1));
  const incrementQuantity = () => setQuantity((current) => Math.min(maxSelectableQuantity, current + 1));

  async function handleWishlist() {
    setWishlistNotice(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setWishlistLoading(true);

    try {
      const result = await toggleWishlistProduct(user, product.id);
      setIsWishlisted(result.isWishlisted);

      // Meta Pixel AddToWishlist Tracking
      if (result.isWishlisted && typeof window !== 'undefined') {
        const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
        if (fbq) {
          fbq('track', 'AddToWishlist', {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: product.price,
            currency: 'INR'
          });
        }
      }

      setWishlistNotice({
        tone: 'success',
        message: result.isWishlisted ? 'Saved to wishlist.' : 'Removed from wishlist.',
      });
    } catch (error) {
      setWishlistNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Could not update wishlist.',
      });
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {wishlistNotice ? (
          <NoticeBanner tone={wishlistNotice.tone} onDismiss={() => setWishlistNotice(null)}>
            {wishlistNotice.message}
          </NoticeBanner>
        ) : null}

        {isPreorder ? (
          <NoticeBanner tone="info">
            <span className="font-medium text-[#121212]">This piece is available on preorder.</span>{' '}
            Reserve it now and we will contact you when it is ready to ship.
          </NoticeBanner>
        ) : null}

        <div className="flex items-center justify-between border border-[#E5E5E5] bg-white px-4 py-2.5 font-sans">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#555555]">Quantity</div>
            <div className="mt-0.5 text-xs text-[#555555]">
              {effectiveStock > 0 ? `${effectiveStock} available` : allowPreorder ? 'Available on preorder' : 'Currently unavailable'}
            </div>
          </div>
          <div className="inline-flex items-center border border-[#D4D4D4] bg-white">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="p-2.5 text-[#121212] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-9 text-center text-sm font-normal text-[#121212] tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= maxSelectableQuantity}
              className="p-2.5 text-[#121212] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <AddToCartButton
          product={product}
          selectedSize={null}
          quantity={quantity}
          selectedVariantId={effectiveVariantId}
          selectedVariantPrice={effectivePrice}
          selectedVariantStock={effectiveStock}
          selectedVariantAllowPreorder={selectedVariant?.allowPreorder}
          selectedVariantLabel={selectedVariant?.label}
          selectedVariantImage={selectedVariant?.image}
        />
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={`w-full py-3.5 border text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors ${isWishlisted ? 'border-[#121212] text-[#121212] bg-[#F5F5F5]' : 'border-[#D4D4D4] bg-white text-[#121212] hover:border-[#121212]'} disabled:opacity-60`}
        >
          <span className="inline-flex items-center gap-2">
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
            {wishlistLoading ? 'Saving...' : isWishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
          </span>
        </button>
      </div>

      {isStickyMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#EBEBEB] z-[90] flex items-center gap-3 md:hidden animate-in slide-in-from-bottom-full duration-300">
          <div className="flex-1 min-w-0">
            <span className="block text-[11px] font-sans text-[#555555] truncate">{product.name}</span>
            <span className="block font-sans text-sm font-medium text-[#121212] tabular-nums">Rs. {effectivePrice.toLocaleString('en-IN')} × {quantity}</span>
          </div>
          <div className="flex-1">
             <AddToCartButton
               product={product}
               selectedSize={null}
               quantity={quantity}
               selectedVariantId={effectiveVariantId}
               selectedVariantPrice={effectivePrice}
               selectedVariantStock={effectiveStock}
               selectedVariantAllowPreorder={selectedVariant?.allowPreorder}
               selectedVariantLabel={selectedVariant?.label}
               selectedVariantImage={selectedVariant?.image}
             />
          </div>
        </div>
      )}
    </>
  );
}
