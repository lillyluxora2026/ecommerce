'use client';

import { useCartStore, type CartItem } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowLeft, ChevronDown, Lock, ShoppingBag, Tag, Truck, X } from 'lucide-react';
import { AddressModal } from '@/components/modals/AddressModal';
import { CouponModal } from '@/components/modals/CouponModal';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { createCustomerAddress, getCustomerAddresses, updateCustomerAddress } from '@/lib/api/customer-addresses';
import type { CustomerAddress, CustomerAddressInput } from '@/lib/customer-addresses';
import { splitAddressFullName } from '@/lib/customer-addresses';
import { getCustomerProfileState } from '@/lib/api/customer';
import { INDIA_STATES } from '@/lib/india-states';
import {
  calculateShippingCharge,
  DEFAULT_SHIPPING_SETTINGS,
  normalizeShippingSettings,
  type ShippingSettings,
} from '@/lib/shipping';
import { supabase } from '@/lib/supabase';

const SAVED_INFO_KEY = 'll-checkout-info';
const CHECKOUT_TOKEN_KEY = 'll-checkout-token';
const DRAFT_SAVE_DELAY_MS = 1200;

interface CheckoutResponse {
  error?: string;
  orderId: string;
  paymentRequestToken?: string | null;
  razorpayOrderId?: string | null;
  amount: number;
  razorpayKeyId: string | null;
}

interface VerifyPaymentResponse {
  error?: string;
  success?: boolean;
}

interface CheckoutStatusResponse {
  error?: string;
  success?: boolean;
}

interface CheckoutConfigResponse {
  paymentsEnabled?: boolean;
  shippingSettings?: Partial<ShippingSettings> | null;
}

interface CouponCheckResponse {
  error?: string;
  code?: string;
  amount?: number;
}

interface RecoveredSessionResponse {
  error?: string;
  session?: {
    token: string;
    email: string;
    phone: string;
    address: {
      firstName: string;
      lastName: string;
      addressLine: string;
      apartment: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: CartItem[];
    couponCode: string | null;
  };
}

type CheckoutNotice = {
  text: string;
  tone: 'error' | 'success' | 'info';
};

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

interface RazorpayCheckoutOptions {
  key: string | null;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void | Promise<void>) => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

type CheckoutForm = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
};

type FieldName = keyof CheckoutForm;

const EMPTY_FORM: CheckoutForm = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  pincode: '',
};

// Order in which fields appear on the page, used to focus the first invalid one.
const FIELD_ORDER: FieldName[] = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'pincode', 'phone'];

const INPUT_CLASS =
  'w-full rounded-xl border bg-white px-4 py-3.5 text-[#382F2A] outline-none transition-colors placeholder:text-[#8B7E76] focus:border-[#8B7768]';

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function hasMultipleNameParts(value: string) {
  return normalizeFullName(value).split(' ').filter(Boolean).length > 1;
}

function getEffectiveAddressName(addressFullName: string, profileFullName: string) {
  const normalizedAddressName = normalizeFullName(addressFullName);
  const normalizedProfileName = normalizeFullName(profileFullName);

  if (normalizedAddressName && (hasMultipleNameParts(normalizedAddressName) || !hasMultipleNameParts(normalizedProfileName))) {
    return normalizedAddressName;
  }

  return normalizedProfileName || normalizedAddressName;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function getPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

function isValidPhone(value: string) {
  return getPhoneDigits(value).length === 10;
}

function validateForm(form: CheckoutForm) {
  const errors: Partial<Record<FieldName, string>> = {};

  if (!form.email.trim()) errors.email = 'Enter your email';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email';

  if (!form.firstName.trim()) errors.firstName = 'Enter a first name';
  if (!form.lastName.trim()) errors.lastName = 'Enter a last name';
  if (!form.address.trim()) errors.address = 'Enter an address';
  if (!form.city.trim()) errors.city = 'Enter a city';
  if (!form.state.trim()) errors.state = 'Select a state';

  if (!form.pincode.trim()) errors.pincode = 'Enter a PIN code';
  else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a 6-digit PIN code';

  if (!form.phone.trim()) errors.phone = 'Enter a phone number';
  else if (!isValidPhone(form.phone)) errors.phone = 'Enter a 10-digit phone number';

  return errors;
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); checkout still works without it.
  }
}

export default function CheckoutPage() {
  const { items, total, clearCart, addItem } = useCartStore();
  const { user, setAuthModalOpen } = useUserStore();
  const router = useRouter();

  // The cart lives in localStorage, so wait for the browser before rendering it.
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [checkoutConfigLoaded, setCheckoutConfigLoaded] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);

  const [isCouponModalOpen, setCouponModalOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; code: string } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
  const [savedAddressesError, setSavedAddressesError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState<string | null>(null);
  const [profileFullName, setProfileFullName] = useState('');

  const [formData, setFormData] = useState<CheckoutForm>({ ...EMPTY_FORM, email: user?.email || '' });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);

  const checkoutTokenRef = useRef<string | null>(null);
  // True once details were restored from a recovery link or a previous visit,
  // so the default saved address does not overwrite them.
  const prefilledRef = useRef(false);

  const errors = useMemo(() => validateForm(formData), [formData]);
  const isFormValid = Object.keys(errors).length === 0;
  const fieldError = (name: FieldName) => ((submitted || touched[name]) ? errors[name] : undefined);

  const setField = (name: FieldName, value: string) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setField(e.target.name as FieldName, e.target.value);
    if (e.target.name !== 'email' && e.target.name !== 'phone') {
      setSelectedAddressId(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched((current) => ({ ...current, [e.target.name]: true }));
  };

  const fieldProps = (name: FieldName) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(fieldError(name)),
    className: `${INPUT_CLASS} ${fieldError(name) ? 'border-[#A63A3A]' : 'border-[#D8CBBE]'}`,
  });

  const renderFieldError = (name: FieldName) =>
    fieldError(name) ? <p className="mt-1.5 text-xs text-[#A63A3A]">{fieldError(name)}</p> : null;

  const applyAddressToForm = useCallback((address: CustomerAddress) => {
    const effectiveFullName = getEffectiveAddressName(address.fullName, profileFullName);
    const { firstName, lastName } = splitAddressFullName(effectiveFullName);

    setSelectedAddressId(address.id);
    setFormData((current) => ({
      ...current,
      email: user?.email || current.email,
      phone: address.phone || current.phone,
      firstName,
      lastName,
      address: address.addressLine,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }, [profileFullName, user?.email]);

  // Restore a recovery link (/checkout?recover=<token>) or details saved on a previous visit.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const recoverToken = new URLSearchParams(window.location.search).get('recover');

      if (recoverToken) {
        try {
          const response = await fetch(`/api/checkout/session?token=${encodeURIComponent(recoverToken)}`, { cache: 'no-store' });
          const payload = await response.json() as RecoveredSessionResponse;
          if (cancelled) return;

          if (!response.ok || !payload.session) {
            setCheckoutNotice({ tone: 'error', text: payload.error || 'This checkout link is no longer available.' });
          } else {
            const session = payload.session;
            prefilledRef.current = true;
            checkoutTokenRef.current = session.token;
            writeStorage(CHECKOUT_TOKEN_KEY, session.token);

            clearCart();
            session.items.forEach((item) => addItem(item));

            setFormData({
              email: session.email,
              phone: session.phone,
              firstName: session.address.firstName,
              lastName: session.address.lastName,
              address: session.address.addressLine,
              apartment: session.address.apartment,
              city: session.address.city,
              state: session.address.state,
              pincode: session.address.pincode,
            });
            if (session.couponCode) setCouponInput(session.couponCode);

            setCheckoutNotice(
              session.items.length > 0
                ? { tone: 'success', text: 'Welcome back! We saved your cart and details so you can finish your order.' }
                : { tone: 'info', text: 'The items from your saved checkout are no longer available.' }
            );
          }
        } catch (error) {
          console.error('Could not restore checkout', error);
        }

        window.history.replaceState(null, '', window.location.pathname);
      } else {
        checkoutTokenRef.current = readStorage(CHECKOUT_TOKEN_KEY);

        try {
          const saved = JSON.parse(readStorage(SAVED_INFO_KEY) || 'null') as Partial<CheckoutForm> | null;
          if (saved && typeof saved === 'object') {
            prefilledRef.current = true;
            setFormData((current) => {
              const next = { ...current };
              (Object.keys(EMPTY_FORM) as FieldName[]).forEach((key) => {
                if (!next[key] && typeof saved[key] === 'string') next[key] = saved[key] as string;
              });
              return next;
            });
          }
        } catch {
          // Ignore unreadable saved details.
        }
      }

      if (!cancelled) setReady(true);
    }

    void restore();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadCheckoutConfig() {
      try {
        const response = await fetch('/api/checkout/config', { cache: 'no-store' });
        const payload = await response.json() as CheckoutConfigResponse;
        setPaymentsEnabled(Boolean(payload.paymentsEnabled));
        setShippingSettings(normalizeShippingSettings(payload.shippingSettings));
      } catch (error) {
        console.error('Could not load checkout config', error);
        setPaymentsEnabled(false);
        setShippingSettings(DEFAULT_SHIPPING_SETTINGS);
      } finally {
        setCheckoutConfigLoaded(true);
      }
    }

    loadCheckoutConfig();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
      if (fbq) {
        fbq('track', 'InitiateCheckout', {
          content_ids: items.map(item => item.id),
          content_type: 'product',
          value: total,
          currency: 'INR',
          num_items: items.reduce((sum, item) => sum + item.quantity, 0)
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAddressBook = async () => {
      if (!user) {
        setSavedAddresses([]);
        setSelectedAddressId(null);
        setSavedAddressesError(null);
        return;
      }

      setSavedAddressesLoading(true);
      setSavedAddressesError(null);

      try {
        const [profile, addresses] = await Promise.all([
          getCustomerProfileState(user),
          getCustomerAddresses(),
        ]);

        if (cancelled) return;

        setProfileFullName(profile.fullName);
        setFormData((current) => ({
          ...current,
          email: current.email || user.email || '',
          phone: current.phone || profile.phone,
          firstName: current.firstName || splitAddressFullName(profile.fullName).firstName,
          lastName: current.lastName || splitAddressFullName(profile.fullName).lastName,
        }));

        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
        if (defaultAddress && !prefilledRef.current) {
          applyAddressToForm(defaultAddress);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        const errorMsg = err instanceof Error ? err.message : 'Could not load saved addresses.';
        setSavedAddressesError(errorMsg);
      } finally {
        if (!cancelled) {
          setSavedAddressesLoading(false);
        }
      }
    };

    void loadAddressBook();

    return () => {
      cancelled = true;
    };
  }, [applyAddressToForm, user]);

  const routeToOrders = (
    orderId: string,
    status: 'pending' | 'failed' | 'paid',
    message?: string
  ) => {
    const params = new URLSearchParams({ orderId, status });
    if (message) {
      params.set('message', message);
    }
    router.push(`/orders?${params.toString()}`);
  };

  const [dbFreeDelivery, setDbFreeDelivery] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;

    async function verifyFreeDeliveryWithBackend() {
      try {
        const productIds = items.map((i) => i.id).filter(Boolean);
        const variantIds = items.map((i) => i.variantId).filter(Boolean);

        let hasFree = false;

        if (productIds.length > 0) {
          const { data: prods } = await supabase
            .from('products')
            .select('id, is_free_delivery')
            .in('id', productIds)
            .eq('is_free_delivery', true);

          if (prods && prods.length > 0) {
            hasFree = true;
          }
        }

        if (!hasFree && variantIds.length > 0) {
          const { data: vars } = await supabase
            .from('product_variants')
            .select('id, products(is_free_delivery)')
            .in('id', variantIds);

          type VariantFreeDeliveryRow = {
            products: { is_free_delivery?: boolean | null } | Array<{ is_free_delivery?: boolean | null }> | null;
          };

          if (((vars || []) as VariantFreeDeliveryRow[]).some((v) => {
            const p = v.products;
            return Array.isArray(p) ? p[0]?.is_free_delivery : p?.is_free_delivery;
          })) {
            hasFree = true;
          }
        }

        if (!cancelled && hasFree) {
          setDbFreeDelivery(true);
        }
      } catch (err) {
        console.error('Failed to verify free delivery from backend', err);
      }
    }

    verifyFreeDeliveryWithBackend();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Discount codes are always checked on the server so the preview matches what is charged.
  const applyCoupon = useCallback(async (rawCode: string, options?: { silent?: boolean }) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: useCartStore.getState().total }),
      });
      const payload = await response.json() as CouponCheckResponse;

      if (!response.ok || !payload.code || typeof payload.amount !== 'number') {
        setAppliedDiscount(null);
        if (!options?.silent) setCouponError(payload.error || 'This code is not valid.');
        return;
      }

      setAppliedDiscount({ code: payload.code, amount: payload.amount });
      setCouponInput('');
    } catch {
      if (!options?.silent) setCouponError('Could not check this code. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  }, []);

  // Re-check the applied code whenever the cart value changes.
  const appliedCode = appliedDiscount?.code || null;
  const lastCheckedTotalRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    const previousTotal = lastCheckedTotalRef.current;
    lastCheckedTotalRef.current = total;

    if (appliedCode && previousTotal !== null && previousTotal !== total && total > 0) {
      void applyCoupon(appliedCode, { silent: true });
    }
  }, [appliedCode, applyCoupon, ready, total]);

  // Save the checkout as the shopper types so it can be recovered if they leave.
  useEffect(() => {
    if (!ready || items.length === 0) return;
    if (!isValidEmail(formData.email) && !isValidPhone(formData.phone)) return;

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: checkoutTokenRef.current,
            userId: user?.id || null,
            email: isValidEmail(formData.email) ? formData.email : null,
            phone: isValidPhone(formData.phone) ? formData.phone : null,
            address: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressLine: formData.address,
              apartment: formData.apartment,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
            items,
            couponCode: appliedCode,
          }),
        });
        const payload = await response.json() as { token?: string | null };
        if (response.ok && payload.token) {
          checkoutTokenRef.current = payload.token;
          writeStorage(CHECKOUT_TOKEN_KEY, payload.token);
        }
      } catch {
        // Saving the draft is best-effort and must never interrupt checkout.
      }
    }, DRAFT_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [appliedCode, formData, items, ready, user?.id]);

  const isPaymentUnavailable = checkoutConfigLoaded && !paymentsEnabled;
  const hasFreeDeliveryItem = items.some((item) => Boolean(item.is_free_delivery)) || dbFreeDelivery;
  const discountAmount = Math.min(appliedDiscount?.amount || 0, total);
  const shippingQuote = calculateShippingCharge({
    subtotal: total,
    discount: discountAmount,
    state: formData.state,
    settings: shippingSettings,
    hasFreeDeliveryItem,
  });
  const shippingCost = shippingQuote ?? 0;
  const shippingLabel =
    shippingQuote === null ? 'Enter state' : shippingQuote === 0 ? 'FREE' : formatMoney(shippingQuote);
  const orderTotal = Math.max(0, total - discountAmount + shippingCost);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const payButtonLabel = loading
    ? 'Processing...'
    : !checkoutConfigLoaded
      ? 'Checking payment...'
      : !paymentsEnabled
        ? 'Payments unavailable'
        : `Pay now · ${formatMoney(orderTotal)}`;
  const isPayDisabled = loading || !checkoutConfigLoaded || !paymentsEnabled;

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressModalError(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (address: CustomerAddress) => {
    setEditingAddress({
      ...address,
      fullName: getEffectiveAddressName(address.fullName, profileFullName),
    });
    setAddressModalError(null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (input: CustomerAddressInput) => {
    setAddressSaving(true);
    setAddressModalError(null);

    try {
      const savedAddress = editingAddress
        ? await updateCustomerAddress(editingAddress.id, input)
        : await createCustomerAddress(input);

      setSavedAddresses((current) => {
        const withoutOld = current.filter((address) => address.id !== savedAddress.id);
        const next = [savedAddress, ...withoutOld];
        return savedAddress.isDefault
          ? next.map((address) => ({
              ...address,
              isDefault: address.id === savedAddress.id,
            }))
          : next;
      });

      applyAddressToForm(savedAddress);
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not save address.';
      setAddressModalError(errorMsg);
    } finally {
      setAddressSaving(false);
    }
  };

  const focusFirstInvalidField = () => {
    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
    if (!firstInvalid) return;

    const element = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus({ preventScroll: true });
  };

  const handleCheckout = async () => {
    setSubmitted(true);

    if (!isFormValid) {
      focusFirstInvalidField();
      return;
    }

    if (!paymentsEnabled) {
      setCheckoutNotice({
        tone: 'error',
        text: 'Online payments are temporarily unavailable. Please try again later.',
      });
      return;
    }

    writeStorage(SAVED_INFO_KEY, saveInfo ? JSON.stringify(formData) : null);

    setLoading(true);
    setCheckoutNotice(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            userId: user?.id,
            guestEmail: formData.email.trim(),
            guestName: `${formData.firstName} ${formData.lastName}`.trim(),
            guestPhone: formData.phone.trim(),
            address: {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              addressLine: formData.address,
              apartment: formData.apartment,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode.trim()
            },
            shippingCharge: shippingCost,
            couponCode: appliedDiscount?.code,
            checkoutToken: checkoutTokenRef.current,
          },
          items,
          subtotal: total
        })
      });

      const resData = await response.json() as CheckoutResponse;
      if (!response.ok) {
         throw new Error(resData.error || 'Server processing failed');
      }

      if (!resData.razorpayOrderId) {
        throw new Error('Payment session could not be created.');
      }

      let checkoutTerminalStateHandled = false;

      const handleVerificationFailure = async (orderId: string, razorpayOrderId: string, message: string) => {
        if (checkoutTerminalStateHandled) return;
        checkoutTerminalStateHandled = true;

        try {
          const statusResponse = await fetch('/api/checkout/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount: resData.amount / 100,
              razorpayOrderId,
              status: 'failed',
              paymentRequestToken: resData.paymentRequestToken,
            }),
          });

          const statusData = await statusResponse.json() as CheckoutStatusResponse;
          if (!statusResponse.ok) {
            throw new Error(statusData.error || 'Could not update payment status.');
          }
        } catch (statusError) {
          console.error(statusError);
        }

        routeToOrders(orderId, 'failed', message);
      };

      const options: RazorpayCheckoutOptions = {
        key: resData.razorpayKeyId,
        amount: resData.amount,
        currency: "INR",
        name: "Lily Luxora",
        description: "Premium Order",
        order_id: resData.razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: resData.orderId,
                amount: resData.amount / 100,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json() as VerifyPaymentResponse;
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            // Track Purchase event before clearing the cart
            if (typeof window !== 'undefined') {
              const fbq = (window as Window & { fbq?: (event: string, action: string, params?: object) => void }).fbq;
              if (fbq) {
                fbq('track', 'Purchase', {
                  content_ids: items.map(item => item.id),
                  content_type: 'product',
                  value: resData.amount / 100,
                  currency: 'INR',
                  num_items: items.reduce((sum, item) => sum + item.quantity, 0),
                  order_id: resData.orderId
                });
              }
            }

            checkoutTerminalStateHandled = true;
            checkoutTokenRef.current = null;
            writeStorage(CHECKOUT_TOKEN_KEY, null);
            clearCart();
            routeToOrders(resData.orderId, 'paid');
          } catch (verificationError) {
            console.error(verificationError);
            await handleVerificationFailure(
              resData.orderId,
              paymentResponse.razorpay_order_id,
              verificationError instanceof Error ? verificationError.message : 'Payment verification failed.'
            );
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim(),
          contact: getPhoneDigits(formData.phone),
        },
        theme: {
          color: '#8B7768'
        },
        modal: {
          ondismiss: () => {
            if (checkoutTerminalStateHandled) return;
            checkoutTerminalStateHandled = true;
            routeToOrders(resData.orderId, 'pending');
          },
        }
      };
      const RazorpayCtor = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayCtor) {
        throw new Error('Razorpay SDK failed to load.');
      }
      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', async (failureResponse) => {
        const failureMessage = failureResponse.error?.description || 'Payment failed.';
        const failureOrderId = failureResponse.error?.metadata?.order_id || resData.razorpayOrderId || '';
        await handleVerificationFailure(resData.orderId, failureOrderId, failureMessage);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error(err);
      setCheckoutNotice({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Order failed. Please try again.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <main className="flex min-h-[70vh] w-full items-center justify-center bg-[#F7F3ED] text-sm font-sans text-[#63574F]">
        Loading checkout...
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        {checkoutNotice && (
          <div className="mb-8 w-full max-w-md text-left">
            <NoticeBanner tone={checkoutNotice.tone}>{checkoutNotice.text}</NoticeBanner>
          </div>
        )}
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Checkout
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-sm mb-8 leading-relaxed">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Return to Catalogue
        </Link>
      </main>
    );
  }

  const orderSummary = (
    <div className="font-sans text-sm">
      <div className="max-h-[42vh] space-y-4 overflow-y-auto pr-1 pt-2">
        {items.map((item) => (
          <div key={`${item.id}-${item.variantId || 'default'}`} className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#D8CBBE] bg-white">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <ShoppingBag className="absolute inset-0 m-auto h-5 w-5 text-[#B7A596]" />
                )}
              </div>
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6D5C50] px-1.5 text-[11px] font-semibold text-[#F7F3ED]">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="line-clamp-2 block font-medium text-[#382F2A]">{item.name}</span>
              {item.variantLabel && (
                <span className="mt-0.5 line-clamp-1 block text-xs text-[#63574F]">{item.variantLabel}</span>
              )}
            </div>
            <span className="shrink-0 font-medium text-[#382F2A]">{formatMoney(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#D8CBBE] pt-5">
        {appliedDiscount ? (
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2C6E49]/30 bg-[#F2F7F4] py-1.5 pl-3 pr-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2C6E49]">
              <Tag className="h-3.5 w-3.5" />
              {appliedDiscount.code}
              <button
                type="button"
                aria-label={`Remove discount code ${appliedDiscount.code}`}
                onClick={() => setAppliedDiscount(null)}
                className="rounded-full p-1 transition-colors hover:bg-[#2C6E49]/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
            <span className="text-xs text-[#2C6E49]">You save {formatMoney(discountAmount)}</span>
          </div>
        ) : (
          <>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void applyCoupon(couponInput);
              }}
            >
              <label htmlFor="discount-code" className="sr-only">Discount code</label>
              <input
                id="discount-code"
                value={couponInput}
                onChange={(event) => {
                  setCouponInput(event.target.value.toUpperCase());
                  setCouponError(null);
                }}
                placeholder="Discount code"
                autoComplete="off"
                className={`${INPUT_CLASS} min-w-0 flex-1 py-3 uppercase tracking-wider ${couponError ? 'border-[#A63A3A]' : 'border-[#D8CBBE]'}`}
              />
              <button
                type="submit"
                disabled={!couponInput.trim() || couponLoading}
                className="shrink-0 rounded-xl bg-[#6D5C50] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F3ED] transition-colors hover:bg-[#58483D] disabled:opacity-40"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </form>
            {couponError && <p className="mt-1.5 text-xs text-[#A63A3A]">{couponError}</p>}
            <button
              type="button"
              onClick={() => setCouponModalOpen(true)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#8B7768] underline underline-offset-4 transition-colors hover:text-[#58483D]"
            >
              <Tag className="h-3.5 w-3.5" /> View available offers
            </button>
          </>
        )}
      </div>

      <div className="mt-5 space-y-2.5 border-t border-[#D8CBBE] pt-5">
        <div className="flex justify-between text-[#63574F]">
          <span>Subtotal · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <span className="font-medium text-[#382F2A]">{formatMoney(total)}</span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between text-[#2C6E49]">
            <span>Discount</span>
            <span>-{formatMoney(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#63574F]">
          <span>Shipping</span>
          <span className={shippingQuote === null ? 'text-[#8B7E76]' : 'font-medium text-[#382F2A]'}>{shippingLabel}</span>
        </div>
        <div className="flex items-baseline justify-between pt-3 text-[#382F2A]">
          <span className="font-heading text-xl">Total</span>
          <span className="text-xl font-bold">
            <span className="mr-2 text-xs font-normal text-[#8B7E76]">INR</span>
            {formatMoney(orderTotal)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      {/* Mobile order summary, collapsed by default */}
      <div className="border-b border-[#D8CBBE] bg-[#EFE7DE] lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((open) => !open)}
          aria-expanded={summaryOpen}
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 font-sans text-sm"
        >
          <span className="flex items-center gap-2 text-[#6D5C50]">
            <ShoppingBag className="h-4 w-4" />
            {summaryOpen ? 'Hide' : 'Show'} order summary
            <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
          </span>
          <span className="text-base font-bold text-[#382F2A]">{formatMoney(orderTotal)}</span>
        </button>
        {summaryOpen && <div className="mx-auto max-w-7xl px-4 pb-6">{orderSummary}</div>}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-36 pt-6 md:px-12 md:py-12 lg:pb-16">
        <Link href="/cart" className="mb-6 flex items-center gap-2 text-xs font-sans font-medium text-[#63574F] transition-colors hover:text-[#8B7768] md:mb-8">
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <form
            noValidate
            className="space-y-10 font-sans text-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCheckout();
            }}
          >
            {checkoutNotice && (
              <NoticeBanner tone={checkoutNotice.tone} onDismiss={() => setCheckoutNotice(null)}>
                {checkoutNotice.text}
              </NoticeBanner>
            )}

            {/* Contact */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-heading font-normal text-[#382F2A]">Contact</h2>
                {!user && (
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="text-xs font-medium text-[#6D5C50] underline underline-offset-4 transition-colors hover:text-[#382F2A]"
                  >
                    Log in
                  </button>
                )}
              </div>
              <label htmlFor="checkout-email" className="sr-only">Email</label>
              <input
                id="checkout-email"
                {...fieldProps('email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Email"
              />
              {renderFieldError('email')}
              <p className="mt-2 text-xs text-[#8B7E76]">Your order confirmation and invoice will be sent here.</p>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="mb-4 text-2xl font-heading font-normal text-[#382F2A]">Delivery</h2>

              {user && (
                <div className="mb-5 space-y-3">
                  {savedAddressesError ? <p className="text-sm text-[#A63A3A]">{savedAddressesError}</p> : null}

                  {savedAddressesLoading ? (
                    <p className="text-[#8B7E76]">Loading saved addresses...</p>
                  ) : (
                    savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                          selectedAddressId === address.id ? 'border-[#8B7768] bg-[#EFE7DE]/60' : 'border-[#E5DACF] bg-white'
                        }`}
                      >
                        <button type="button" onClick={() => applyAddressToForm(address)} className="flex flex-1 items-start gap-3 text-left">
                          <span
                            aria-hidden="true"
                            className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                              selectedAddressId === address.id ? 'border-[5px] border-[#6D5C50]' : 'border-[#B7A596]'
                            }`}
                          />
                          <span>
                            <span className="flex flex-wrap items-center gap-2 font-medium text-[#382F2A]">
                              {getEffectiveAddressName(address.fullName, profileFullName)}
                              {address.isDefault ? (
                                <span className="rounded-full border border-[#D8CBBE] bg-[#EFE7DE] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#6D5C50]">
                                  Default
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-[#63574F]">
                              {address.addressLine}, {address.city}, {address.state} {address.pincode}
                            </span>
                            <span className="block text-[#63574F]">{address.phone}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(address)}
                          className="text-xs font-medium text-[#6D5C50] underline underline-offset-4 hover:text-[#382F2A]"
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={openAddAddressModal}
                    className="text-xs font-medium text-[#6D5C50] underline underline-offset-4 hover:text-[#382F2A]"
                  >
                    + Save a new address to my account
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-xl border border-[#D8CBBE] bg-[#EFE7DE]/50 px-4 py-3.5 text-[#63574F]">
                  Country/Region: <span className="font-medium text-[#382F2A]">India</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="checkout-first-name" className="sr-only">First name</label>
                  <input id="checkout-first-name" {...fieldProps('firstName')} autoComplete="given-name" placeholder="First name" />
                  {renderFieldError('firstName')}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="checkout-last-name" className="sr-only">Last name</label>
                  <input id="checkout-last-name" {...fieldProps('lastName')} autoComplete="family-name" placeholder="Last name" />
                  {renderFieldError('lastName')}
                </div>
                <div className="col-span-2">
                  <label htmlFor="checkout-address" className="sr-only">Address</label>
                  <input id="checkout-address" {...fieldProps('address')} autoComplete="address-line1" placeholder="Address (house no., street, area)" />
                  {renderFieldError('address')}
                </div>
                <div className="col-span-2">
                  <label htmlFor="checkout-apartment" className="sr-only">Apartment, suite, landmark (optional)</label>
                  <input id="checkout-apartment" {...fieldProps('apartment')} autoComplete="address-line2" placeholder="Apartment, suite, landmark (optional)" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="checkout-city" className="sr-only">City</label>
                  <input id="checkout-city" {...fieldProps('city')} autoComplete="address-level2" placeholder="City" />
                  {renderFieldError('city')}
                </div>
                <div className="col-span-1">
                  <label htmlFor="checkout-state" className="sr-only">State</label>
                  <select id="checkout-state" {...fieldProps('state')} autoComplete="address-level1">
                    <option value="">State</option>
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {renderFieldError('state')}
                </div>
                <div className="col-span-1">
                  <label htmlFor="checkout-pincode" className="sr-only">PIN code</label>
                  <input
                    id="checkout-pincode"
                    {...fieldProps('pincode')}
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="PIN code"
                  />
                  {renderFieldError('pincode')}
                </div>
                <div className="col-span-2">
                  <label htmlFor="checkout-phone" className="sr-only">Phone</label>
                  <input id="checkout-phone" {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone (for delivery updates)" />
                  {renderFieldError('phone')}
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-3 text-[#63574F]">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(event) => setSaveInfo(event.target.checked)}
                  className="h-4 w-4 rounded border-[#B7A596] accent-[#6D5C50]"
                />
                Save this information for next time
              </label>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="mb-4 text-2xl font-heading font-normal text-[#382F2A]">Shipping method</h2>
              {shippingQuote === null ? (
                <div className="rounded-xl border border-[#D8CBBE] bg-[#EFE7DE]/50 px-4 py-4 text-[#63574F]">
                  Select your state to see the delivery charge. Orders of {formatMoney(shippingSettings.freeShippingThreshold)} and above ship free.
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[#8B7768] bg-[#EFE7DE]/60 px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Truck className="h-5 w-5 shrink-0 text-[#8B7768]" />
                    <span>
                      <span className="block font-medium text-[#382F2A]">Standard Delivery</span>
                      <span className="block text-xs text-[#63574F]">
                        {hasFreeDeliveryItem
                          ? 'Free delivery applied for a product in your cart'
                          : shippingQuote === 0
                            ? `Free on orders of ${formatMoney(shippingSettings.freeShippingThreshold)} and above`
                            : `Shipping to ${formData.state}`}
                      </span>
                    </span>
                  </span>
                  <span className="font-semibold text-[#382F2A]">{shippingLabel}</span>
                </div>
              )}
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-1 text-2xl font-heading font-normal text-[#382F2A]">Payment</h2>
              <p className="mb-4 flex items-center gap-2 text-xs text-[#63574F]">
                <Lock className="h-3.5 w-3.5 text-[#8B7768]" /> All transactions are secure and encrypted.
              </p>

              {isPaymentUnavailable && (
                <div className="mb-4">
                  <NoticeBanner tone="error">
                    Online payments are temporarily unavailable. Please try again later.
                  </NoticeBanner>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-[#8B7768] bg-white">
                <div className="flex items-center justify-between gap-4 bg-[#EFE7DE]/60 px-4 py-4">
                  <span className="font-medium text-[#382F2A]">Razorpay Secure</span>
                  <span className="text-xs text-[#63574F]">UPI · Cards · Netbanking · Wallets</span>
                </div>
                <p className="border-t border-[#D8CBBE] px-4 py-4 text-xs leading-relaxed text-[#63574F]">
                  After clicking &ldquo;Pay now&rdquo;, a secure Razorpay window opens to complete your purchase.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPayDisabled}
                className="mt-8 hidden w-full rounded-full bg-[#6D5C50] py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] shadow-sm transition-all hover:bg-[#58483D] active:scale-[0.98] disabled:opacity-50 lg:block"
              >
                {payButtonLabel}
              </button>

              <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8B7E76]">
                <Link href="/refund-policy" className="underline underline-offset-4 hover:text-[#382F2A]">Refund policy</Link>
                <Link href="/shipping-policy" className="underline underline-offset-4 hover:text-[#382F2A]">Shipping policy</Link>
                <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-[#382F2A]">Privacy policy</Link>
                <Link href="/terms-of-service" className="underline underline-offset-4 hover:text-[#382F2A]">Terms of service</Link>
              </p>
            </section>

            {/* Sticky pay bar on mobile */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#B7A596]/40 bg-[#F7F3ED]/95 p-4 backdrop-blur-md lg:hidden">
              <button
                type="submit"
                disabled={isPayDisabled}
                className="w-full rounded-full bg-[#6D5C50] px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] shadow-sm transition-all hover:bg-[#58483D] active:scale-[0.98] disabled:opacity-50"
              >
                {payButtonLabel}
              </button>
            </div>
          </form>

          {/* Order summary (desktop) */}
          <aside className="sticky top-28 hidden h-max rounded-2xl border border-[#D8CBBE] bg-[#EFE7DE] p-7 shadow-xs lg:block">
            <h2 className="mb-4 border-b border-[#D8CBBE] pb-4 text-xl font-heading text-[#382F2A]">Order Summary</h2>
            {orderSummary}
          </aside>
        </div>
      </div>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        cartTotal={total}
        onApply={(_amount, code) => void applyCoupon(code)}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          if (addressSaving) return;
          setIsAddressModalOpen(false);
          setEditingAddress(null);
          setAddressModalError(null);
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
        loading={addressSaving}
        error={addressModalError}
      />

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </main>
  );
}
