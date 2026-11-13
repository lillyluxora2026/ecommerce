import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AuthSessionSync } from "@/components/providers/AuthSessionSync";
import { AnalyticsConsent } from "@/components/providers/AnalyticsConsent";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthModal } from "@/components/modals/AuthModal";
import { DEFAULT_SITE_URL, getSiteUrl } from "@/lib/server/site-url";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = getSiteUrl() || DEFAULT_SITE_URL;

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lily Luxora',
    template: '%s | Lily Luxora',
  },
  description:
    'Discover handpicked demi-fine jewellery & accessories at Lily Luxora. Timeless classics and statement pieces for everyday elegance — shipped Pan-India.',
  keywords: [
    'demi-fine jewellery',
    'accessories',
    'jewellery India',
    'jewellery online',
    'Lily Luxora',
    'statement jewellery',
    'anti-tarnish jewellery',
    'buy jewellery online India',
  ],
  authors: [{ name: 'Lily Luxora', url: SITE_URL }],
  creator: 'Lily Luxora',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Lily Luxora',
    title: 'Lily Luxora',
    description:
      'Discover handpicked demi-fine jewellery & accessories at Lily Luxora. Timeless classics and statement pieces — shipped Pan-India.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lily Luxora — Demi-Fine Jewellery & Accessories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lily Luxora',
    description:
      'Handpicked demi-fine jewellery & accessories. Timeless classics and statement pieces shipped Pan-India.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "we6jgukq1g");
          `}
        </Script>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1002287905901062');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F3ED] text-[#382F2A] selection:bg-[#C5A574]/25">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1002287905901062&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ThemeProvider>
          <AuthSessionSync />
          <Suspense fallback={null}>
            <AnalyticsConsent />
          </Suspense>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
