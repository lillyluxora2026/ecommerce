import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Explore all demi-fine jewellery collections at Lily Luxora. From necklaces to earrings, bracelets to rings — discover your perfect style.',
  alternates: {
    canonical: '/category',
  },
  openGraph: {
    title: 'Collections | Lily Luxora',
    description:
      'Explore all demi-fine jewellery collections at Lily Luxora. Find the perfect style for every occasion.',
    url: '/category',
    type: 'website',
  },
};

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
