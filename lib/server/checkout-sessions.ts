import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_ITEMS = 50;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CheckoutSessionItem = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  image?: string;
  variantId?: string;
  variantLabel?: string;
  is_free_delivery?: boolean;
};

export type CheckoutSessionAddress = {
  firstName: string;
  lastName: string;
  addressLine: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutSessionInput = {
  token?: string | null;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: Partial<CheckoutSessionAddress> | null;
  items?: unknown;
  couponCode?: string | null;
};

export type RecoveredCheckoutSession = {
  token: string;
  email: string;
  phone: string;
  address: CheckoutSessionAddress;
  items: CheckoutSessionItem[];
  couponCode: string | null;
};

type VariantRefreshRow = {
  id: string;
  price: number | string | null;
  sellable_status: string | null;
  inventory_items: Array<{ available_quantity: number | null; reserved_quantity: number | null }> | null;
};

export function isCheckoutToken(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeAddress(address: Partial<CheckoutSessionAddress> | null | undefined): CheckoutSessionAddress {
  return {
    firstName: text(address?.firstName, 80),
    lastName: text(address?.lastName, 80),
    addressLine: text(address?.addressLine, 240),
    apartment: text(address?.apartment, 120),
    city: text(address?.city, 80),
    state: text(address?.state, 80),
    pincode: text(address?.pincode, 12),
  };
}

function normalizeItems(raw: unknown): CheckoutSessionItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.slice(0, MAX_ITEMS).flatMap((entry) => {
    const item = (entry || {}) as Record<string, unknown>;
    const id = text(item.id, 80);
    const variantId = text(item.variantId, 80);
    const quantity = Math.trunc(Number(item.quantity));
    const price = Number(item.price);

    if (!id || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
      return [];
    }

    return [{
      id,
      slug: text(item.slug, 200) || undefined,
      name: text(item.name, 200) || 'Item',
      price,
      quantity: Math.min(quantity, 99),
      image: text(item.image, 600) || undefined,
      variantId: variantId || undefined,
      variantLabel: text(item.variantLabel, 200) || undefined,
      is_free_delivery: Boolean(item.is_free_delivery),
    }];
  });
}

/**
 * Creates or updates the shopper's open checkout session and returns its token.
 * Nothing is stored until there is a way to contact the shopper.
 */
export async function saveCheckoutSession(input: CheckoutSessionInput) {
  const email = text(input.email, 200).toLowerCase() || null;
  const phone = text(input.phone, 30) || null;
  const items = normalizeItems(input.items);

  if ((!email && !phone) || items.length === 0) {
    return null;
  }

  const address = normalizeAddress(input.address);
  const payload = {
    user_id: isCheckoutToken(input.userId) ? input.userId : null,
    email,
    phone,
    full_name: `${address.firstName} ${address.lastName}`.trim() || null,
    shipping_address: address,
    items,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    coupon_code: text(input.couponCode, 60).toUpperCase() || null,
    updated_at: new Date().toISOString(),
  };

  if (isCheckoutToken(input.token)) {
    const { data, error } = await supabaseAdmin
      .from('checkout_sessions')
      .update(payload)
      .eq('token', input.token)
      .eq('status', 'open')
      .select('token')
      .maybeSingle<{ token: string }>();

    if (error) throw error;
    if (data?.token) return data.token;
  }

  const { data, error } = await supabaseAdmin
    .from('checkout_sessions')
    .insert(payload)
    .select('token')
    .single<{ token: string }>();

  if (error) throw error;
  return data.token;
}

/** Called when the shopper reaches payment, so the paid order closes the session. */
export async function linkCheckoutSessionToOrder(token: string | null | undefined, orderId: string, customerId?: string | null) {
  if (!isCheckoutToken(token)) return;

  const { error } = await supabaseAdmin
    .from('checkout_sessions')
    .update({ order_id: orderId, customer_id: customerId || null, updated_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'open');

  if (error) {
    console.error('Could not link checkout session to order', error);
  }
}

/**
 * Loads an open session for a recovery link, with prices and stock refreshed
 * so the restored cart matches what the shopper can actually buy today.
 */
export async function recoverCheckoutSession(token: string): Promise<RecoveredCheckoutSession | null> {
  if (!isCheckoutToken(token)) return null;

  const { data: session, error } = await supabaseAdmin
    .from('checkout_sessions')
    .select('token, email, phone, shipping_address, items, coupon_code, recovered_at')
    .eq('token', token)
    .eq('status', 'open')
    .maybeSingle();

  if (error) throw error;
  if (!session) return null;

  const savedItems = normalizeItems(session.items);
  const variantIds = savedItems.map((item) => item.variantId).filter((id): id is string => Boolean(id));
  const variants = new Map<string, VariantRefreshRow>();

  if (variantIds.length > 0) {
    const { data: rows, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select('id, price, sellable_status, inventory_items(available_quantity, reserved_quantity)')
      .in('id', variantIds);

    if (variantError) throw variantError;
    ((rows || []) as VariantRefreshRow[]).forEach((row) => variants.set(row.id, row));
  }

  const items = savedItems.flatMap((item) => {
    const variant = item.variantId ? variants.get(item.variantId) : undefined;
    if (!variant || (variant.sellable_status || 'draft') !== 'sellable') return [];

    const stock = (variant.inventory_items || []).reduce(
      (sum, row) => sum + Math.max(0, Number(row.available_quantity || 0) - Number(row.reserved_quantity || 0)),
      0
    );
    if (stock <= 0) return [];

    return [{
      ...item,
      price: Number(variant.price ?? item.price),
      quantity: Math.min(item.quantity, stock),
      stock,
    }];
  });

  if (!session.recovered_at) {
    await supabaseAdmin
      .from('checkout_sessions')
      .update({ recovered_at: new Date().toISOString() })
      .eq('token', token);
  }

  return {
    token: session.token,
    email: session.email || '',
    phone: session.phone || '',
    address: normalizeAddress(session.shipping_address as Partial<CheckoutSessionAddress> | null),
    items,
    couponCode: session.coupon_code || null,
  };
}
