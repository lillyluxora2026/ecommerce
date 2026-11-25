import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing the use of the Lily Luxora website and all orders.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="border-b border-[#EBEBEB] pb-6 mb-8">
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#555555] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-4xl font-sans font-normal tracking-tight text-[#121212]">
            Terms of Service
          </h1>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#555555] leading-relaxed">
          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">User Agreement</h2>
            <p>
              By accessing the Lily Luxora website, you agree to the accompanying terms and conditions of this storefront. Any orders and purchases made through this site are also governed by these terms and conditions. We reserve the right to update these terms at our discretion without prior notice.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Governing Laws</h2>
            <p>
              This website is governed by the laws and courts of India (Karnataka jurisdiction). Any orders placed on this site and use of this site must comply with applicable national and local laws.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Product Information &amp; Pricing</h2>
            <p>
              We take utmost care to ensure product descriptions, 18K PVD finish details, pricing in INR, and availability are accurate. In the event of an inadvertent error or inaccuracy, we reserve the right to correct or update information and cancel or adjust unshipped orders accordingly.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Payment Terms</h2>
            <p>
              <strong className="text-[#121212] font-medium">Cash on Delivery (COD) is not available.</strong> All orders must be prepaid online at checkout via our encrypted Razorpay payment gateway, supporting Credit Cards, Debit Cards, UPI, Net Banking, and Digital Wallets.
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Returns &amp; Refunds</h2>
            <p>
              <strong className="text-[#121212] font-medium">All sales are final</strong> due to hygiene and demi-fine craftsmanship standards, except in verified cases of transit damage or defective items reported within 24 hours of delivery (as outlined in our Refund Policy).
            </p>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Shipping &amp; Third-Party Links</h2>
            <p>
              All orders are fulfilled through trusted courier partners across India. While we strive for prompt dispatch within 24–48 hours, Lily Luxora is not liable for carrier transit delays beyond our reasonable control. Any external links displayed on this website are independent of Lily Luxora and accessed at your own discretion.
            </p>
          </section>

          <section className="bg-[#FAFAFA] border border-[#EBEBEB] p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-sans font-medium text-[#121212]">Intellectual Property &amp; Liability</h2>
            <p>
              All brand photography, graphics, wordmarks, product descriptions, and layouts on this site are the exclusive property of Lily Luxora and may not be reproduced or redistributed without written consent. Lily Luxora is not liable for indirect, incidental, or consequential damages arising from site access or technical interruptions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
