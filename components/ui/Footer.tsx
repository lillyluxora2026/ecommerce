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
    <footer className="mt-12 border-t border-[#EBEBEB] bg-[#F8F8F8] text-[#121212]">
      {/* Newsletter Strip */}
      <div className="border-b border-[#EBEBEB] py-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h3 className="font-sans text-xl sm:text-2xl text-[#121212] font-normal tracking-tight">
            Subscribe to our emails
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
            Be the first to know about new demi-fine collections and exclusive offers.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto pt-2 flex flex-col sm:flex-row gap-2">
            {subscribed ? (
              <div className="w-full py-3 px-4 bg-white border border-[#D4D4D4] text-[#121212] flex items-center justify-center gap-2 text-xs font-sans">
                <CheckCircle2 className="h-4 w-4 text-[#121212]" />
                <span>Thank you for joining. Welcome to Lily Luxora.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border border-[#D4D4D4] px-4 py-3 text-sm font-sans text-[#121212] placeholder:text-[#737373] focus:outline-none focus:border-[#121212] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-6 py-3 text-xs font-sans font-medium tracking-wide transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Subscribe</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <Image
                src="/logo-v2.png"
                alt="Lily Luxora"
                width={200}
                height={57}
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>

            <p className="font-sans text-xs sm:text-sm text-[#555555] max-w-sm leading-relaxed">
              Minimal demi-fine jewellery in 18K PVD gold plating and stainless steel. Waterproof, anti-tarnish, and crafted for everyday wear.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 font-sans text-xs text-[#121212]">
              <a
                href="https://www.instagram.com/lilyluxora"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:underline underline-offset-4 w-fit"
              >
                <Instagram className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
                <span>@lilyluxora on Instagram</span>
              </a>
              <a
                href="https://wa.me/916282660237"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:underline underline-offset-4 w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#121212]">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>+91 62826 60237 (WhatsApp Support)</span>
              </a>
              <a
                href="https://share.google/4HYEkxNDVewBf09NS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:underline underline-offset-4 w-fit"
              >
                <MapPin className="w-4 h-4 text-[#121212]" strokeWidth={1.5} />
                <span>Pan-India Express Fulfilment</span>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#121212]">
              Collections
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#555555]">
              <li>
                <Link href="/products" className="hover:text-[#121212] transition-colors">
                  Shop All Jewellery
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="hover:text-[#121212] transition-colors">
                  Necklaces &amp; Pendants
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="hover:text-[#121212] transition-colors">
                  Earrings &amp; Hoops
                </Link>
              </li>
              <li>
                <Link href="/category/bracelets" className="hover:text-[#121212] transition-colors">
                  Bracelets &amp; Cuffs
                </Link>
              </li>
              <li>
                <Link href="/products?maxPrice=1799" className="hover:text-[#121212] transition-colors">
                  Under Rs. 1,799
                </Link>
              </li>
              <li>
                <Link href="/category" className="hover:text-[#121212] transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand Promise & About */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#121212]">
              The Craft
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#555555]">
              <li>
                <Link href="/about" className="hover:text-[#121212] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#materials" className="hover:text-[#121212] transition-colors">
                  18K PVD Gold Plating
                </Link>
              </li>
              <li>
                <Link href="/about#waterproof" className="hover:text-[#121212] transition-colors">
                  Waterproof Guarantee
                </Link>
              </li>
              <li>
                <Link href="/about#care" className="hover:text-[#121212] transition-colors">
                  Jewellery Care Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#121212]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#555555]">
              <li>
                <Link href="/contact" className="hover:text-[#121212] transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#121212] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#121212] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#121212] transition-colors">
                  Returns &amp; Replacements
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-[#121212] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#121212] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#EBEBEB] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-[#555555]">
          <p>&copy; {new Date().getFullYear()} Lily Luxora. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-[#121212] transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#121212] transition-colors">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:text-[#121212] transition-colors">
              Returns
            </Link>
            <AnalyticsPreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
