import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Store Policy',
  description: 'Learn about Pan-India shipping rates, dispatch timelines, and Lily Luxora store policies.',
  alternates: { canonical: '/shipping-policy' },
};

export default function ShippingPolicyPage() {
  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="border-b border-[#EBEBEB] pb-6 mb-8">
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#555555] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-4xl font-sans font-normal tracking-tight text-[#121212]">
            Shipping &amp; Store Policy
          </h1>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#555555] leading-relaxed">
          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-sans font-medium text-[#121212] border-b border-[#EBEBEB] pb-3">Shipping &amp; Delivery</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1">1. Do you deliver Pan-India?</h3>
                <p>Yes — we ship across 28,000+ pin codes throughout India via trusted express logistics partners.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1">2. Processing &amp; Delivery Timelines</h3>
                <p>Orders are hand-inspected and dispatched within 24–48 hours. Standard delivery typically arrives within 3–6 business days depending on your city.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1.5">3. Shipping Charges</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className="text-[#121212]">Orders above ₹999:</strong> Complimentary FREE Shipping</li>
                  <li><strong className="text-[#121212]">South India (Kerala, Karnataka, Tamil Nadu, Andhra Pradesh):</strong> ₹49</li>
                  <li><strong className="text-[#121212]">Rest of India:</strong> ₹79</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1">4. Order Tracking</h3>
                <p>Tracking links are shared automatically via email and WhatsApp once dispatched, and remain accessible inside your My Orders dashboard.</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#EBEBEB] p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-sans font-medium text-[#121212] border-b border-[#EBEBEB] pb-3">Payments &amp; Security</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1">1. Accepted Payment Methods</h3>
                <p>UPI, Credit &amp; Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking, and Digital Wallets powered by 256-bit SSL Razorpay checkout.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#121212] mb-1">2. Cash on Delivery (COD)</h3>
                <p>COD is not offered. All orders must be prepaid online to guarantee tamper-proof insured jewellery dispatch.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#FAFAFA] border border-[#EBEBEB] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-sans font-medium text-[#121212] border-b border-[#EBEBEB] pb-3">18K PVD Care &amp; Concierge Support</h2>
            <p>
              Every Lily Luxora piece is crafted with hypoallergenic 316L stainless steel and coated with durable 18K PVD gold for daily waterproof, anti-tarnish wear. Need assistance with an order? Message our concierge on WhatsApp or email{' '}
              <strong className="text-[#121212]">support@lilyluxora.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
