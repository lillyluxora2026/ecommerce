import { Metadata } from 'next';
import { Instagram, Mail, Clock, MessageSquare, PhoneCall } from 'lucide-react';

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
    <main className="w-full bg-white text-[#121212] min-h-screen">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-10 text-center">
        <span className="text-[#555555] uppercase tracking-[0.2em] text-xs font-sans font-medium mb-3 block">
          Customer Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-sans font-normal tracking-tight text-[#121212] mb-4">
          We&apos;re Here to Help
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#555555] max-w-lg mx-auto leading-relaxed">
          Whether you need assistance selecting a piece, tracking your order, or jewellery care guidance, our team is at your service.
        </p>
      </section>

      {/* Main Contact Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* WhatsApp Concierge */}
          <a
            href="https://wa.me/916282660237"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center p-8 bg-white border border-[#EBEBEB] hover:border-[#121212] transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] mb-4">
              <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-sans text-base font-medium text-[#121212] mb-2">WhatsApp Concierge</h3>
            <p className="text-[#555555] font-sans text-xs mb-4 leading-relaxed">
              Instant assistance for order tracking and styling questions.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-medium text-[#121212] underline underline-offset-4">
              Chat on WhatsApp →
            </span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/lilyluxora"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center p-8 bg-white border border-[#EBEBEB] hover:border-[#121212] transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] mb-4">
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-sans text-base font-medium text-[#121212] mb-2">Instagram Direct</h3>
            <p className="text-[#555555] font-sans text-xs mb-4 leading-relaxed">
              Follow @lilyluxora and message us directly.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-medium text-[#121212] underline underline-offset-4">
              @lilyluxora →
            </span>
          </a>

          {/* Email Support */}
          <a
            href="mailto:support@lilyluxora.com"
            className="group flex flex-col items-center text-center p-8 bg-white border border-[#EBEBEB] hover:border-[#121212] transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] mb-4">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-sans text-base font-medium text-[#121212] mb-2">Email Support</h3>
            <p className="text-[#555555] font-sans text-xs mb-4 leading-relaxed">
              For gifting, bulk orders, and formal inquiries.
            </p>
            <span className="mt-auto inline-flex items-center text-xs font-sans font-medium text-[#121212] underline underline-offset-4">
              support@lilyluxora.com →
            </span>
          </a>
        </div>

        {/* Operating Hours & Dispatch Information */}
        <div className="border border-[#EBEBEB] bg-[#FAFAFA] p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-[#555555] uppercase tracking-[0.14em] text-xs font-sans font-medium block">
              Concierge Hours
            </span>
            <h2 className="font-sans text-xl font-normal text-[#121212]">
              We Are Available Daily
            </h2>
            <div className="space-y-2 font-sans text-xs sm:text-sm text-[#555555]">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#121212] shrink-0" strokeWidth={1.5} />
                <span>Monday – Sunday: 10:00 AM – 11:00 PM (IST)</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-[#121212] shrink-0" strokeWidth={1.5} />
                <span>Direct WhatsApp Helpline: +91 62826 60237</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:border-l md:border-[#EBEBEB] md:pl-8">
            <span className="text-[#555555] uppercase tracking-[0.14em] text-xs font-sans font-medium block">
              Pan-India Express Dispatch
            </span>
            <h2 className="font-sans text-xl font-normal text-[#121212]">
              Fast, Insured Deliveries
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#555555] leading-relaxed">
              All orders are packed safely and dispatched within 24–48 hours from Kerala. Express transit time is 3–5 business days across India.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
