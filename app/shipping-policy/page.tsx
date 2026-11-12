import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Store Policy',
  description: 'Learn about Pan-India shipping rates, dispatch timelines, and Lily Luxora store policies.',
  alternates: { canonical: '/shipping-policy' },
};

export default function ShippingPolicyPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 md:py-20">
        <div className="border-b border-[#D8CBBE] pb-8 mb-10">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-normal italic tracking-tight text-[#382F2A]">
            Shipping &amp; Store Policy
          </h1>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#63574F] leading-relaxed">
          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-2xl font-heading font-normal text-[#382F2A] border-b border-[#E5DACF] pb-3">Shipping &amp; Delivery</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1">1. Do you deliver Pan-India?</h3>
                <p>Yes — we ship across 28,000+ pin codes throughout India via trusted express logistics partners.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1">2. Processing &amp; Delivery Timelines</h3>
                <p>Orders are hand-inspected and dispatched within 24–48 hours. Standard delivery typically arrives within 3–6 business days depending on your city.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1.5">3. Shipping Charges</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className="text-[#382F2A]">Orders above ₹999:</strong> Complimentary FREE Shipping</li>
                  <li><strong className="text-[#382F2A]">South India (Kerala, Karnataka, Tamil Nadu, Andhra Pradesh):</strong> ₹49</li>
                  <li><strong className="text-[#382F2A]">Rest of India:</strong> ₹79</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1">4. Order Tracking</h3>
                <p>Tracking links are shared automatically via email and WhatsApp once dispatched, and remain accessible inside your My Orders dashboard.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-5 shadow-xs">
            <h2 className="text-2xl font-heading font-normal text-[#382F2A] border-b border-[#E5DACF] pb-3">Payments &amp; Security</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1">1. Accepted Payment Methods</h3>
                <p>UPI, Credit &amp; Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking, and Digital Wallets powered by 256-bit SSL Razorpay checkout.</p>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#382F2A] mb-1">2. Cash on Delivery (COD)</h3>
                <p>COD is not offered. All orders must be prepaid online to guarantee tamper-proof insured jewellery dispatch.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-[#EFE7DE]/70 border border-[#D8CBBE] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-heading font-normal text-[#382F2A] border-b border-[#D8CBBE] pb-3">18K PVD Care &amp; Concierge Support</h2>
            <p>
              Every Lily Luxora piece is crafted with hypoallergenic 316L stainless steel and coated with durable 18K PVD gold for daily waterproof, anti-tarnish wear. Need assistance with an order? Message our concierge on WhatsApp or email{' '}
              <strong className="text-[#382F2A]">support@lilyluxora.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
