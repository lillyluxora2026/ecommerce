'use client';

import { usePathname } from 'next/navigation';

const WHATSAPP_URL =
  'https://wa.me/916282660237?text=Hi%20Lily%20Luxora%2C%20I%20would%20love%20to%20know%20more%20about%20your%20jewellery%20collection.';

export function WhatsAppButton() {
  const pathname = usePathname();
  const hasMobileStickyBar =
    pathname?.startsWith('/product/') || pathname?.startsWith('/checkout');

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Lily Luxora on WhatsApp"
      className={`fixed right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.38)] transition-transform duration-200 hover:scale-105 hover:bg-[#20BD5A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] sm:right-6 sm:bottom-6 ${
        hasMobileStickyBar ? 'bottom-22 md:bottom-6' : 'bottom-5'
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 fill-current"
        aria-hidden="true"
      >
        <path d="M16 3C8.82 3 3 8.82 3 16c0 2.31.6 4.57 1.75 6.56L3.11 28.5l6.11-1.6A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.62c-2.06 0-4.08-.56-5.85-1.61l-.42-.25-3.63.95.97-3.54-.27-.44A10.6 10.6 0 0 1 5.38 16C5.38 10.14 10.14 5.38 16 5.38S26.62 10.14 26.62 16 21.86 26.62 16 26.62zm5.82-7.95c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.72.16-.21.32-.82 1.03-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.68.76.24 1.46.21 2.01.13.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.38.18-1.51-.07-.14-.29-.22-.61-.38z" />
      </svg>
    </a>
  );
}
