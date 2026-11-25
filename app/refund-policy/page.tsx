import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund and Return Policy',
  description: 'Our refund, return, and cancellation policies for all Lily Luxora orders.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="border-b border-[#EBEBEB] pb-6 mb-8">
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#555555] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-4xl font-sans font-normal tracking-tight text-[#121212]">
            Refund &amp; Return Policy
          </h1>
        </div>

        <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6 md:p-8 mb-8">
          <h2 className="text-[#121212] text-lg font-sans font-medium mb-2 flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#121212]" strokeWidth={1.5} />
            <span>Important Hygiene &amp; Final Sale Notice</span>
          </h2>
          <p className="mb-1.5 text-[#121212] text-xs font-sans font-medium uppercase tracking-[0.14em]">
            Prepaid Orders Only &bull; All Sales Final
          </p>
          <p className="text-[#555555] text-sm font-sans leading-relaxed">
            For personal hygiene and quality assurance on earrings, necklaces, bracelets, and rings, all sales are final unless an item arrives damaged or defective.
          </p>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#555555] leading-relaxed">
          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Payment Policy</h2>
            <p>
              <strong className="text-[#121212] font-medium">Cash on Delivery (COD) is not available.</strong> Every order is completed securely online via Razorpay (UPI, Credit/Debit Cards, Net Banking, and Wallets) before dispatch.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Returns &amp; Refunds</h2>
            <p>
              Because our demi-fine pieces are crafted for direct skin contact, we cannot accept returns, size exchanges, or monetary refunds for change of mind or incorrect size selection. Please review product measurements and finish details carefully before checking out.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Damaged or Incorrect Pieces</h2>
            <p>
              In the rare event your order arrives damaged in transit or contains an incorrect piece, please write to{' '}
              <strong className="text-[#121212] select-all">support@lilyluxora.com</strong> or message our concierge within{' '}
              <strong className="text-[#121212]">24 hours of delivery</strong> with:
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

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Order Cancellation</h2>
            <p>
              Orders may only be cancelled prior to courier dispatch. Once your jewellery parcel has been handed over to our delivery partner, cancellations are no longer possible. Contact{' '}
              <strong className="text-[#121212] select-all">support@lilyluxora.com</strong> immediately for pre-dispatch requests.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
