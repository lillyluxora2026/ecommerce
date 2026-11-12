"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Package, RotateCcw, Share2, Star, Truck, Droplets, Shield, Gem, Sparkles } from "lucide-react";
import { Product } from "@/lib/api/home";
import { ProductActions } from "@/components/product/ProductActions";
import { NoticeBanner } from "@/components/ui/NoticeBanner";

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

// Extract a representative image for an option value
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
) : OptionValueState {
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
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const images = selectedVariant?.images && selectedVariant.images.length > 0
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
    const shareText = [product.brand, selectedVariantLabel, `₹${price.toFixed(0)}`]
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
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        <style>{`
          @keyframes fadeImage {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-image {
            animation: fadeImage 0.4s ease-out forwards;
          }
        `}</style>
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#63574F] mb-8 font-sans">
          <Link href="/" className="hover:text-[#8B7768] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <Link href="/products" className="hover:text-[#8B7768] transition-colors">Jewellery</Link>
          <ChevronRight className="w-3 h-3 text-[#B7A596]" />
          <span className="text-[#382F2A] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square w-full rounded-2xl bg-white border border-[#E5DACF] overflow-hidden shadow-sm transition-all duration-300">
              <Image
                key={activeImage}
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover animate-fade-image"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#8B7768] text-[#F7F3ED] text-[10px] font-sans font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-sm shadow-sm z-10">
                  {discount}% OFF
                </span>
              )}
              {isPreorder && (
                <span className="absolute top-4 left-4 bg-[#C5A574] text-[#382F2A] text-[10px] font-sans font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-sm shadow-sm z-10">
                  PREORDER
                </span>
              )}
            </div>
            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, i) => {
                  const isActive = i === activeImageIndex;

                  return (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative aspect-square rounded-xl overflow-hidden bg-white transition-all ${
                        isActive ? "border-2 border-[#8B7768] shadow-sm" : "border border-[#E5DACF] hover:border-[#8B7768]/60"
                      }`}
                      aria-label={`View image ${i + 1} of ${images.length}`}
                    >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            {/* Brand & Collection Kicker */}
            <span className="text-[#8B7768] text-xs font-sans uppercase tracking-[0.2em] font-medium mb-1.5">
              {product.brand || 'Lily Luxora Demi-Fine'}
            </span>

            <h1 className="text-2xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {(product.rating ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-[#C5A574]">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating!) ? "fill-current" : "text-[#B7A596]/40"}`}
                    />
                  ))}
                </div>
                <span className="text-[#63574F] font-sans text-xs">
                  {product.rating} ({product.review_count || 1} verified customer reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-[#B7A596]/40">
              <span className="font-sans text-3xl font-bold text-[#382F2A]">₹{price.toFixed(0)}</span>
              {compareAt != null && compareAt > 0 && (
                <span className="font-sans text-base text-[#8B7E76] line-through font-light">
                  ₹{compareAt.toFixed(0)}
                </span>
              )}
              {discount > 0 && (
                <span className="font-sans text-[#8B7768] text-xs font-semibold uppercase tracking-wider bg-[#EFE7DE] px-2 py-0.5 rounded">
                  Save ₹{(compareAt! - price).toFixed(0)}
                </span>
              )}
            </div>

            {/* Benefits Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B7A596]/40 bg-[#EFE7DE] px-3 py-1 text-[11px] font-sans font-medium text-[#382F2A]">
                <Truck className="h-3.5 w-3.5 text-[#8B7768]" />
                Free Shipping Above ₹999
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#B7A596]/40 bg-white px-3 py-1 text-[11px] font-sans font-medium text-[#63574F] transition-colors hover:border-[#8B7768] hover:text-[#8B7768]"
              >
                <Share2 className="h-3.5 w-3.5" />
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
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-[#63574F] font-sans">{opt.name}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {opt.values.map((val) => {
                      const active = selected[opt.name] === val;
                      const optionState = getOptionValueState(product.variants, selected, opt.name, val);
                      const optionImage = getOptionImage(product.variants, opt.name, val, product.image);
                      return (
                        <span
                          key={val}
                          title={optionState.reason}
                          className="inline-flex"
                        >
                          <button
                            type="button"
                            disabled={optionState.disabled}
                            aria-label={optionState.reason ? `${val} - ${optionState.reason}` : val}
                            onClick={() => setSelected((prev) => ({ ...prev, [opt.name]: val }))}
                            className={`px-3.5 py-2 border text-sm font-sans rounded-xl transition-all duration-300 ${
                              optionState.disabled
                                ? "border-[#E5DACF] bg-[#EFE7DE]/50 text-[#8B7E76] cursor-not-allowed opacity-60"
                                : active
                                ? "border-[#6D5C50] text-[#382F2A] bg-white ring-1 ring-[#6D5C50] shadow-xs"
                                : "border-[#D8CBBE] bg-white/80 text-[#63574F] hover:border-[#8B7768] hover:text-[#382F2A] hover:bg-white"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {optionImage && (
                                <span className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[#E5DACF]">
                                  <Image src={optionImage} alt={val} fill className="object-cover" sizes="32px" />
                                </span>
                              )}
                              <span className="flex flex-col items-start gap-1">
                                <span>{val}</span>
                                {optionState.badge && (
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest transition-colors ${
                                      optionState.disabled
                                        ? "bg-[#EFE7DE] text-[#8B7E76]"
                                        : "bg-[#C5A574]/15 text-[#9A7A49]"
                                    }`}
                                  >
                                    {optionState.badge}
                                  </span>
                                )}
                              </span>
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
          <div className="mb-6 transition-all duration-300">
            <div className="flex items-center gap-2 text-sm text-[#63574F] font-sans mb-6 transition-all duration-300">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isUnavailable ? "bg-[#8B7E76]" : isSoldOut ? "bg-[#A63A3A]" : isPreorder ? "bg-[#C5A574]" : "bg-[#2C6E49]"
                }`}
              />
              {isUnavailable
                ? "This combination is unavailable"
                : isSoldOut
                ? "Currently out of stock"
                : isPreorder
                  ? "Available for Preorder — Ships in 3 weeks"
                  : currentStock <= 5
                    ? `Only ${currentStock} left in stock!`
                    : "In Stock"}
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

          {/* Brand Benefits Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 py-5 border-y border-[#B7A596]/40 bg-[#EFE7DE]/50 rounded-xl px-4">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Droplets className="w-5 h-5 text-[#8B7768] stroke-[1.6]" />
              <span className="text-[11px] font-sans font-semibold text-[#382F2A]">Waterproof</span>
              <span className="text-[10px] text-[#63574F]">Wear every day</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Shield className="w-5 h-5 text-[#8B7768] stroke-[1.6]" />
              <span className="text-[11px] font-sans font-semibold text-[#382F2A]">Anti-Tarnish</span>
              <span className="text-[10px] text-[#63574F]">Long-lasting shine</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Sparkles className="w-5 h-5 text-[#8B7768] stroke-[1.6]" />
              <span className="text-[11px] font-sans font-semibold text-[#382F2A]">18K PVD Gold</span>
              <span className="text-[10px] text-[#63574F]">Durable finish</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Gem className="w-5 h-5 text-[#8B7768] stroke-[1.6]" />
              <span className="text-[11px] font-sans font-semibold text-[#382F2A]">Hypoallergenic</span>
              <span className="text-[10px] text-[#63574F]">Skin-friendly</span>
            </div>
          </div>

          {/* Product Info Accordion */}
          <div className="space-y-4 text-sm font-sans">
            <div className="pb-4 border-b border-[#B7A596]/30">
              <h3 className="font-heading tracking-[0.08em] text-sm font-medium uppercase mb-2 text-[#382F2A]">About This Piece</h3>
              <p className="text-[#63574F] leading-relaxed text-xs sm:text-sm">
                {product.description || "Handcrafted with precision in 18K PVD gold-plated stainless steel. Designed to be completely waterproof, sweat-proof, and tarnish-resistant for effortless everyday wear."}
              </p>
            </div>

            <div className="pb-4 border-b border-[#B7A596]/30">
              <h3 className="font-heading tracking-[0.08em] text-sm font-medium uppercase mb-2 text-[#382F2A]">Material &amp; Craftsmanship</h3>
              <p className="text-[#63574F] text-xs sm:text-sm leading-relaxed">
                {product.material || "18K PVD Gold Plating over Premium Surgical-Grade 316L Stainless Steel. 100% Nickel-free and Lead-free."}
              </p>
            </div>

            <div className="pb-4 border-b border-[#B7A596]/30">
              <h3 className="font-heading tracking-[0.08em] text-sm font-medium uppercase mb-2 text-[#382F2A]">Jewellery Care</h3>
              <p className="text-[#63574F] text-xs sm:text-sm leading-relaxed">
                {product.care_instructions || "Our 18K PVD pieces are safe in water, showers, and perfume. Simply rinse with clean water after swimming and pat dry with a soft cloth to maintain maximum brilliance."}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
