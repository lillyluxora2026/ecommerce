'use client';

import Image from 'next/image';
import Link from 'next/link';

export function formatRsINR(amount: number) {
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} INR`;
}

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price?: number;
    image: string;
    stock: number;
    allow_preorder: boolean;
    rating?: number;
    review_count?: number;
    variantId?: string;
    is_free_delivery?: boolean;
    material?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.stock === 0;
  const hasCompareAt = Boolean(product.original_price && product.original_price > product.price);

  return (
    <article className="group flex flex-col min-w-0">
      <Link
        href={`/product/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#121212]"
      >
        {/* Clean 1:1 Edge-to-Edge Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              isSoldOut ? 'opacity-65 grayscale-[25%]' : ''
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {isSoldOut && (
            <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-[#121212] px-3 py-1 text-[11px] font-sans font-medium tracking-wide text-white">
              Sold out
            </span>
          )}
        </div>

        {/* Clean Title + Price Directly Below */}
        <div className="pt-2.5 sm:pt-3 min-w-0">
          <h3 className="font-sans text-[13px] sm:text-[14px] font-normal leading-[1.38] text-[#121212] line-clamp-2 group-hover:underline underline-offset-4 decoration-[#121212]/40">
            {product.name}
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-sans text-[13px] sm:text-[14px] font-normal text-[#121212] tabular-nums">
              {formatRsINR(product.price)}
            </span>
            {hasCompareAt && (
              <span className="font-sans text-[11px] sm:text-[12px] text-[#737373] line-through tabular-nums">
                Rs. {product.original_price!.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
