'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { CouponModal } from '@/components/modals/CouponModal';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [discount, setDiscount] = useState({ amount: 0, code: '' });

  if (items.length === 0) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Lily Luxora Shopping Bag
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-md mb-8 leading-relaxed">
          Discover our waterproof, anti-tarnish 18K PVD gold-plated pieces designed for effortless everyday luxury.
        </p>
        <Link 
          href="/products" 
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Explore Catalogue
        </Link>
      </main>
    );
  }

  const finalTotal = Math.max(0, total - discount.amount);
  const freeShippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <>
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#B7A596]/40 pb-6 mb-8 gap-4">
            <div>
              <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-1">
                Shopping Bag
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
                Review Your Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h1>
            </div>
            <Link
              href="/products"
              className="text-xs font-sans font-medium text-[#8B7768] hover:text-[#58483D] underline underline-offset-4"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Free Shipping Tracker */}
          <div className="mb-10 rounded-2xl bg-[#EFE7DE] border border-[#D8CBBE] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs sm:text-sm font-sans mb-2">
              <span className="inline-flex items-center gap-2 font-medium text-[#382F2A]">
                <Truck className="w-4 h-4 text-[#8B7768]" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-[#382F2A] font-semibold">✨ You have unlocked Complimentary Express Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#8B7768]">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock Free Express Shipping
                  </span>
                )}
              </span>
              <span className="text-[#63574F] font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B7768] to-[#C5A574] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || 'default'}`}
                  className="flex gap-4 sm:gap-6 bg-white rounded-2xl border border-[#E5DACF] p-4 sm:p-5 shadow-xs transition-all hover:border-[#8B7768]/40"
                >
                  <div className="relative aspect-square w-24 sm:w-28 rounded-xl overflow-hidden bg-[#F7F3ED] border border-[#E0D4C6] flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full bg-[#EAE1D7]" />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-heading text-base sm:text-lg font-normal text-[#382F2A] line-clamp-1">
                          <Link href={item.slug ? `/product/${item.slug}` : '#'} className="hover:text-[#8B7768] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="font-sans text-sm sm:text-base font-bold text-[#382F2A] whitespace-nowrap">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-sans text-[#63574F]">
                          {item.variantLabel || '18K PVD Gold'}
                        </span>
                        {item.is_free_delivery && (
                          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#6D5C50] bg-[#EFE7DE] px-2 py-0.5 rounded">
                            Free Shipping
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-full border border-[#B7A596]/40 bg-[#F7F3ED]">
                        <button 
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                          className="p-2 text-[#382F2A] hover:text-[#8B7768] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-sans font-semibold text-[#382F2A]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          className="p-2 text-[#382F2A] hover:text-[#8B7768] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="p-2 text-[#8B7E76] hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#EFE7DE] border border-[#D8CBBE] rounded-2xl p-6 sm:p-7 sticky top-28 shadow-xs space-y-6">
                <h2 className="font-heading text-2xl font-normal text-[#382F2A] border-b border-[#D8CBBE] pb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-3.5 text-xs sm:text-sm font-sans">
                  <div className="flex justify-between text-[#63574F]">
                    <span>Bag Subtotal</span>
                    <span className="font-semibold text-[#382F2A]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {discount.amount > 0 && (
                    <div className="flex justify-between text-[#2C6E49] font-medium">
                      <span>Promo Discount ({discount.code})</span>
                      <span>-₹{discount.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-[#63574F]">
                    <button 
                      onClick={() => setIsCouponModalOpen(true)}
                      className="underline underline-offset-4 hover:text-[#8B7768] transition-colors font-medium"
                    >
                      Apply Promo Code
                    </button>
                    {discount.code ? <span className="text-[#2C6E49]">{discount.code}</span> : null}
                  </div>
                  
                  <div className="flex justify-between text-[#63574F]">
                    <span>Shipping</span>
                    <span>
                      {total >= FREE_SHIPPING_THRESHOLD || items.some((i) => i.is_free_delivery) ? (
                        <span className="text-[#2C6E49] font-semibold">FREE</span>
                      ) : (
                        'Calculated at checkout'
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#63574F]">
                    <span>Estimated Taxes</span>
                    <span>Included in price</span>
                  </div>
                </div>
                
                <div className="border-t border-[#D8CBBE] pt-4 flex justify-between items-center text-lg sm:text-xl font-bold font-sans text-[#382F2A]">
                  <span>Estimated Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                
                <Link 
                  href="/checkout" 
                  className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 px-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-sans text-[#63574F]">
                  <ShieldCheck className="w-4 h-4 text-[#8B7768]" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CouponModal 
        isOpen={isCouponModalOpen} 
        onClose={() => setIsCouponModalOpen(false)} 
        onApply={(amount, code) => setDiscount({ amount, code })}
        cartTotal={total}
      />
    </>
  );
}