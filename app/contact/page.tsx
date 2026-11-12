import { Metadata } from 'next';
import { Instagram, MapPin, Mail, Clock, MessageSquare, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Customer Concierge — Lily Luxora',
  description: 'Get in touch with Lily Luxora via WhatsApp Concierge, Instagram, or email. We are here to assist with styling advice, orders, and sizing.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Customer Concierge | Lily Luxora',
    description: 'Get in touch with Lily Luxora via WhatsApp, Instagram, or email.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 md:px-12 pt-16 md:pt-24 pb-12 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Customer Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          We&apos;re Here to Help
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-lg mx-auto leading-relaxed">
          Whether you need assistance selecting the perfect piece, have questions about your order, or need guidance on jewellery care, our team is at your service.
        </p>
        <div className="h-[1px] w-24 bg-[#B7A596]/60 mx-auto mt-8" />
      </section>

      {/* Main Contact Grid */}
      <section className="max-w-6xl mx-auto px-4 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* WhatsApp Concierge */}
          <a
            href="https://wa.me/916282660237"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E5DACF] shadow-xs hover:border-[#8B7768] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-5 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A] mb-2">WhatsApp Concierge</h3>
            <p className="text-[#63574F] font-sans text-xs mb-4 leading-relaxed">
              Instant assistance for order tracking, styling questions, and pre-orders.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-semibold text-[#8B7768] underline underline-offset-4">
              Chat on WhatsApp →
            </span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/lilyluxora"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E5DACF] shadow-xs hover:border-[#8B7768] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-5 group-hover:scale-105 transition-transform">
              <Instagram className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A] mb-2">Instagram Direct</h3>
            <p className="text-[#63574F] font-sans text-xs mb-4 leading-relaxed">
              Tag us @lilyluxora, discover styling reels, and message our creative team.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-semibold text-[#8B7768] underline underline-offset-4">
              @lilyluxora →
            </span>
          </a>

          {/* Email Support */}
          <a
            href="mailto:support@lilyluxora.com"
            className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E5DACF] shadow-xs hover:border-[#8B7768] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#EFE7DE] flex items-center justify-center text-[#8B7768] mb-5 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="font-heading text-lg font-normal text-[#382F2A] mb-2">Email Support</h3>
            <p className="text-[#63574F] font-sans text-xs mb-4 leading-relaxed">
              For corporate gifting, bulk orders, and formal customer inquiries.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-semibold text-[#8B7768] underline underline-offset-4">
              support@lilyluxora.com →
            </span>
          </a>
        </div>

        {/* Operating Hours & Dispatch Information */}
        <div className="rounded-2xl border border-[#D8CBBE] bg-[#EFE7DE] p-8 md:p-10 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[#8B7768] uppercase tracking-[0.2em] text-xs font-sans font-semibold block">
              Concierge Hours
            </span>
            <h2 className="font-heading text-2xl font-normal text-[#382F2A]">
              We Are Available Daily
            </h2>
            <div className="space-y-2.5 font-sans text-xs sm:text-sm text-[#63574F]">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#8B7768] shrink-0" />
                <span>Monday – Sunday: 10:00 AM – 11:00 PM (IST)</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-[#8B7768] shrink-0" />
                <span>Direct WhatsApp Helpline: +91 62826 60237</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:border-l md:border-[#D8CBBE] md:pl-8">
            <span className="text-[#8B7768] uppercase tracking-[0.2em] text-xs font-sans font-semibold block">
              Pan-India Express Dispatch
            </span>
            <h2 className="font-heading text-2xl font-normal text-[#382F2A]">
              Fast, Insured Deliveries
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#63574F] leading-relaxed">
              All orders are packed in signature luxury Lily Luxora boxes and dispatched within 24–48 hours from Kerala. Express transit time is 3–5 business days across India.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}