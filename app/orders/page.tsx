'use client';

import { useUserStore } from '@/store/userStore';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { NoticeBanner } from '@/components/ui/NoticeBanner';

type OrderItem = {
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_title?: string | null;
};
type Order = {
  id: string;
  order_number: number | null;
  financial_status: string;
  fulfillment_status: string;
  grand_total: number;
  created_at: string;
  order_items: OrderItem[];
};

type OrdersResponse = {
  error?: string;
  orders?: Order[];
};

type RetryPaymentResponse = {
  error?: string;
  orderId: string;
  paymentRequestToken?: string | null;
  razorpayOrderId?: string | null;
  amount: number;
  razorpayKeyId: string | null;
};

type VerifyPaymentResponse = {
  error?: string;
};

type CheckoutStatusResponse = {
  error?: string;
};

type OrderNotice = {
  text: string;
  tone: 'error' | 'success' | 'info';
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
    metadata?: {
      order_id?: string;
    };
  };
};

type RazorpayCheckoutOptions = {
  key: string | null;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void | Promise<void>) => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

function OrdersPageFallback() {
  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight mb-8 border-b border-[#B7A596]/40 pb-6">
          Order History
        </h1>
        <div className="py-24 text-center">
          <p className="text-sm font-sans text-[#63574F] animate-pulse">Loading orders...</p>
        </div>
      </div>
    </main>
  );
}

function OrdersPageContent() {
  const { user, session, setAuthModalOpen } = useUserStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [orderNotice, setOrderNotice] = useState<OrderNotice | null>(null);
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');
  const checkoutStatus = searchParams.get('status');
  const checkoutMessage = searchParams.get('message');

  useEffect(() => {
    async function fetchOrders(accessToken: string) {
      setLoading(true);
      setOrderNotice(null);

      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        const payload = await response.json() as OrdersResponse;
        if (!response.ok) {
          throw new Error(payload.error || 'Could not load orders.');
        }

        setOrders(payload.orders || []);
      } catch (error) {
        setOrders([]);
        setOrderNotice({
          tone: 'error',
          text: error instanceof Error ? error.message : 'Could not load orders.',
        });
      } finally {
        setLoading(false);
      }
    }

    if (!user || !session?.access_token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetchOrders(session.access_token);
  }, [session?.access_token, user]);

  if (!user) {
    return (
      <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium mb-3 block">
          Lily Luxora Account
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-normal tracking-tight text-[#382F2A] mb-4">
          Order History
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-sm mb-8 leading-relaxed">
          Please log in to view your orders and track delivery updates.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3.5 text-xs font-sans font-medium tracking-[0.16em] uppercase transition-all shadow-sm"
        >
          Sign In
        </button>
      </main>
    );
  }

  const checkoutBanner = checkoutMessage || (checkoutStatus === 'pending'
    ? 'Payment was not completed. Your pending order is saved below.'
    : checkoutStatus === 'failed'
      ? 'Payment failed. The related order is marked failed below.'
        : checkoutStatus === 'paid'
          ? 'Payment confirmed. Your latest order is listed below.'
        : null);

  const checkoutBannerTone: OrderNotice['tone'] = checkoutStatus === 'paid' ? 'success' : checkoutStatus ? 'error' : 'info';

  const routeWithStatus = (
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

  const handleRetryPayment = async (orderId: string) => {
    setRetryingOrderId(orderId);
    setOrderNotice(null);
    try {
      if (!session?.access_token) {
        throw new Error('Your session expired. Please sign in again.');
      }

      const retryResponse = await fetch('/api/orders/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const retryData = await retryResponse.json() as RetryPaymentResponse;
      if (!retryResponse.ok || !retryData.razorpayOrderId) {
        throw new Error(retryData.error || 'Could not start payment retry.');
      }

      let checkoutTerminalStateHandled = false;

      const markFailed = async (razorpayOrderId: string, message: string) => {
        if (checkoutTerminalStateHandled) return;
        checkoutTerminalStateHandled = true;

        try {
          const statusResponse = await fetch('/api/checkout/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount: retryData.amount / 100,
              razorpayOrderId,
              status: 'failed',
              paymentRequestToken: retryData.paymentRequestToken,
            }),
          });

          const statusData = await statusResponse.json() as CheckoutStatusResponse;
          if (!statusResponse.ok) {
            throw new Error(statusData.error || 'Could not update order status.');
          }
        } catch (statusError) {
          console.error(statusError);
        }

        routeWithStatus(orderId, 'failed', message);
      };

      const RazorpayCtor = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayCtor) {
        throw new Error('Razorpay SDK failed to load.');
      }

      const options: RazorpayCheckoutOptions = {
        key: retryData.razorpayKeyId,
        amount: retryData.amount,
        currency: 'INR',
        name: 'Lily Luxora',
        description: `Retry payment for order #${orderId}`,
        order_id: retryData.razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                amount: retryData.amount / 100,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json() as VerifyPaymentResponse;
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            checkoutTerminalStateHandled = true;
            routeWithStatus(orderId, 'paid');
          } catch (verificationError) {
            await markFailed(
              paymentResponse.razorpay_order_id,
              verificationError instanceof Error ? verificationError.message : 'Payment verification failed.'
            );
          }
        },
        modal: {
          ondismiss: () => {
            if (checkoutTerminalStateHandled) return;
            checkoutTerminalStateHandled = true;
            routeWithStatus(orderId, 'pending');
          },
        },
        theme: {
          color: '#8B7768',
        },
      };

      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', async (failureResponse) => {
        const failureMessage = failureResponse.error?.description || 'Payment failed.';
        const failureOrderId = failureResponse.error?.metadata?.order_id || retryData.razorpayOrderId || '';
        await markFailed(failureOrderId, failureMessage);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error(err);
      setOrderNotice({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Could not retry payment.',
      });
    } finally {
      setRetryingOrderId(null);
    }
  };

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
        <div className="border-b border-[#B7A596]/40 pb-6 mb-8">
          <span className="text-[#8B7768] uppercase tracking-[0.22em] text-xs font-sans font-medium block mb-1">
            Purchases &amp; Tracking
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
            Order History
          </h1>
        </div>

        {checkoutBanner && (
          <NoticeBanner tone={checkoutBannerTone} className="mb-8">
            {checkoutBanner}
          </NoticeBanner>
        )}

        {orderNotice && (
          <NoticeBanner
            tone={orderNotice.tone}
            className="mb-8"
            onDismiss={() => setOrderNotice(null)}
          >
            {orderNotice.text}
          </NoticeBanner>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <p className="text-sm font-sans text-[#63574F] animate-pulse">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white py-24 px-4 text-center shadow-xs max-w-xl mx-auto">
            <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-2">No Past Orders Found</h2>
            <p className="text-xs sm:text-sm font-sans text-[#63574F] max-w-md mx-auto mb-6 leading-relaxed">
              You haven&apos;t placed any orders yet. Explore our waterproof demi-fine jewellery collection.
            </p>
            <Link
              href="/products"
              className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-8 py-3 text-xs font-sans font-medium tracking-wide uppercase inline-block shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl border p-6 bg-white shadow-xs ${
                  highlightedOrderId === order.id ? 'border-[#8B7768] ring-1 ring-[#8B7768]/30' : 'border-[#E5DACF]'
                }`}
              >
                <div className="flex flex-wrap justify-between gap-4 mb-5 pb-5 border-b border-[#B7A596]/30">
                  <div>
                    <h3 className="font-heading text-lg font-normal text-[#382F2A]">Order #{order.order_number || order.id.slice(0, 8)}</h3>
                    <p className="text-[#63574F] font-sans text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-base text-[#382F2A]">₹{order.grand_total?.toFixed(0) || '0'}</p>
                    <span className="inline-block mt-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#6D5C50] bg-[#EFE7DE] px-2.5 py-0.5 rounded-full">
                      {order.financial_status || 'Pending'} • {order.fulfillment_status || 'Processing'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {order.order_items?.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center gap-4 text-xs sm:text-sm font-sans">
                      <span className="text-[#63574F]">
                        {item.quantity}x {item.title}
                        {item.variant_title && item.variant_title !== 'Default Variant' ? ` • ${item.variant_title}` : ''}
                      </span>
                      <span className="font-semibold text-[#382F2A]">₹{item.unit_price?.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {(order.financial_status === 'pending' || order.financial_status === 'failed') && (
                  <div className="mt-5 pt-5 border-t border-[#B7A596]/30 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRetryPayment(order.id)}
                      disabled={retryingOrderId === order.id}
                      className="rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] px-6 py-2.5 text-xs font-sans font-semibold uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                    >
                      {retryingOrderId === order.id ? 'Opening...' : 'Complete Payment'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrdersPageContent />
    </Suspense>
  );
}
