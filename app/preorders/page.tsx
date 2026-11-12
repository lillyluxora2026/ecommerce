'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { NoticeBanner } from '@/components/ui/NoticeBanner';

type Preorder = {
  id: string;
  quantity: number;
  status: string;
  createdAt: string;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  variantLabel: string | null;
  unitPrice: number | null;
  orderId: string | null;
  orderNumber: number | null;
  orderFinancialStatus: string | null;
};

type PreordersResponse = {
  error?: string;
  preorders?: Preorder[];
};

const statusStyles: Record<string, string> = {
  pending: 'border-[#C5A574]/40 bg-[#C5A574]/15 text-[#382F2A]',
  payment_pending: 'border-[#8B7768]/40 bg-[#EFE7DE] text-[#6D5C50]',
  fulfilled: 'border-[#2C6E49]/40 bg-[#F2F7F4] text-[#2C6E49]',
  cancelled: 'border-red-500/30 bg-red-50 text-red-600',
};

export default function PreordersPage() {
  const { user, session, setAuthModalOpen } = useUserStore();
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreorders(accessToken: string) {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/preorders', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        const payload = await response.json() as PreordersResponse;
        if (!response.ok) {
          throw new Error(payload.error || 'Could not load preorder history.');
        }

        setPreorders(payload.preorders || []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Could not load preorder history.');
      } finally {
        setLoading(false);
      }
    }

    if (!user || !session?.access_token) {
      setPreorders([]);
      setLoading(false);
      return;
    }

    loadPreorders(session.access_token);
  }, [session?.access_token, user]);

  if (!user) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Pre-Order Reservations
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          My Preorders
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-sm mb-8 leading-relaxed">
          Please log in to view your reserved pieces and track their restocking status.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Sign In
        </button>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        <div className="border-b border-[#B7A596]/40 pb-6 mb-8">
          <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-1">
            Exclusive Reservations
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
            My Preorders
          </h1>
        </div>

        {error && (
          <NoticeBanner tone="error" className="mb-8">
            {error}
          </NoticeBanner>
        )}

        {loading ? (
          <div className="py-24 text-center text-sm font-sans text-[#63574F] animate-pulse">Loading preorder reservations...</div>
        ) : preorders.length === 0 ? (
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white px-8 py-16 text-center max-w-xl mx-auto shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-2">No Active Reservations</h2>
            <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-md mx-auto mb-8 leading-relaxed">
              When an out-of-stock piece is reserved, its restocking progress and payment link will appear right here.
            </p>
            <Link
              href="/products"
              className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3 text-xs font-sans font-medium tracking-wide uppercase inline-block shadow-sm"
            >
              Browse Jewellery
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {preorders.map((preorder) => (
              <div key={preorder.id} className="rounded-2xl border border-[#E5DACF] bg-white p-6 md:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex gap-4 min-w-0">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F7F3ED] border border-[#E0D4C6]">
                      {preorder.productImage ? (
                        <Image
                          src={preorder.productImage}
                          alt={preorder.productName}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      {preorder.productSlug ? (
                        <Link href={`/product/${preorder.productSlug}`} className="text-lg font-heading text-[#382F2A] hover:text-[#8B7768] transition-colors">
                          {preorder.productName}
                        </Link>
                      ) : (
                        <h2 className="text-lg font-heading text-[#382F2A]">{preorder.productName}</h2>
                      )}

                      {preorder.variantLabel && (
                        <p className="mt-1 text-xs font-sans text-[#63574F]">{preorder.variantLabel}</p>
                      )}

                      <div className="mt-3 space-y-1 text-xs font-sans text-[#63574F]">
                        <p>Reserved on {new Date(preorder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p>Quantity: {preorder.quantity}</p>
                        {preorder.unitPrice !== null && <p className="font-semibold text-[#382F2A]">Expected price: ₹{preorder.unitPrice.toFixed(0)}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2.5">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider ${statusStyles[preorder.status] || 'border-[#B7A596]/40 text-[#63574F]'}`}>
                      {preorder.status}
                    </span>
                    <p className="text-xs font-sans text-[#63574F] max-w-xs md:text-right leading-relaxed">
                      {preorder.orderId && preorder.orderFinancialStatus === 'paid'
                        ? `Confirmed as order #${preorder.orderNumber || preorder.orderId.slice(0, 8)}.`
                        : preorder.orderId || preorder.status === 'payment_pending'
                        ? `Reservation is now order #${preorder.orderNumber || preorder.orderId?.slice(0, 8) || 'pending'} and is awaiting payment.`
                        : preorder.status === 'fulfilled'
                        ? 'This reservation has been fulfilled.'
                        : preorder.status === 'cancelled'
                          ? 'This reservation has been cancelled.'
                          : 'Your reservation is pending review. We will notify you when fresh stock arrives.'}
                    </p>
                    {preorder.orderId && (
                      <Link
                        href={`/orders?orderId=${preorder.orderId}&status=${preorder.orderFinancialStatus === 'paid' ? 'paid' : 'pending'}`}
                        className="text-xs font-sans font-semibold text-[#8B7768] hover:text-[#58483D] underline underline-offset-4"
                      >
                        View Order Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
