'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { CouponModal } from '@/components/modals/CouponModal';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [discount, setDiscount] = useState({ amount: 0, code: '' });

  if (items.length === 0) {
    return (
      <main className="w-full bg-white text-[#121212] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-sans font-normal tracking-tight text-[#121212] mb-3">
          Your cart is empty
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#555555] max-w-md mb-7 leading-relaxed">
          Discover our waterproof, anti-tarnish 18K PVD gold-plated pieces designed for everyday luxury.
        </p>
        <Link
          href="/products"
          className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-8 py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const finalTotal = Math.max(0, total - discount.amount);
  const freeShippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <>
      <main className="w-full bg-white text-[#121212] min-h-screen">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#EBEBEB] pb-5 mb-7 gap-4">
            <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-tight text-[#121212]">
              Your cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h1>
            <Link
              href="/products"
              className="text-xs sm:text-[13px] font-sans text-[#121212] hover:opacity-70 underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </div>

          {/* Free Shipping Tracker */}
          <div className="mb-8 border border-[#EBEBEB] bg-[#F8F8F8] p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-sans mb-2">
              <span className="inline-flex items-center gap-2 text-[#121212]">
                <Truck className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="font-medium">You have unlocked Free Express Shipping</span>
                ) : (
                  <span>
                    Add <strong className="font-medium">Rs. {amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for Free Express Shipping
                  </span>
                )}
              </span>
              <span className="text-[#555555] tabular-nums">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E5E5E5] overflow-hidden">
              <div
                className="h-full bg-[#121212] transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 divide-y divide-[#EBEBEB] border-y border-[#EBEBEB]">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || 'default'}`}
                  className="flex gap-4 sm:gap-6 bg-white py-5"
                >
                  <div className="relative aspect-square w-24 sm:w-28 bg-[#F6F6F6] flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full bg-[#F3F3F3]" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-sans text-sm sm:text-base font-normal text-[#121212] line-clamp-2">
                          <Link href={item.slug ? `/product/${item.slug}` : '#'} className="hover:underline underline-offset-4">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="font-sans text-sm sm:text-base font-normal text-[#121212] whitespace-nowrap tabular-nums">
                          Rs. {(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-sans text-[#555555]">
                          {item.variantLabel || '18K PVD Gold'}
                        </span>
                        {item.is_free_delivery && (
                          <span className="text-[10px] font-sans text-[#121212] bg-[#F4F4F4] px-2 py-0.5">
                            Free Shipping
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="inline-flex items-center border border-[#D4D4D4] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                          className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-sans text-[#121212] tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="p-2 text-[#737373] hover:text-red-600 transition-colors"
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
              <div className="bg-[#F8F8F8] border border-[#EBEBEB] p-6 sticky top-28 space-y-5">
                <h2 className="font-sans text-lg font-normal text-[#121212] border-b border-[#EBEBEB] pb-3.5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm font-sans">
                  <div className="flex justify-between text-[#555555]">
                    <span>Subtotal</span>
                    <span className="text-[#121212] tabular-nums">
                      Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discount.amount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({discount.code})</span>
                      <span className="tabular-nums">-Rs. {discount.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#555555]">
                    <button
                      onClick={() => setIsCouponModalOpen(true)}
                      className="underline underline-offset-4 hover:text-[#121212] transition-colors"
                    >
                      Apply Promo Code
                    </button>
                    {discount.code ? <span className="text-emerald-700">{discount.code}</span> : null}
                  </div>

                  <div className="flex justify-between text-[#555555]">
                    <span>Shipping</span>
                    <span>
                      {total >= FREE_SHIPPING_THRESHOLD || items.some((i) => i.is_free_delivery) ? (
                        <span className="text-emerald-700 font-medium">FREE</span>
                      ) : (
                        'Calculated at checkout'
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#EBEBEB] pt-4 flex justify-between items-center text-base sm:text-lg font-medium font-sans text-[#121212]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">
                    Rs. {finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 px-6 font-sans text-xs sm:text-[13px] font-medium tracking-wide flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Check out</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>

                <div className="pt-1 flex items-center justify-center gap-2 text-[11px] font-sans text-[#555555]">
                  <ShieldCheck className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
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
