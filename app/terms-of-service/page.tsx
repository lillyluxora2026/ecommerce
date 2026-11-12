import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing the use of the Lily Luxora website and all orders.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 md:py-20">
        <div className="border-b border-[#D8CBBE] pb-8 mb-10">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-normal italic tracking-tight text-[#382F2A]">
            Terms of Service
          </h1>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#63574F] leading-relaxed">
          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">User Agreement</h2>
            <p>
              By accessing the Lily Luxora website, you agree to the accompanying terms and conditions of this storefront. Any orders and purchases made through this site are also governed by these terms and conditions. We reserve the right to update these terms at our discretion without prior notice.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Governing Laws</h2>
            <p>
              This website is governed by the laws and courts of India (Karnataka jurisdiction). Any orders placed on this site and use of this site must comply with applicable national and local laws.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Product Information &amp; Pricing</h2>
            <p>
              We take utmost care to ensure product descriptions, 18K PVD finish details, pricing in INR, and availability are accurate. In the event of an inadvertent error or inaccuracy, we reserve the right to correct or update information and cancel or adjust unshipped orders accordingly.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Payment Terms</h2>
            <p>
              <strong className="text-[#382F2A] font-semibold">Cash on Delivery (COD) is not available.</strong> All orders must be prepaid online at checkout via our encrypted Razorpay payment gateway, supporting Credit Cards, Debit Cards, UPI, Net Banking, and Digital Wallets.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Returns &amp; Refunds</h2>
            <p>
              <strong className="text-[#382F2A] font-semibold">All sales are final</strong> due to hygiene and demi-fine craftsmanship standards, except in verified cases of transit damage or defective items reported within 24 hours of delivery (as outlined in our Refund Policy).
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Shipping &amp; Third-Party Links</h2>
            <p>
              All orders are fulfilled through trusted courier partners across India. While we strive for prompt dispatch within 24–48 hours, Lily Luxora is not liable for carrier transit delays beyond our reasonable control. Any external links displayed on this website are independent of Lily Luxora and accessed at your own discretion.
            </p>
          </section>

          <section className="rounded-2xl bg-[#EFE7DE]/70 border border-[#D8CBBE] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Intellectual Property &amp; Liability</h2>
            <p>
              All brand photography, graphics, wordmarks, product descriptions, and layouts on this site are the exclusive property of Lily Luxora and may not be reproduced or redistributed without written consent. Lily Luxora is not liable for indirect, incidental, or consequential damages arising from site access or technical interruptions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
