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
          "fixed inset-0 z-[100] bg-[#382F2A]/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-md bg-[#F7F3ED] border-l border-[#B7A596]/40 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#B7A596]/30 bg-[#F7F3ED]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#8B7768]" />
            <h2 className="font-heading text-xl font-normal tracking-[0.14em] uppercase text-[#382F2A]">
              Shopping Bag ({totalCount})
            </h2>
          </div>
          <button 
            type="button"
            aria-label="Close cart"
            onClick={onClose} 
            className="p-1.5 text-[#382F2A] hover:text-[#8B7768] rounded-full hover:bg-[#D8CBBE]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#D8CBBE]/40 mx-auto flex items-center justify-center text-[#8B7768]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-xl text-[#382F2A]">Your jewellery box is empty</h3>
              <p className="font-sans text-xs text-[#63574F] max-w-xs mx-auto leading-relaxed">
                Explore our waterproof 18K PVD gold necklaces, earrings, and rings to begin layering.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-7 py-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] transition-colors shadow-sm"
                >
                  Shop The Collection
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.variantId || 'default'}`}
                className="flex gap-4 p-3.5 rounded-2xl bg-white border border-[#E5DACF] shadow-xs"
              >
                <div className="relative w-20 h-20 rounded-xl bg-[#EFE7DE] flex-shrink-0 overflow-hidden border border-[#D8CBBE]/60">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={item.slug ? `/product/${item.slug}` : '#'}
                        onClick={onClose}
                        className="font-heading text-sm sm:text-base text-[#382F2A] hover:text-[#8B7768] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button 
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="text-[#8B7E76] hover:text-red-700 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {item.variantLabel && (
                        <span className="text-[#8B7E76] text-[11px] font-sans">
                          {item.variantLabel}
                        </span>
                      )}
                      {item.is_free_delivery && (
                        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-[#8B7768] bg-[#D8CBBE]/30 px-1.5 py-0.5">
                          Free Delivery
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-full border border-[#D8CBBE] bg-[#F7F3ED] overflow-hidden">
                      <button 
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1 text-[#382F2A] hover:bg-[#D8CBBE] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-sans font-medium text-[#382F2A]">
                        {item.quantity}
                      </span>
                      <button 
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#382F2A] hover:bg-[#D8CBBE] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-sans text-sm font-semibold text-[#382F2A]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#D8CBBE] bg-white space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="font-heading text-lg text-[#382F2A]">Subtotal</span>
              <span className="font-sans text-xl font-semibold text-[#382F2A]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-[11px] font-sans text-[#63574F]">
              Taxes included. Free Pan-India shipping on orders above ₹999.
            </p>
            
            <Link 
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-4 text-xs font-sans font-semibold uppercase tracking-[0.18em] transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center justify-center gap-2 text-[#8B7E76] pt-1">
              <Lock className="w-3 h-3 text-[#8B7768]" />
              <span className="text-[10px] font-sans uppercase tracking-widest">
                100% Encrypted & Secure Checkout
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
