'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { AnalyticsPreferencesButton } from './AnalyticsPreferencesButton';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="mt-8 border-t border-[#B7A596]/40 bg-[#D8CBBE] text-[#382F2A]">
      {/* Newsletter Strip */}
      <div className="border-b border-[#B7A596]/40 py-12 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-[#8B7768] block">
            The Lily Luxora Club
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl text-[#382F2A] font-normal tracking-tight">
            Elevate Your Everyday Jewellery
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#63574F] max-w-xl mx-auto leading-relaxed">
            Subscribe for private collection previews, exclusive secret offers, and styling notes on demi-fine luxury.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto pt-2 flex flex-col sm:flex-row gap-2.5">
            {subscribed ? (
              <div className="w-full py-3 px-4 bg-[#F7F3ED] border border-[#B7A596] text-[#382F2A] flex items-center justify-center gap-2 text-xs font-sans tracking-wide">
                <CheckCircle2 className="h-4 w-4 text-[#8B7768]" />
                <span>Thank you for joining. Welcome to Lily Luxora.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#F7F3ED] border border-[#B7A596] px-4 py-2.5 text-xs font-sans text-[#382F2A] placeholder:text-[#8B7E76] focus:outline-none focus:border-[#8B7768] transition-colors rounded-sm"
                />
                <button
                  type="submit"
                  className="bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-semibold uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 rounded-sm"
                >
                  <span>Subscribe</span>
                  <Send className="h-3 w-3" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="9" r="4.5" fill="#8B7768" fillOpacity="0.8" />
                <circle cx="15" cy="9" r="4.5" fill="#C5A574" fillOpacity="0.8" />
                <circle cx="9" cy="15" r="4.5" fill="#C5A574" fillOpacity="0.8" />
                <circle cx="15" cy="15" r="4.5" fill="#8B7768" fillOpacity="0.8" />
                <circle cx="12" cy="12" r="2" fill="#F7F3ED" />
              </svg>
              <span className="font-heading text-2xl font-normal tracking-[0.06em] text-[#382F2A]">
                Lily Luxora
              </span>
            </Link>

            <p className="font-sans text-xs sm:text-sm text-[#63574F] max-w-sm leading-relaxed">
              Timeless demi-fine jewellery specialising in 18K PVD gold plating and stainless steel. Waterproof, hypoallergenic, and designed for effortless everyday elegance.
            </p>

            <div className="pt-2 flex flex-col gap-3 font-sans text-xs text-[#382F2A]">
              <a
                href="https://www.instagram.com/lilyluxora"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#8B7768] transition-colors w-fit"
              >
                <Instagram className="w-4 h-4 text-[#8B7768]" />
                <span className="tracking-wide">@lilyluxora on Instagram</span>
              </a>
              <a
                href="https://wa.me/916282660237"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#8B7768] transition-colors w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B7768]">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span className="tracking-wide">+91 62826 60237 (WhatsApp Support)</span>
              </a>
              <a
                href="https://share.google/4HYEkxNDVewBf09NS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#8B7768] transition-colors w-fit"
              >
                <MapPin className="w-4 h-4 text-[#8B7768]" />
                <span className="tracking-wide">Pan-India Express Fulfilment</span>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#382F2A]">
              Collections
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#63574F]">
              <li>
                <Link href="/products" className="hover:text-[#382F2A] transition-colors">
                  Shop All Jewellery
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="hover:text-[#382F2A] transition-colors">
                  Necklaces & Chains
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="hover:text-[#382F2A] transition-colors">
                  Earrings & Hoops
                </Link>
              </li>
              <li>
                <Link href="/category/bracelets" className="hover:text-[#382F2A] transition-colors">
                  Bracelets & Cuffs
                </Link>
              </li>
              <li>
                <Link href="/category/rings" className="hover:text-[#382F2A] transition-colors">
                  Rings & Stacks
                </Link>
              </li>
              <li>
                <Link href="/category" className="hover:text-[#382F2A] transition-colors">
                  Featured Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand Promise & About */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#382F2A]">
              The Craft
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#63574F]">
              <li>
                <Link href="/about" className="hover:text-[#382F2A] transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about#materials" className="hover:text-[#382F2A] transition-colors">
                  18K PVD Gold Plating
                </Link>
              </li>
              <li>
                <Link href="/about#waterproof" className="hover:text-[#382F2A] transition-colors">
                  Waterproof Guarantee
                </Link>
              </li>
              <li>
                <Link href="/about#care" className="hover:text-[#382F2A] transition-colors">
                  Jewellery Care Guide
                </Link>
              </li>
              <li>
                <a href="https://www.instagram.com/lilyluxora" target="_blank" rel="noopener noreferrer" className="hover:text-[#382F2A] transition-colors">
                  Instagram Community
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#382F2A]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#63574F]">
              <li>
                <Link href="/contact" className="hover:text-[#382F2A] transition-colors">
                  Contact Customer Concierge
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#382F2A] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#382F2A] transition-colors">
                  Shipping & Pan-India Delivery
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#382F2A] transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-[#382F2A] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#382F2A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#B7A596]/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-[#63574F]">
          <p>&copy; {new Date().getFullYear()} Lily Luxora. Understated Demi-Fine Jewellery. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-[#382F2A] transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#382F2A] transition-colors">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:text-[#382F2A] transition-colors">
              Returns
            </Link>
            <AnalyticsPreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
