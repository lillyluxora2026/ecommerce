import Link from 'next/link';

export default function PreordersPage() {
  return (
    <main className="w-full bg-white text-[#121212] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
      <span className="text-[#555555] uppercase tracking-[0.16em] text-xs font-sans font-medium mb-2.5 block">
        Online Storefront
      </span>
      <h1 className="text-2xl sm:text-4xl font-sans font-normal tracking-tight text-[#121212] mb-3">
        Preorders Unavailable
      </h1>
      <p className="text-xs sm:text-sm font-sans text-[#555555] max-w-md mb-7 leading-relaxed">
        Preorders are no longer offered. All available jewellery pieces can be purchased directly while in stock.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="bg-[#121212] hover:bg-[#2C2C2C] text-white px-7 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
        >
          Browse jewellery
        </Link>
        <Link
          href="/orders"
          className="border border-[#D4D4D4] text-[#121212] hover:border-[#121212] px-7 py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide transition-colors"
        >
          My orders
        </Link>
      </div>
    </main>
  );
}
