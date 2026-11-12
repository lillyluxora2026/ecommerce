import Link from 'next/link';

export default function PreordersPage() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
      <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
        Online Storefront
      </span>
      <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
        Preorders Unavailable
      </h1>
      <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-md mb-8 leading-relaxed">
        Preorders are no longer offered. All available jewellery pieces can be purchased directly while in stock.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Browse Jewellery
        </Link>
        <Link
          href="/orders"
          className="rounded-full border border-[#B7A596] text-[#382F2A] hover:bg-[#EFE7DE] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all"
        >
          My Orders
        </Link>
      </div>
    </main>
  );
}
