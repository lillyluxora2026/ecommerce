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
            <span className="font-medium text-[#382F2A]">This piece is available on preorder.</span>{' '}
            Reserve it now and we will contact you when it is ready to ship.
          </NoticeBanner>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl border border-[#D8CBBE] bg-white px-4 py-3 font-sans">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#63574F]">Quantity</div>
            <div className="mt-1 text-xs sm:text-sm text-[#63574F]">
              {effectiveStock > 0 ? `${effectiveStock} available` : allowPreorder ? 'Available on preorder' : 'Currently unavailable'}
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-[#D8CBBE] bg-[#F7F3ED]">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="p-3 text-[#63574F] transition-colors hover:text-[#382F2A] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-medium text-[#382F2A]">{quantity}</span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= maxSelectableQuantity}
              className="p-3 text-[#63574F] transition-colors hover:text-[#382F2A] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
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
          className={`w-full rounded-full py-3.5 border text-xs font-sans font-medium tracking-[0.16em] uppercase transition-colors ${isWishlisted ? 'border-[#8B7768] text-[#8B7768] bg-[#EFE7DE]' : 'border-[#B7A596] bg-white text-[#382F2A] hover:bg-[#EFE7DE]/60'} disabled:opacity-60`}
        >
          <span className="inline-flex items-center gap-2">
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            {wishlistLoading ? 'Saving...' : isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </span>
        </button>
      </div>

      {isStickyMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F7F3ED]/95 backdrop-blur-md border-t border-[#D8CBBE] z-[90] flex items-center gap-4 md:hidden animate-in slide-in-from-bottom-full duration-300">
          <div className="flex-1">
            <span className="block text-[11px] font-sans text-[#63574F] truncate">{product.name}</span>
            <span className="block font-sans font-semibold text-[#382F2A]">₹{effectivePrice.toFixed(0)} × {quantity}</span>
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
