import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund and Return Policy',
  description: 'Our refund, return, and cancellation policies for all Lily Luxora orders.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 md:py-20">
        <div className="border-b border-[#D8CBBE] pb-8 mb-10">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-normal italic tracking-tight text-[#382F2A]">
            Refund &amp; Return Policy
          </h1>
        </div>

        <div className="rounded-2xl bg-[#EFE7DE] border border-[#C5A574]/60 p-6 md:p-8 mb-10 shadow-xs">
          <h2 className="text-[#382F2A] text-xl font-heading font-normal mb-2 flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#8B7768]" />
            <span>Important Hygiene &amp; Final Sale Notice</span>
          </h2>
          <p className="mb-1.5 text-[#8B7768] text-xs font-sans font-bold uppercase tracking-[0.2em]">
            Prepaid Orders Only &bull; All Sales Final
          </p>
          <p className="text-[#63574F] text-sm font-sans leading-relaxed">
            For personal hygiene and quality assurance on earrings, necklaces, bracelets, and rings, all sales are final unless an item arrives damaged or defective.
          </p>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#63574F] leading-relaxed">
          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Payment Policy</h2>
            <p>
              <strong className="text-[#382F2A] font-semibold">Cash on Delivery (COD) is not available.</strong> Every order is completed securely online via Razorpay (UPI, Credit/Debit Cards, Net Banking, and Wallets) before dispatch.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Returns &amp; Refunds</h2>
            <p>
              Because our demi-fine pieces are crafted for direct skin contact, we cannot accept returns, size exchanges, or monetary refunds for change of mind or incorrect size selection. Please review product measurements and finish details carefully before checking out.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Damaged or Incorrect Pieces</h2>
            <p>
              In the rare event your order arrives damaged in transit or contains an incorrect piece, please write to{' '}
              <strong className="text-[#382F2A] select-all">support@lilyluxora.com</strong> or message our concierge within{' '}
              <strong className="text-[#382F2A]">24 hours of delivery</strong> with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your order reference number</li>
              <li>A clear unboxing video and photographs showing the defect</li>
              <li>A brief description of the issue</li>
            </ul>
            <p>
              Once verified, we will gladly arrange a complimentary replacement of the same piece at zero additional cost.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Order Cancellation</h2>
            <p>
              Orders may only be cancelled prior to courier dispatch. Once your jewellery parcel has been handed over to our delivery partner, cancellations are no longer possible. Contact{' '}
              <strong className="text-[#382F2A] select-all">support@lilyluxora.com</strong> immediately for pre-dispatch requests.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
