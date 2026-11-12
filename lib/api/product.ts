/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../supabase';
import { Product, SIGNATURE_LILY_LUXORA_CATEGORIES } from './home';
import { projectProductRow, SELLABLE_VARIANT_SELECT, type ProductRowLike } from './sellable-variants';

type CategoryBannerRow = {
  id: string;
  name: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  banner_kicker?: string | null;
  banner_title?: string | null;
  banner_description?: string | null;
  banner_image_url?: string | null;
  banner_mobile_image_url?: string | null;
};

async function getCategoryBannerRowBySlug(slug: string): Promise<CategoryBannerRow | null> {
  // Single query — banner columns are part of the live schema
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, image_url, sort_order, banner_kicker, banner_title, banner_description, banner_image_url, banner_mobile_image_url')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getCategoryBannerRowBySlug error:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    parent_id: data.parent_id ?? null,
    image_url: data.image_url ?? null,
    sort_order: Number(data.sort_order ?? 0),
    banner_kicker: (data as any).banner_kicker ?? null,
    banner_title: (data as any).banner_title ?? null,
    banner_description: (data as any).banner_description ?? null,
    banner_image_url: (data as any).banner_image_url ?? null,
    banner_mobile_image_url: (data as any).banner_mobile_image_url ?? null,
  };
}

export type CategoryBanner = {
  id: string;
  name: string;
  bannerKicker: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerImage: string;
  bannerMobileImage: string;
};

export const SIGNATURE_LILY_LUXORA_PRODUCTS: Product[] = [
  {
    id: 'pearl-clover-necklace',
    name: 'Pearl Clover Necklace',
    slug: 'pearl-clover-necklace',
    price: 1299,
    original_price: 1899,
    image: '/images/placeholders/prod-pearl-clover.svg',
    images: ['/images/placeholders/prod-pearl-clover.svg', '/images/placeholders/cat-necklaces.svg'],
    stock: 25,
    allow_preorder: false,
    is_free_delivery: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 128,
    brand: 'Lily Luxora',
    collection: 'Everyday Elegance',
    categoryId: 'cat-necklaces',
    material: '18K PVD Gold Plating over Premium Surgical-Grade 316L Stainless Steel with Natural Mother of Pearl',
    care_instructions: '100% Waterproof, sweat-proof, and tarnish-resistant. Rinse gently with fresh water after swimming and pat dry.',
    description: 'An iconic mother-of-pearl clover pendant cradled in warm 18K PVD gold plating. Delicately suspended on a radiant, adjustable chain, designed for effortless daily wear and timeless feminine sophistication.',
    features: ['18K PVD Gold Plating', 'Waterproof & Sweat-Proof', 'Anti-Tarnish Guarantee', 'Hypoallergenic 316L Steel'],
    variants: [
      {
        id: 'var-clover-gold-16',
        title: '16 Inch + 2 Inch Extender',
        price: 1299,
        compare_at_price: 1899,
        stock: 25,
        options: { Length: '16-18 Inch' },
        images: ['/images/placeholders/prod-pearl-clover.svg']
      }
    ]
  },
  {
    id: 'twisted-hoop-earrings',
    name: 'Twisted Hoop Earrings',
    slug: 'twisted-hoop-earrings',
    price: 899,
    original_price: 1299,
    image: '/images/placeholders/prod-twisted-hoops.svg',
    images: ['/images/placeholders/prod-twisted-hoops.svg', '/images/placeholders/cat-earrings.svg'],
    stock: 40,
    allow_preorder: false,
    is_free_delivery: false,
    is_bestseller: true,
    rating: 4.8,
    review_count: 96,
    brand: 'Lily Luxora',
    collection: 'Timeless Shine',
    categoryId: 'cat-earrings',
    material: '18K PVD Gold Plating over Surgical-Grade 316L Stainless Steel',
    care_instructions: 'Waterproof, sweat-proof, perfume-safe. Clean with a soft dry cloth.',
    description: 'Sculptural twist detailing with a radiant golden glow. Perfectly weighted to feel substantial yet feather-light on the lobes, complete with secure hypoallergenic click clasps.',
    features: ['18K PVD Gold Plating', 'Hypoallergenic & Nickel-Free', 'Waterproof & Anti-Tarnish', 'Secure Snap Clasp'],
    variants: [
      {
        id: 'var-hoops-classic',
        title: 'Classic 20mm',
        price: 899,
        compare_at_price: 1299,
        stock: 40,
        options: { Size: '20mm' },
        images: ['/images/placeholders/prod-twisted-hoops.svg']
      }
    ]
  },
  {
    id: 'ocean-charm-bracelet',
    name: 'Ocean Charm Bracelet',
    slug: 'ocean-charm-bracelet',
    price: 1499,
    original_price: 2199,
    image: '/images/placeholders/prod-ocean-charm.svg',
    images: ['/images/placeholders/prod-ocean-charm.svg', '/images/placeholders/cat-bracelets.svg'],
    stock: 18,
    allow_preorder: false,
    is_free_delivery: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 72,
    brand: 'Lily Luxora',
    collection: 'Coastal Whimsy',
    categoryId: 'cat-bracelets',
    material: '18K PVD Gold Plating over 316L Stainless Steel with Natural Freshwater Pearl',
    care_instructions: 'Waterproof and beach-ready. Rinse off saltwater and pat dry.',
    description: 'A poetic celebration of the sea featuring sunburst, seashell, genuine freshwater pearl, and golden charm motifs along an artisan oval link chain.',
    features: ['Real Freshwater Pearl', '18K PVD Gold Plated', 'Waterproof & Anti-Tarnish', 'Adjustable 6.5 - 8 Inch Fit'],
    variants: [
      {
        id: 'var-bracelet-one-size',
        title: 'Adjustable Fit',
        price: 1499,
        compare_at_price: 2199,
        stock: 18,
        options: { Size: 'Adjustable' },
        images: ['/images/placeholders/prod-ocean-charm.svg']
      }
    ]
  },
  {
    id: 'dual-band-crystal-ring',
    name: 'Dual Band Crystal Ring',
    slug: 'dual-band-crystal-ring',
    price: 999,
    original_price: 1499,
    image: '/images/placeholders/prod-dual-band.svg',
    images: ['/images/placeholders/prod-dual-band.svg', '/images/placeholders/cat-rings.svg'],
    stock: 30,
    allow_preorder: false,
    is_free_delivery: true,
    is_bestseller: true,
    rating: 4.8,
    review_count: 64,
    brand: 'Lily Luxora',
    collection: 'Everyday Luxury',
    categoryId: 'cat-rings',
    material: '18K PVD Gold Plating over 316L Stainless Steel with Brilliant Pavé Cubic Zirconia',
    care_instructions: 'Waterproof and everyday safe. Hand soaps and sanitizer friendly.',
    description: 'An architectural double-band silhouette combining one mirror-polished 18K gold band and one micro-pavé crystal band for instant stacked elegance.',
    features: ['Stacked Look in One Ring', '18K PVD Gold Plating', 'Waterproof & Tarnish-Free', 'Comfort-Fit Band'],
    variants: [
      {
        id: 'var-ring-size-6',
        title: 'Size 6 (US)',
        price: 999,
        compare_at_price: 1499,
        stock: 10,
        options: { Size: 'US 6' },
        images: ['/images/placeholders/prod-dual-band.svg']
      },
      {
        id: 'var-ring-size-7',
        title: 'Size 7 (US)',
        price: 999,
        compare_at_price: 1499,
        stock: 10,
        options: { Size: 'US 7' },
        images: ['/images/placeholders/prod-dual-band.svg']
      },
      {
        id: 'var-ring-size-8',
        title: 'Size 8 (US)',
        price: 999,
        compare_at_price: 1499,
        stock: 10,
        options: { Size: 'US 8' },
        images: ['/images/placeholders/prod-dual-band.svg']
      }
    ]
  }
];

export async function getProducts(categorySlug?: string, search?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      is_free_delivery,
      material,
      collection,
      rating,
      review_count,
      brand,
      product_variants (
        ${SELLABLE_VARIANT_SELECT}
      ),
      product_media ( media_url, position ),
      categories ( id, slug, parent_id )
    `)
    .eq('status', 'active');

  if (categorySlug) {
    // Fetch the category id safely, then include its children
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (cat?.id) {
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id);
      const ids = [cat.id, ...(children || []).map((c: any) => c.id)];
      query = query.in('category_id', ids);
    } else {
      query = query.eq('categories.slug', categorySlug);
    }
  }

  const searchTerm = search?.trim().replace(/[,%]/g, ' ');

  if (searchTerm) {
    const withHyphen = searchTerm.replace(/\s+/g, '-');
    const withSpace = searchTerm.replace(/-+/g, ' ');

    const patterns = [...new Set([searchTerm, withHyphen, withSpace])];

    const orClauses = patterns.flatMap((term) => {
      const p = `%${term}%`;
      return [
        `title.ilike.${p}`,
        `brand.ilike.${p}`,
        `material.ilike.${p}`,
        `collection.ilike.${p}`,
      ];
    });

    query = query.or(orClauses.join(','));
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    if (categorySlug) {
      const normalized = categorySlug.trim().toLowerCase();
      const matchedCat = SIGNATURE_LILY_LUXORA_CATEGORIES.find((c) => c.slug === normalized);
      return SIGNATURE_LILY_LUXORA_PRODUCTS.filter((p) =>
        matchedCat
          ? p.categoryId === matchedCat.id
          : p.slug.includes(normalized) || p.name.toLowerCase().includes(normalized)
      );
    }
    return SIGNATURE_LILY_LUXORA_PRODUCTS;
  }

  return data.map((p: Record<string, any>) => projectProductRow(p as ProductRowLike));
}

export async function getAllProductSlugs(): Promise<{slug: string}[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active');
    
  const dbSlugs = (!error && data) ? (data as {slug: string}[]) : [];
  const signatureSlugs = SIGNATURE_LILY_LUXORA_PRODUCTS.map(p => ({ slug: p.slug }));
  
  const allMap = new Map<string, { slug: string }>();
  signatureSlugs.forEach(s => allMap.set(s.slug, s));
  dbSlugs.forEach(s => allMap.set(s.slug, s));
  
  return Array.from(allMap.values());
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      description,
      material,
      care_instructions,
      features,
      is_free_delivery,
      rating,
      review_count,
      brand,
      collection,
      gender,
      return_policy,
      categories ( id, name, slug, parent_id ),
      product_variants (
        ${SELLABLE_VARIANT_SELECT}
      ),
      product_media ( media_url, position )
    `)
    .eq('slug', normalizedSlug)
    .single();

  if (!error && data) {
    return projectProductRow(data as ProductRowLike);
  }

  const fallback = SIGNATURE_LILY_LUXORA_PRODUCTS.find(p => p.slug === normalizedSlug);
  return fallback || null;
}

// Fetch products under a category AND all its subcategories
export async function getProductsByCategory(categorySlug: string): Promise<{ products: Product[]; categoryName: string; categoryBanner: CategoryBanner | null }> {
  // 1. Find the category
  const catData = await getCategoryBannerRowBySlug(categorySlug);

  if (!catData) {
    const normalized = categorySlug.trim().toLowerCase();
    const fallbackCat = SIGNATURE_LILY_LUXORA_CATEGORIES.find((c) => c.slug === normalized);
    if (!fallbackCat) return { products: [], categoryName: '', categoryBanner: null };

    const fallbackProducts = SIGNATURE_LILY_LUXORA_PRODUCTS.filter((p) => p.categoryId === fallbackCat.id);
    return {
      products: fallbackProducts,
      categoryName: fallbackCat.name,
      categoryBanner: {
        id: fallbackCat.id,
        name: fallbackCat.name,
        bannerKicker: fallbackCat.bannerKicker || 'Lily Luxora Collection',
        bannerTitle: fallbackCat.bannerTitle || fallbackCat.name,
        bannerDescription: fallbackCat.bannerDescription || `Explore everything in ${fallbackCat.name}.`,
        bannerImage: fallbackCat.bannerImage || fallbackCat.image,
        bannerMobileImage: fallbackCat.bannerMobileImage || fallbackCat.image,
      },
    };
  }

  // 2. Collect all valid category IDs (category itself + all its children)
  const { data: allCats } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', catData.id);

  const catIds = [catData.id, ...(allCats || []).map(c => c.id)];

  // 3. Fetch products in those categories
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, slug, is_free_delivery, rating, review_count, brand,
      product_variants (
        ${SELLABLE_VARIANT_SELECT}
      ),
      product_media ( media_url, position ),
      category_id
    `)
    .in('category_id', catIds)
    .eq('status', 'active');

  if (error || !data) {
    return {
      products: [],
      categoryName: catData.name,
      categoryBanner: {
        id: catData.id,
        name: catData.name,
        bannerKicker: catData.banner_kicker || 'Collection',
        bannerTitle: catData.banner_title || catData.name,
        bannerDescription: catData.banner_description || `Explore everything in ${catData.name}.`,
        bannerImage: catData.banner_image_url || catData.image_url || '/images/placeholders/category-fallback.svg',
        bannerMobileImage: catData.banner_mobile_image_url || catData.banner_image_url || catData.image_url || '/images/placeholders/category-fallback.svg',
      },
    };
  }

  const products = data.map((p: Record<string, any>) => projectProductRow(p as ProductRowLike));

  return {
    products,
    categoryName: catData.name,
    categoryBanner: {
      id: catData.id,
      name: catData.name,
      bannerKicker: catData.banner_kicker || 'Collection',
      bannerTitle: catData.banner_title || catData.name,
      bannerDescription: catData.banner_description || `Explore everything in ${catData.name}.`,
      bannerImage: catData.banner_image_url || catData.image_url || (products.length > 0 ? products[0].image : '/images/placeholders/category-fallback.svg'),
      bannerMobileImage: catData.banner_mobile_image_url || catData.banner_image_url || catData.image_url || (products.length > 0 ? products[0].image : '/images/placeholders/category-fallback.svg'),
    },
  };
}
