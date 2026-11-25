'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { PreorderModal } from '@/components/modals/PreorderModal';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { Product } from '@/lib/api/home';

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  quantity?: number;
  selectedVariantId?: string | null;
  selectedVariantPrice?: number | null;
  selectedVariantStock?: number | null;
  selectedVariantAllowPreorder?: boolean | null;
  selectedVariantLabel?: string | null;
  selectedVariantImage?: string | null;
}

export function AddToCartButton({
  product,
  selectedSize,
  quantity = 1,
  selectedVariantId,
  selectedVariantPrice,
  selectedVariantStock,
  selectedVariantAllowPreorder,
  selectedVariantLabel,
  selectedVariantImage,
}: AddToCartButtonProps) {
  const { user } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  const [isSubmittingPreorder, setIsSubmittingPreorder] = useState(false);
  const [preorderError, setPreorderError] = useState<string | null>(null);
  const [preorderNotice, setPreorderNotice] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const effectiveStock = selectedVariantStock ?? product.stock;
  const effectivePrice = selectedVariantPrice ?? product.price;
  const allowPreorder = false;
  const effectiveVariantId = selectedVariantId || product.variantId || null;
  const effectiveImage = selectedVariantImage || product.image;

  const isSoldOut = effectiveStock === 0 && !allowPreorder;
  const isPreorder = effectiveStock === 0 && allowPreorder;

  const handleAction = () => {
    setPreorderError(null);

    if (isPreorder) {
      setIsPreorderModalOpen(true);
      return;
    }

    setIsAdding(true);
    
    setTimeout(() => {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice,
        image: effectiveImage,
        quantity,
        stock: effectiveStock ?? undefined,
        variantId: selectedVariantId || product.variantId || undefined,
        variantLabel: selectedVariantLabel || selectedSize || undefined,
        is_free_delivery: product.is_free_delivery,
      });

      // Meta Pixel AddToCart Tracking
      if (typeof window !== 'undefined') {
        const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
        if (fbq) {
          fbq('track', 'AddToCart', {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: effectivePrice * quantity,
            currency: 'INR',
            quantity: quantity
          });
        }
      }

      setIsAdding(false);
      setAdded(true);
      
      setTimeout(() => setAdded(false), 2000);
    }, 400);
  };

  const handlePreorderConfirm = async ({
    email,
    name,
    phone,
  }: {
    email: string;
    name: string;
    phone: string;
  }) => {
    if (!effectiveVariantId) {
      const message = 'This product is missing variant data required for preorder.';
      setPreorderError(message);
      throw new Error(message);
    }

    setIsSubmittingPreorder(true);
    setPreorderError(null);

    try {
      const response = await fetch('/api/preorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          variantId: effectiveVariantId,
          quantity,
        }),
      });

      const payload = await response.json() as { error?: string; alreadyReserved?: boolean };
      if (!response.ok) {
        throw new Error(payload.error || 'Could not reserve preorder.');
      }

      setPreorderNotice(
        payload.alreadyReserved
          ? `A preorder reservation for ${product.name} already exists for ${email.trim().toLowerCase()}.`
          : `Preorder reserved for ${product.name}. We saved your details and will contact ${email.trim().toLowerCase()} when it is ready.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reserve preorder.';
      setPreorderError(message);
      throw error;
    } finally {
      setIsSubmittingPreorder(false);
    }
  };

  return (
    <>
      {preorderNotice && (
        <NoticeBanner
          tone="success"
          className="mb-4"
          onDismiss={() => setPreorderNotice(null)}
        >
          {preorderNotice}
        </NoticeBanner>
      )}

      <button
        type="button"
        onClick={handleAction}
        disabled={isSoldOut || (isAdding && !isPreorder)}
        className={`w-full py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors flex items-center justify-center gap-2.5
          ${isSoldOut
            ? 'bg-[#F3F3F3] text-[#737373] cursor-not-allowed border border-[#E5E5E5]'
            : isPreorder
              ? 'bg-[#121212] text-white hover:bg-[#2C2C2C]'
              : added
                ? 'bg-[#2C2C2C] text-white'
                : 'bg-[#121212] text-white hover:bg-[#2C2C2C]'
          }
        `}
      >
        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
        {isSoldOut ? 'Sold out' : isPreorder ? 'Reserve preorder' : added ? 'Added to bag' : isAdding ? 'Adding...' : 'Add to bag'}
      </button>

      <PreorderModal 
        key={`${product.id}-${effectiveVariantId || 'default'}-${isPreorderModalOpen ? 'open' : 'closed'}`}
        isOpen={isPreorderModalOpen} 
        onClose={() => setIsPreorderModalOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          image: effectiveImage,
          price: effectivePrice
        }}
        onConfirm={handlePreorderConfirm}
        error={preorderError}
        defaultEmail={user?.email || undefined}
        defaultName={user?.user_metadata?.full_name || user?.user_metadata?.name || undefined}
        defaultPhone={user?.phone || user?.user_metadata?.phone || undefined}
        loading={isSubmittingPreorder}
      />
    </>
  );
}
