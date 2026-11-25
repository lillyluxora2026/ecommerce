'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, X, ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-[101] h-full w-full max-w-md bg-white border-l border-[#EBEBEB] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
            <h2 className="font-sans text-base font-medium text-[#121212]">
              Your bag ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F5F5F5] mx-auto flex items-center justify-center text-[#121212]">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.4} />
              </div>
              <h3 className="font-sans text-lg text-[#121212]">Your bag is empty</h3>
              <p className="font-sans text-xs text-[#555555] max-w-xs mx-auto leading-relaxed">
                Explore our waterproof 18K PVD gold necklaces, earrings, and bracelets.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-flex items-center justify-center bg-[#121212] hover:bg-[#2C2C2C] text-white px-7 py-3 text-xs font-sans font-medium tracking-wide transition-colors"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.variantId || 'default'}`}
                className="flex gap-4 pb-4 border-b border-[#EBEBEB]"
              >
                <div className="relative w-20 h-20 bg-[#F6F6F6] flex-shrink-0 overflow-hidden">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />}
                </div>

                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={item.slug ? `/product/${item.slug}` : '#'}
                        onClick={onClose}
                        className="font-sans text-sm text-[#121212] hover:underline underline-offset-4 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="text-[#737373] hover:text-red-600 transition-colors p-0.5 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {item.variantLabel && (
                        <span className="text-[#555555] text-[11px] font-sans">{item.variantLabel}</span>
                      )}
                      {item.is_free_delivery && (
                        <span className="text-[10px] font-sans text-[#121212] bg-[#F4F4F4] px-1.5 py-0.5">
                          Free Shipping
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center border border-[#D4D4D4] bg-white">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-sans text-[#121212] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-sans text-sm text-[#121212] tabular-nums">
                      Rs. {(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#EBEBEB] bg-white space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="font-sans text-base text-[#121212]">Subtotal</span>
              <span className="font-sans text-lg font-medium text-[#121212] tabular-nums">
                Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
              </span>
            </div>

            <p className="text-[11px] font-sans text-[#555555]">
              Taxes included. Free shipping on orders above Rs. 999.
            </p>

            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
            >
              <span>Check out</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[#737373]">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] font-sans uppercase tracking-wider">
                Encrypted &amp; Secure Checkout
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
