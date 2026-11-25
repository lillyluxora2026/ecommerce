'use client';

import { X, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | string | null;
  min_order_value: number | string | null;
  max_discount: number | string | null;
  usage_limit: number | null;
  used_count: number | null;
  is_active: boolean | null;
  starts_at: string | null;
  expires_at: string | null;
};

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: number, code: string) => void;
  cartTotal: number;
}

function toNumber(value: number | string | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDiscountAmount(coupon: CouponRow, orderTotal: number) {
  if (coupon.discount_type === 'percentage') {
    const amount = orderTotal * (toNumber(coupon.discount_value) / 100);
    const maxDiscount = toNumber(coupon.max_discount);
    return maxDiscount > 0 ? Math.min(amount, maxDiscount) : amount;
  }

  return toNumber(coupon.discount_value);
}

function isCouponEligible(coupon: CouponRow, orderTotal: number) {
  const now = new Date();

  if (!coupon.is_active) return false;
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return false;
  if (coupon.expires_at && new Date(coupon.expires_at) < now) return false;
  if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) return false;
  if (toNumber(coupon.min_order_value) > 0 && orderTotal < toNumber(coupon.min_order_value)) return false;

  return getDiscountAmount(coupon, orderTotal) > 0;
}

function getCouponOfferLabel(coupon: CouponRow) {
  if (coupon.discount_type === 'percentage') {
    const maxDiscount = toNumber(coupon.max_discount);
    return `${toNumber(coupon.discount_value)}% off${maxDiscount > 0 ? ` up to ₹${maxDiscount}` : ''}`;
  }

  return `Flat ₹${toNumber(coupon.discount_value)} off`;
}

export function CouponModal({ isOpen, onClose, onApply, cartTotal }: CouponModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadCoupons = async () => {
      setCouponsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active, starts_at, expires_at')
        .order('created_at', { ascending: false });

      if (!cancelled) {
        if (fetchError || !data) {
          setCoupons([]);
        } else {
          setCoupons(data as CouponRow[]);
        }
        setCouponsLoading(false);
      }
    };

    void loadCoupons();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const eligibleCoupons = useMemo(
    () =>
      coupons
        .filter((coupon) => isCouponEligible(coupon, cartTotal))
        .sort((a, b) => getDiscountAmount(b, cartTotal) - getDiscountAmount(a, cartTotal)),
    [coupons, cartTotal]
  );

  const applyCoupon = (coupon: CouponRow) => {
    const discountAmount = getDiscountAmount(coupon, cartTotal);
    if (discountAmount <= 0) return;

    onApply(discountAmount, coupon.code);
    onClose();
  };

  if (!isOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError(null);

    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim().toUpperCase())
      .maybeSingle();

    if (fetchError || !coupon) {
      setError('Invalid coupon code.');
    } else if (!coupon.is_active) {
      setError('This coupon is no longer active.');
    } else if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
      setError(`Minimum order value of ₹${coupon.min_order_value} required.`);
    } else {
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = cartTotal * (coupon.discount_value / 100);
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
      } else {
        discountAmount = coupon.discount_value;
      }

      onApply(discountAmount, coupon.code);
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in px-4">
      <div className="w-full max-w-md bg-white border border-[#EBEBEB] flex flex-col p-6 sm:p-7 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
            <h2 className="text-lg font-sans font-medium text-[#121212]">Apply Promo Code</h2>
          </div>
          <button type="button" aria-label="Close promo dialog" onClick={onClose} className="p-2 text-[#121212] hover:bg-[#F5F5F5] transition-colors -mr-1">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 text-sm font-sans">
          {error && <p className="text-red-800 text-xs bg-red-50 px-4 py-3 border border-red-200">{error}</p>}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#555555]">Eligible Offers</p>
              {eligibleCoupons.length > 0 ? (
                <span className="text-[11px] text-[#555555] font-medium">
                  {eligibleCoupons.length} available
                </span>
              ) : null}
            </div>

            <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
              {couponsLoading ? (
                <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-4 text-xs text-[#555555]">
                  Loading available offers...
                </div>
              ) : eligibleCoupons.length > 0 ? (
                eligibleCoupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => applyCoupon(coupon)}
                    className="w-full border border-[#EBEBEB] bg-white p-4 text-left transition-colors hover:border-[#121212]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-[#121212]">
                          {coupon.code}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-[#121212]">{getCouponOfferLabel(coupon)}</p>
                        {coupon.description ? (
                          <p className="mt-1 text-xs text-[#555555]">{coupon.description}</p>
                        ) : null}
                        {toNumber(coupon.min_order_value) > 0 ? (
                          <p className="mt-2 text-[10px] uppercase tracking-wider text-[#737373]">
                            Valid on orders above ₹{toNumber(coupon.min_order_value)}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="block text-xs font-medium text-emerald-700">
                          Save ₹{getDiscountAmount(coupon, cartTotal).toFixed(0)}
                        </span>
                        <span className="mt-2 inline-block bg-[#F4F4F4] border border-[#E5E5E5] px-3.5 py-1 text-[11px] font-medium text-[#121212]">
                          Apply
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-4 text-xs sm:text-sm text-[#555555]">
                  No eligible coupons for this bag total right now.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#EBEBEB] pt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#555555]">Have a promo code?</p>
          </div>

          <input
            required
            placeholder="Enter promo code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full bg-white border border-[#D4D4D4] px-3.5 py-3 outline-none focus:border-[#121212] transition-colors text-[#121212] placeholder:text-[#737373] uppercase tracking-wider"
          />

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-[#121212] hover:bg-[#2C2C2C] text-white py-3.5 text-xs sm:text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Apply discount'}
          </button>
        </form>
      </div>
    </div>
  );
}
