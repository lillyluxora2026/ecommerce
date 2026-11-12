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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#382F2A]/50 backdrop-blur-sm animate-in fade-in px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#F7F3ED] border border-[#D8CBBE] flex flex-col p-6 sm:p-7 animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D8CBBE] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-[#8B7768]" />
            <h2 className="text-xl sm:text-2xl font-heading font-normal italic text-[#382F2A]">Apply Promo Code</h2>
          </div>
          <button type="button" aria-label="Close promo dialog" onClick={onClose} className="p-2 rounded-full text-[#63574F] hover:text-[#382F2A] hover:bg-[#EFE7DE] transition-colors -mr-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 text-sm font-sans">
          {error && <p className="rounded-xl text-[#9B2C2C] text-xs bg-[#FDF2F2] px-4 py-3 border border-[#F5C2C2]">{error}</p>}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#63574F]">Eligible Offers</p>
              {eligibleCoupons.length > 0 ? (
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#8B7768] font-medium">
                  {eligibleCoupons.length} available
                </span>
              ) : null}
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {couponsLoading ? (
                <div className="rounded-2xl border border-[#D8CBBE] bg-white p-4 text-xs text-[#63574F]">
                  Loading available offers...
                </div>
              ) : eligibleCoupons.length > 0 ? (
                eligibleCoupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => applyCoupon(coupon)}
                    className="w-full rounded-2xl border border-[#D8CBBE] bg-white p-4 text-left transition-all hover:border-[#8B7768] hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#382F2A]">
                          {coupon.code}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-[#382F2A]">{getCouponOfferLabel(coupon)}</p>
                        {coupon.description ? (
                          <p className="mt-1 text-xs text-[#63574F]">{coupon.description}</p>
                        ) : null}
                        {toNumber(coupon.min_order_value) > 0 ? (
                          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#8B7E76]">
                            Valid on orders above ₹{toNumber(coupon.min_order_value)}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#2C6E49]">
                          Save ₹{getDiscountAmount(coupon, cartTotal).toFixed(0)}
                        </span>
                        <span className="mt-2.5 inline-block rounded-full bg-[#EFE7DE] border border-[#D8CBBE] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#382F2A]">
                          Apply
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-[#D8CBBE] bg-[#EFE7DE]/60 p-4 text-xs sm:text-sm text-[#63574F]">
                  No eligible coupons for this bag total right now.
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#D8CBBE] pt-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#63574F]">Have a promo code?</p>
          </div>

          <input
            required
            placeholder="Enter promo code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full bg-white border border-[#D8CBBE] rounded-xl px-4 py-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76] uppercase tracking-wider"
          />
          
          <button
            type="submit"
            disabled={loading || !code}
            className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Apply Discount'}
          </button>
        </form>
      </div>
    </div>
  );
}
