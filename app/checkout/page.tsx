'use client';

import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowLeft, Lock, Tag } from 'lucide-react';
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

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { user, setAuthModalOpen } = useUserStore();
  const router = useRouter();
  const checkoutFlowRef = useRef<HTMLDivElement | null>(null);
  
  const [step, setStep] = useState<'contact' | 'shipping' | 'payment'>('contact');
  const [loading, setLoading] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [checkoutConfigLoaded, setCheckoutConfigLoaded] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  
  const [isCouponModalOpen, setCouponModalOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; code: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
  const [savedAddressesError, setSavedAddressesError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState<string | null>(null);
  const [profileFullName, setProfileFullName] = useState('');
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

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
          email: user.email || current.email,
          phone: current.phone || profile.phone,
          firstName: current.firstName || splitAddressFullName(profile.fullName).firstName,
          lastName: current.lastName || splitAddressFullName(profile.fullName).lastName,
        }));

        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
        if (defaultAddress) {
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

          if (vars && vars.some((v: any) => {
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

  const isPaymentUnavailable = checkoutConfigLoaded && !paymentsEnabled;
  const hasFreeDeliveryItem = items.some((item) => Boolean(item.is_free_delivery)) || dbFreeDelivery;
  const shippingCost =
    calculateShippingCharge({
      subtotal: total,
      discount: appliedDiscount?.amount || 0,
      state: formData.state,
      settings: shippingSettings,
      hasFreeDeliveryItem,
    }) ?? 0;
  const isContactStepValid = Boolean(
    formData.email &&
      formData.phone &&
      formData.firstName &&
      formData.lastName &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.pincode
  );
  const orderTotal = Math.max(0, total - (appliedDiscount?.amount || 0) + shippingCost);
  const contactCtaLabel = 'Continue to Shipping';
  const shippingCtaLabel = 'Continue to Payment';
  const paymentAmountLabel = `Pay Now • ₹${orderTotal.toFixed(2)}`;
  const paymentCtaLabel = loading
    ? 'Processing...'
    : !checkoutConfigLoaded
      ? 'Checking Payment...'
      : !paymentsEnabled
        ? 'Payments Unavailable'
        : paymentAmountLabel;

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

  const handleCheckout = async () => {
    if (!paymentsEnabled) {
      setCheckoutNotice({
        tone: 'error',
        text: 'Online payments are temporarily unavailable. Please try again later.',
      });
      return;
    }

    setLoading(true);
    setCheckoutNotice(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            userId: user?.id,
            guestEmail: formData.email,
            guestName: `${formData.firstName} ${formData.lastName}`.trim(),
            guestPhone: formData.phone,
            address: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              addressLine: formData.address,
              apartment: formData.apartment,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode
            },
            shippingCharge: shippingCost,
            discountAmount: appliedDiscount?.amount,
            couponCode: appliedDiscount?.code,
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
                  value: orderTotal,
                  currency: 'INR',
                  num_items: items.reduce((sum, item) => sum + item.quantity, 0),
                  order_id: resData.orderId
                });
              }
            }

            checkoutTerminalStateHandled = true;
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
          email: formData.email,
          contact: formData.phone,
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
    } finally {
      setLoading(false);
    }
  };

  const scrollCheckoutFlowToTop = useCallback(() => {
    const sectionTop = checkoutFlowRef.current?.getBoundingClientRect().top;
    if (sectionTop === undefined) return;

    window.scrollTo({
      top: Math.max(0, window.scrollY + sectionTop - 132),
      behavior: 'smooth',
    });
  }, []);

  const moveToStep = (nextStep: 'contact' | 'shipping' | 'payment') => {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollCheckoutFlowToTop();
      });
    });
  };

  if (items.length === 0) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
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

  const handlePrimaryAction = () => {
    if (step === 'contact') {
      moveToStep('shipping');
      return;
    }

    if (step === 'shipping') {
      moveToStep('payment');
      return;
    }

    void handleCheckout();
  };

  const isPrimaryActionDisabled =
    step === 'contact'
      ? !isContactStepValid
      : step === 'payment'
        ? loading || !checkoutConfigLoaded || !paymentsEnabled
        : false;

  const primaryActionLabel =
    step === 'contact'
      ? contactCtaLabel
      : step === 'shipping'
        ? shippingCtaLabel
        : paymentCtaLabel;

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-12 md:py-14 md:pb-16">
        <Link href="/cart" className="mb-6 flex items-center gap-2 text-xs font-sans font-medium text-[#63574F] transition-colors hover:text-[#8B7768] md:mb-8">
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20">
          {/* Checkout Flow */}
          <div ref={checkoutFlowRef} className="space-y-8 md:space-y-10">
            {checkoutNotice && (
              <NoticeBanner
                tone={checkoutNotice.tone}
                onDismiss={() => setCheckoutNotice(null)}
              >
                {checkoutNotice.text}
              </NoticeBanner>
            )}

            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2.5 text-xs font-sans">
              <button 
                onClick={() => moveToStep('contact')}
                className={`rounded-full border px-4 py-1.5 transition-colors ${
                  step === 'contact'
                    ? 'border-[#8B7768] bg-[#EFE7DE] text-[#382F2A] font-semibold'
                    : 'border-[#B7A596]/40 bg-white text-[#63574F] hover:text-[#382F2A]'
                }`}
              >
                1. Contact
              </button>
              <span className="text-[#B7A596]">/</span>
              <button 
                disabled={step === 'contact'}
                onClick={() => moveToStep('shipping')}
                className={`rounded-full border px-4 py-1.5 transition-colors ${
                  step === 'contact' ? 'cursor-not-allowed opacity-50' : 'hover:text-[#382F2A]'
                } ${
                  step === 'shipping'
                    ? 'border-[#8B7768] bg-[#EFE7DE] text-[#382F2A] font-semibold'
                    : 'border-[#B7A596]/40 bg-white text-[#63574F]'
                }`}
              >
                2. Shipping
              </button>
              <span className="text-[#B7A596]">/</span>
              <button 
                disabled={step !== 'payment'}
                className={`rounded-full border px-4 py-1.5 transition-colors ${
                  step !== 'payment' ? 'cursor-not-allowed opacity-50' : 'hover:text-[#382F2A]'
                } ${
                  step === 'payment'
                    ? 'border-[#8B7768] bg-[#EFE7DE] text-[#382F2A] font-semibold'
                    : 'border-[#B7A596]/40 bg-white text-[#63574F]'
                }`}
              >
                3. Payment
              </button>
            </nav>

          <details className="rounded-2xl border border-[#D8CBBE] bg-white p-4 shadow-xs lg:hidden" open={step === 'payment'}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8B7768] font-sans font-medium">Order Summary</p>
                <p className="mt-1.5 text-lg font-heading text-[#382F2A]">₹{orderTotal.toFixed(2)}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6D5C50] font-sans font-medium">View details</span>
            </summary>

            <div className="mt-4 space-y-4 border-t border-[#E5DACF] pt-4 text-sm font-sans">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId || 'default'}-mobile`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="line-clamp-1 block text-[#382F2A] font-medium">{item.name}</span>
                    <span className="mt-1 block text-xs text-[#8B7E76]">
                      Qty {item.quantity}{item.variantLabel ? ` • ${item.variantLabel}` : ''}
                    </span>
                  </div>
                  <span className="shrink-0 text-[#382F2A]">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="space-y-2 border-t border-[#E5DACF] pt-4 text-sm">
                <div className="flex justify-between text-[#63574F]">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-[#2C6E49]">
                    <span>Discount</span>
                    <span>-₹{appliedDiscount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#63574F]">
                  <span>Shipping</span>
                  <span>
                    {hasFreeDeliveryItem
                      ? 'FREE'
                      : formData.state
                        ? shippingCost === 0
                          ? 'FREE'
                          : `₹${shippingCost.toFixed(2)}`
                        : 'Enter state'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-heading text-[#382F2A]">
                  <span>Total</span>
                  <span className="text-[#6D5C50] font-semibold">₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {!appliedDiscount && (
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6D5C50] transition-colors hover:text-[#382F2A]"
                >
                  <Tag className="h-4 w-4 text-[#C5A574]" /> Apply Coupon
                </button>
              )}
            </div>
          </details>

          {/* Contact Step */}
          {step === 'contact' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm font-sans">
              <h2 className="mb-4 text-2xl font-heading font-normal text-[#382F2A] md:mb-6">Contact Information</h2>
              
              {!user && (
                <div className="mb-6 rounded-2xl border border-[#D8CBBE] bg-white p-4 shadow-xs">
                  <p className="text-[#63574F] mb-3">Already have an account?</p>
                  <button onClick={() => setAuthModalOpen(true)} className="text-[#6D5C50] font-medium underline underline-offset-4 hover:text-[#382F2A] transition-colors">
                    Log in for faster checkout
                  </button>
                </div>
              )}

              <input 
                name="email" value={formData.email} onChange={handleChange}
                type="email" placeholder="Email Address" 
                className="w-full rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
              />
              <input 
                name="phone" value={formData.phone} onChange={handleChange}
                type="tel" placeholder="Phone Number" 
                className="w-full rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]"
              />

              {user && (
                <div className="space-y-4 rounded-2xl border border-[#D8CBBE] bg-white p-4 md:p-6 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-heading font-normal text-[#382F2A]">Saved Addresses</h3>
                      <p className="text-[#63574F] text-xs mt-1">
                        Select an address, edit an existing one, or add a new address for this account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddAddressModal}
                      className="rounded-full border border-[#B7A596] bg-[#F7F3ED] px-4 py-2 text-xs font-medium text-[#382F2A] hover:border-[#6D5C50] hover:bg-[#6D5C50] hover:text-[#F7F3ED] transition-colors"
                    >
                      Add New
                    </button>
                  </div>

                  {savedAddressesError ? <p className="text-sm text-[#A63A3A]">{savedAddressesError}</p> : null}

                  {savedAddressesLoading ? (
                    <p className="text-[#8B7E76]">Loading saved addresses...</p>
                  ) : savedAddresses.length === 0 ? (
                    <p className="text-[#8B7E76]">No saved addresses yet. Add one to speed up future checkouts.</p>
                  ) : (
                    <div className="grid gap-3">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`rounded-2xl border p-4 transition-colors ${
                            selectedAddressId === address.id ? 'border-[#8B7768] bg-[#EFE7DE]/60' : 'border-[#E5DACF] bg-[#F7F3ED]/50'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => applyAddressToForm(address)}
                              className="text-left flex-1"
                            >
                              <div className="flex items-center gap-3">
                                <p className="font-medium text-[#382F2A]">
                                  {getEffectiveAddressName(address.fullName, profileFullName)}
                                </p>
                                {address.isDefault ? (
                                  <span className="rounded-full bg-[#EFE7DE] border border-[#D8CBBE] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6D5C50]">
                                    Default
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-[#63574F] mt-1">{address.phone}</p>
                              <p className="text-[#382F2A] mt-1">{address.addressLine}</p>
                              <p className="text-[#63574F]">{address.city}, {address.state} {address.pincode}</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditAddressModal(address)}
                              className="rounded-full border border-[#B7A596] bg-white px-4 py-1.5 text-xs font-medium text-[#382F2A] hover:border-[#6D5C50] hover:bg-[#6D5C50] hover:text-[#F7F3ED] transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <h2 className="mb-4 mt-10 text-2xl font-heading font-normal text-[#382F2A] md:mb-6 md:mt-12">Shipping Address</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="col-span-1 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="col-span-1 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="col-span-2 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
                <input name="apartment" value={formData.apartment} onChange={handleChange} placeholder="Apartment, suite, etc. (optional)" className="col-span-2 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
                <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="col-span-2 md:col-span-1 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
                <select
                  name="state"
                  value={formData.state}
                  onChange={(event) => setFormData((current) => ({ ...current, state: event.target.value }))}
                  className="col-span-2 md:col-span-1 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]"
                >
                  <option value="" className="bg-white text-[#8B7E76]">Select State</option>
                  {INDIA_STATES.map((state) => (
                    <option key={state} value={state} className="bg-white text-[#382F2A]">
                      {state}
                    </option>
                  ))}
                </select>
                <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Postal Code" className="col-span-2 rounded-xl bg-white border border-[#D8CBBE] p-4 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A] placeholder:text-[#8B7E76]" />
              </div>

              <button 
                onClick={() => moveToStep('shipping')}
                disabled={!isContactStepValid}
                className="mt-8 hidden w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] py-4 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 md:block"
              >
                {contactCtaLabel}
              </button>
            </div>
          )}

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
              <h2 className="mb-4 text-2xl font-heading md:mb-6">Delivery Charge</h2>

              {hasFreeDeliveryItem ? (
                <div className="rounded-2xl border border-[#2C6E49]/30 bg-[#F2F7F4] p-4 md:p-6 text-[#2C6E49] space-y-1">
                  <div className="font-semibold text-base flex items-center gap-2">
                    <span>🎉 Free Delivery Applied</span>
                  </div>
                  <p className="text-xs text-[#63574F]">
                    Your cart contains a product with free delivery. Shipping charges are completely waived for this order!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-[#B7A596]/40 bg-white p-4 md:p-6 shadow-xs">
                  <div className="flex justify-between gap-4">
                    <span>Orders of ₹{shippingSettings.freeShippingThreshold} and above</span>
                    <span className="font-bold text-[#8B7768]">FREE</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[#63574F]">
                    <span>Kerala orders below ₹{shippingSettings.freeShippingThreshold}</span>
                    <span>₹{shippingSettings.keralaShippingCharge}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[#63574F]">
                    <span>Other states below ₹{shippingSettings.freeShippingThreshold}</span>
                    <span>₹{shippingSettings.otherStatesShippingCharge}</span>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#8B7768] bg-[#EFE7DE] p-4 md:p-6 shadow-xs">
                <div className="flex justify-between gap-4 text-base">
                  <span>
                    Current delivery charge
                    <span className="block text-xs text-[#63574F] mt-1">
                      {hasFreeDeliveryItem
                        ? 'Free delivery applied for product in cart'
                        : formData.state
                          ? `Shipping to ${formData.state}`
                          : 'Set your state in the contact step to confirm the delivery charge'}
                    </span>
                  </span>
                  <span className="font-bold font-sans text-[#382F2A]">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(0)}`}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => moveToStep('payment')}
                className="mt-8 hidden w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] py-4 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] transition-all shadow-sm active:scale-[0.98] md:block"
              >
                {shippingCtaLabel}
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
              <h2 className="mb-4 text-2xl font-heading md:mb-6">Payment</h2>
              <p className="mb-6 flex items-center gap-2 text-[#63574F] text-xs">
                <Lock className="w-4 h-4 text-[#8B7768]" /> All transactions are encrypted with 256-bit SSL security.
              </p>

              {isPaymentUnavailable && (
                <NoticeBanner tone="error">
                  Online payments are temporarily unavailable. Please try again later.
                </NoticeBanner>
              )}
              
              <div className="rounded-2xl border border-[#B7A596]/40 bg-white p-4 md:p-6 shadow-xs">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-heading text-lg text-[#382F2A]">Razorpay Secure Checkout</span>
                  </div>
                  <p className="text-center text-[#63574F] text-xs max-w-sm mx-auto leading-relaxed">
                    {isPaymentUnavailable
                      ? 'Checkout is disabled until the payment gateway is available again.'
                      : 'After clicking "Complete Payment", you will be securely redirected to Razorpay to pay via UPI, Credit/Debit Cards, or Netbanking.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading || !checkoutConfigLoaded || !paymentsEnabled}
                className="mt-8 hidden w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] py-4 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 md:block"
              >
                {paymentCtaLabel}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Lateral */}
        <div className="sticky top-28 hidden h-max rounded-2xl border border-[#D8CBBE] bg-[#EFE7DE] p-7 lg:block shadow-xs">
          <h2 className="text-xl font-heading mb-6 border-b border-[#D8CBBE] pb-4 text-[#382F2A]">Order Summary</h2>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto w-full pr-4 mb-6">
            {items.map(item => (
              <div key={`${item.id}-${item.variantId || 'default'}`} className="flex justify-between items-center gap-4 text-xs sm:text-sm font-sans">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 flex items-center justify-center bg-white border border-[#B7A596]/40 text-xs rounded-full font-semibold">{item.quantity}</span>
                  <div className="min-w-0">
                    <span className="line-clamp-1 block font-medium text-[#382F2A]">{item.name}</span>
                    {item.variantLabel && (
                      <span className="text-[11px] text-[#63574F] line-clamp-1 block">{item.variantLabel}</span>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-[#382F2A]">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#D8CBBE] pt-5 space-y-3 text-xs sm:text-sm font-sans mb-6">
            <div className="flex justify-between text-[#63574F]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#382F2A]">₹{total.toFixed(0)}</span>
            </div>
            
            {appliedDiscount && (
              <div className="flex justify-between text-[#2C6E49] font-medium">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-₹{appliedDiscount.amount.toFixed(0)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-[#63574F]">
              <span>Shipping</span>
              <span>
                {hasFreeDeliveryItem
                  ? 'FREE'
                  : formData.state
                    ? shippingCost === 0
                      ? 'FREE'
                      : `₹${shippingCost.toFixed(0)}`
                    : `Enter state to calculate`}
              </span>
            </div>
            
            {!appliedDiscount && (
              <button 
                onClick={() => setCouponModalOpen(true)}
                className="mt-2 flex items-center gap-1.5 text-xs text-[#8B7768] font-medium underline underline-offset-4 hover:text-[#58483D] transition-colors"
              >
                <Tag className="w-3.5 h-3.5" /> Apply Promo Code
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xl font-heading font-normal pt-4 border-t border-[#D8CBBE] text-[#382F2A]">
            <span>Total</span>
            <span className="font-sans font-bold text-[#382F2A]">₹{orderTotal.toFixed(0)}</span>
          </div>

          <div className="mt-6 pt-5 border-t border-[#D8CBBE] space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#63574F]">
              <Lock className="w-3.5 h-3.5 text-[#8B7768]" />
              <span>Secure 256-bit SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#B7A596]/40 bg-[#F7F3ED]/95 p-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isPrimaryActionDisabled}
            className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] px-4 py-3.5 text-center text-xs font-sans font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {primaryActionLabel}
          </button>
        </div>
        <div className="mx-auto mt-2 flex max-w-7xl items-center justify-between px-2 text-xs font-sans">
          <span className="text-[#63574F]">
            {step === 'payment' ? 'Amount due' : 'Estimated total'}
          </span>
          <span className="font-bold text-base text-[#382F2A]">₹{orderTotal.toFixed(0)}</span>
        </div>
      </div>

      <CouponModal 
        isOpen={isCouponModalOpen} 
        onClose={() => setCouponModalOpen(false)} 
        cartTotal={total}
        onApply={(amount, code) => setAppliedDiscount({ amount, code })}
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
