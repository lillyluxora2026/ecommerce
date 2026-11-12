import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'All Products',
  description:
    'Browse the full Lily Luxora collection — demi-fine jewellery and accessories for every occasion. Filter by category, price, and size.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'All Products | Lily Luxora',
    description:
      'Browse the full Lily Luxora collection — demi-fine jewellery and accessories for every occasion.',
    url: '/products',
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
