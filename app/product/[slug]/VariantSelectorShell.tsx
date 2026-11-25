"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Share2, Star, Truck, Droplets, Shield, Gem, Sparkles } from "lucide-react";
import { Product } from "@/lib/api/home";
import { ProductActions } from "@/components/product/ProductActions";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { formatRsINR } from "@/components/product/ProductCard";

type OptionSchema = { name: string; values: string[] };
type OptionValueState = {
  disabled: boolean;
  badge?: string;
  reason?: string;
};

function formatVariantLabel(options: Record<string, string> = {}) {
  const entries = Object.entries(options);
  if (entries.length === 0) return undefined;
  return entries.map(([name, value]) => `${name}: ${value}`).join(' / ');
}

function getOptionImage(variants: Product["variants"], optionName: string, optionValue: string, fallbackImage?: string) {
  const variant = variants?.find((v) => v.options?.[optionName] === optionValue && v.images && v.images.length > 0);
  return variant?.images?.[0] || fallbackImage;
}

function resolveVariant(variants: Product["variants"] = [], selected: Record<string, string>) {
  return variants.find((v) => {
    const opts = v.options || {};
    return Object.keys(selected).every((key) => opts[key] === selected[key]);
  });
}

function getOptionValueState(
  variants: Product["variants"] = [],
  selected: Record<string, string>,
  optionName: string,
  optionValue: string
): OptionValueState {
  const matchingVariants = variants.filter((variant) => {
    const options = variant.options || {};
    if (options[optionName] !== optionValue) return false;

    return Object.entries(selected).every(([key, value]) => {
      if (key === optionName) return true;
      return options[key] === value;
    });
  });

  if (matchingVariants.length === 0) {
    return {
      disabled: true,
      badge: "Unavailable",
      reason: "This option combination does not exist.",
    };
  }

  const hasInStockVariant = matchingVariants.some((variant) => (variant.stock || 0) > 0);
  if (hasInStockVariant) {
    return { disabled: false };
  }

  return {
    disabled: true,
    badge: "Sold Out",
    reason: "This option is currently out of stock.",
  };
}

export default function VariantSelectorShell({
  product,
  optionSchema,
  initialSelection,
}: {
  product: Product;
  optionSchema: OptionSchema[];
  initialSelection: Record<string, string>;
}) {
  const [selected, setSelected] = useState<Record<string, string>>(initialSelection);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareState, setShareState] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const selectedVariant = useMemo(
    () => resolveVariant(product.variants, selected),
    [product.variants, selected]
  );

  const isUnavailable = optionSchema.length > 0 && !selectedVariant;
  const allowPreorder = false;
  const isSoldOut = !isUnavailable && (selectedVariant?.stock ?? product.stock ?? 0) === 0 && !allowPreorder;
  const isPreorder = !isUnavailable && (selectedVariant?.stock ?? product.stock ?? 0) === 0 && allowPreorder;
  const price = selectedVariant?.price ?? product.price ?? 0;
  const compareAt = selectedVariant?.compare_at_price ?? product.original_price;
  const discount = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const images =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images && product.images.length > 0
        ? product.images
        : [product.image];
  const activeImage = images[activeImageIndex] || images[0];
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const selectedVariantLabel =
    selectedVariant?.title && selectedVariant.title !== 'Default Variant'
      ? selectedVariant.title
      : formatVariantLabel(selectedVariant?.options);

  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setShareState(null);
  }, [product.id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVariant?.id]);

  async function handleShare() {
    if (isSharing) return;

    const shareUrl = window.location.href;
    const shareText = [product.brand, selectedVariantLabel, `Rs. ${price.toFixed(0)}`]
      .filter(Boolean)
      .join(" • ");

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: shareText || product.name,
          url: shareUrl,
        });
        setShareState({
          tone: "success",
          message: `${product.name} is ready to share.`,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareState({
          tone: "success",
          message: "Product link copied to clipboard.",
        });
        return;
      }

      throw new Error("Sharing is not supported in this browser.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setShareState({
        tone: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Could not share this product right now.",
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <main className="w-full bg-white text-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-10">
        <style>{`
          @keyframes fadeImage {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-image {
            animation: fadeImage 0.25s ease-out forwards;
          }
        `}</style>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#555555] mb-6 font-sans">
          <Link href="/" className="hover:text-[#121212] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <Link href="/products" className="hover:text-[#121212] transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 text-[#737373]" />
          <span className="text-[#121212] truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Clean Square Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full bg-[#F6F6F6] overflow-hidden">
              <Image
                key={activeImage}
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover animate-fade-image"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                fetchPriority="high"
              />
              {isSoldOut && (
                <span className="absolute bottom-3 left-3 bg-[#121212] text-white text-[11px] font-sans font-medium px-3 py-1 rounded-full z-10">
                  Sold out
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, i) => {
                  const isActive = i === activeImageIndex;

                  return (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative aspect-square overflow-hidden bg-[#F6F6F6] transition-colors ${
                        isActive ? "ring-2 ring-[#121212]" : "opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`View image ${i + 1} of ${images.length}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Minimal Product Details */}
          <div className="flex flex-col">
            <span className="text-[#555555] text-[11px] font-sans uppercase tracking-[0.16em] mb-1.5">
              {product.brand || 'Lily Luxora'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-sans font-normal tracking-tight text-[#121212] leading-snug mb-2.5">
              {product.name}
            </h1>

            {(product.rating ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-3.5">
                <div className="flex items-center text-[#121212]">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(product.rating!) ? "fill-current" : "text-[#D4D4D4]"}`}
                      />
                    ))}
                </div>
                <span className="text-[#555555] font-sans text-xs">
                  {product.rating} ({product.review_count || 1} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3 mb-5 pb-5 border-b border-[#EBEBEB]">
              <span className="font-sans text-lg sm:text-xl font-normal text-[#121212] tabular-nums">
                {formatRsINR(price)}
              </span>
              {compareAt != null && compareAt > price && (
                <span className="font-sans text-sm text-[#737373] line-through tabular-nums">
                  Rs. {compareAt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                </span>
              )}
              {discount > 0 && (
                <span className="font-sans text-white text-[11px] font-medium bg-[#121212] px-2.5 py-0.5 rounded-full">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Shipping & Share Row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-1.5 text-[11px] font-sans text-[#121212]">
                <Truck className="h-3.5 w-3.5 text-[#121212]" strokeWidth={1.5} />
                Free shipping above Rs. 999
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 text-[11px] font-sans text-[#121212] transition-colors hover:border-[#121212]"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Share
              </button>
            </div>

            {shareState ? (
              <NoticeBanner
                tone={shareState.tone}
                className="mb-6"
                onDismiss={() => setShareState(null)}
              >
                {shareState.message}
              </NoticeBanner>
            ) : null}

            {/* Variant options */}
            {optionSchema.length > 0 && (
              <div className="space-y-4 mb-6">
                {optionSchema.map((opt) => (
                  <div key={opt.name} className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#121212] font-sans">{opt.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const active = selected[opt.name] === val;
                        const optionState = getOptionValueState(product.variants, selected, opt.name, val);
                        const optionImage = getOptionImage(product.variants, opt.name, val, product.image);
                        return (
                          <span key={val} title={optionState.reason} className="inline-flex">
                            <button
                              type="button"
                              disabled={optionState.disabled}
                              aria-label={optionState.reason ? `${val} - ${optionState.reason}` : val}
                              onClick={() => setSelected((prev) => ({ ...prev, [opt.name]: val }))}
                              className={`px-3.5 py-2 border text-xs sm:text-sm font-sans transition-colors ${
                                optionState.disabled
                                  ? "border-[#EBEBEB] bg-[#F8F8F8] text-[#999999] cursor-not-allowed line-through"
                                  : active
                                    ? "border-[#121212] text-white bg-[#121212]"
                                    : "border-[#D4D4D4] bg-white text-[#121212] hover:border-[#121212]"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                {optionImage && (
                                  <span className="relative w-6 h-6 overflow-hidden flex-shrink-0 border border-black/10">
                                    <Image src={optionImage} alt={val} fill className="object-cover" sizes="24px" />
                                  </span>
                                )}
                                <span>{val}</span>
                              </span>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock & Actions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-sans text-[#555555] mb-5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isUnavailable ? "bg-[#737373]" : isSoldOut ? "bg-red-600" : isPreorder ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                />
                {isUnavailable
                  ? "This combination is unavailable"
                  : isSoldOut
                    ? "Currently out of stock"
                    : isPreorder
                      ? "Available for Preorder — Ships in 3 weeks"
                      : currentStock <= 5
                        ? `Only ${currentStock} left in stock`
                        : "In Stock · Ready to ship"}
              </div>

              <ProductActions
                product={product}
                isStickyMobile
                selectedVariant={{
                  id: selectedVariant?.id,
                  price,
                  stock: isUnavailable ? 0 : currentStock,
                  allowPreorder,
                  label: selectedVariantLabel,
                  image: images[0] || product.image,
                }}
              />
            </div>

            {/* Minimalist Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 py-4 border-y border-[#EBEBEB] bg-[#FAFAFA] px-3">
              <div className="flex flex-col items-center gap-1 text-center">
                <Droplets className="w-4 h-4 text-[#121212]" strokeWidth={1.4} />
                <span className="text-[11px] font-sans font-medium text-[#121212]">Waterproof</span>
                <span className="text-[10px] text-[#555555]">Wear every day</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield className="w-4 h-4 text-[#121212]" strokeWidth={1.4} />
                <span className="text-[11px] font-sans font-medium text-[#121212]">Anti-Tarnish</span>
                <span className="text-[10px] text-[#555555]">Lasting shine</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Sparkles className="w-4 h-4 text-[#121212]" strokeWidth={1.4} />
                <span className="text-[11px] font-sans font-medium text-[#121212]">18K PVD Gold</span>
                <span className="text-[10px] text-[#555555]">Durable finish</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Gem className="w-4 h-4 text-[#121212]" strokeWidth={1.4} />
                <span className="text-[11px] font-sans font-medium text-[#121212]">Hypoallergenic</span>
                <span className="text-[10px] text-[#555555]">Skin-friendly</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 text-sm font-sans">
              <div className="pb-4 border-b border-[#EBEBEB]">
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] mb-2 text-[#121212]">Description</h3>
                <p className="text-[#555555] leading-relaxed text-xs sm:text-sm">
                  {product.description || "Handcrafted in 18K PVD gold-plated stainless steel. Waterproof, sweat-proof, and anti-tarnish for everyday wear."}
                </p>
              </div>

              <div className="pb-4 border-b border-[#EBEBEB]">
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] mb-2 text-[#121212]">Materials</h3>
                <p className="text-[#555555] text-xs sm:text-sm leading-relaxed">
                  {product.material || "18K PVD Gold Plating over Surgical-Grade 316L Stainless Steel. Nickel-free and lead-free."}
                </p>
              </div>

              <div className="pb-4 border-b border-[#EBEBEB]">
                <h3 className="text-xs font-medium uppercase tracking-[0.12em] mb-2 text-[#121212]">Jewellery Care</h3>
                <p className="text-[#555555] text-xs sm:text-sm leading-relaxed">
                  {product.care_instructions || "Safe in water, showers, and perfume. Rinse with clean water after swimming and pat dry with a soft cloth."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
