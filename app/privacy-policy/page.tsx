import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information at Lily Luxora.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12 md:py-20">
        <div className="border-b border-[#D8CBBE] pb-8 mb-10">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-[#8B7768] block mb-2">
            Lily Luxora Policies
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-normal italic tracking-tight text-[#382F2A]">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#63574F] leading-relaxed">
          <section className="rounded-2xl bg-[#EFE7DE]/60 border border-[#D8CBBE] p-6 sm:p-8 space-y-3">
            <p>
              This Privacy Policy explains how Lily Luxora collects, uses, stores, and protects your personal information when you visit our storefront, browse our collections, or complete a purchase.
            </p>
            <p>
              This policy does not apply to third-party services or external websites linked from our storefront; please review their respective privacy policies directly.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">User Acceptance</h2>
            <p>
              By accessing or using the Lily Luxora storefront, you consent to the collection and processing of your information in accordance with this Privacy Policy and applicable Indian data protection laws, including the Information Technology Act, 2000.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Information We Collect</h2>
            <ol className="list-decimal pl-5 space-y-2.5">
              <li>
                Personal contact details you provide such as your name, email address, phone number, and shipping address to process orders and manage your jewellery account.
              </li>
              <li>
                Delivery updates and transaction confirmations received from our logistics partners and encrypted payment gateway (Razorpay). We never store raw card details on our servers.
              </li>
            </ol>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To fulfil, pack, and deliver your demi-fine jewellery orders across India.</li>
              <li>To send order status updates, tracking links, and customer concierge responses.</li>
              <li>To prevent unauthorized transactions, fraud, and payment abuse.</li>
              <li>To improve our storefront curation, mobile usability, and customer experience.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white border border-[#E5DACF] p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A]">Cookies &amp; Analytics</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Essential browser storage is used strictly to preserve your shopping bag and wishlist experience.</li>
              <li>Optional analytics tracking runs only when explicitly permitted through our preferences banner.</li>
              <li>You may update your cookie preference at any time via the &ldquo;Cookie Preferences&rdquo; link in the footer.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
