'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { INDIA_STATES } from '@/lib/india-states';

type PaymentRequestOrderItem = {
  id: string;
  title: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type PaymentRequestOrder = {
  id: string;
  orderNumber: number | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  grandTotal: number;
  currency: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  createdAt: string;
  paymentRequestCreatedAt: string | null;
  shippingAddress: Record<string, unknown> | null;
  items: PaymentRequestOrderItem[];
};

type PaymentRequestResponse = {
  error?: string;
  order?: PaymentRequestOrder;
};

type PaymentSessionResponse = {
  error?: string;
  orderId?: string;
  razorpayOrderId?: string | null;
  amount?: number;
  razorpayKeyId?: string | null;
};

type VerifyPaymentResponse = {
  error?: string;
};

type CheckoutStatusResponse = {
  error?: string;
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
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void | Promise<void>) => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

type Notice = {
  tone: 'error' | 'success' | 'info';
  text: string;
};

export default function PaymentRequestPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [order, setOrder] = useState<PaymentRequestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    addressLine: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const isAddressValid = Boolean(
    order?.shippingAddress || (
      address.firstName &&
      address.lastName &&
      address.addressLine &&
      address.city &&
      address.state &&
      address.pincode
    )
  );

  const loadOrder = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/payment-request/${token}`, { cache: 'no-store' });
      const payload = await response.json() as PaymentRequestResponse;

      if (!response.ok || !payload.order) {
        throw new Error(payload.error || 'Payment request not found.');
      }

      setOrder(payload.order);
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not load payment request.',
      });
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePayNow = async () => {
    if (!token || !order) return;

    setSubmitting(true);
    setNotice(null);

    try {
      const sessionResponse = await fetch(`/api/payment-request/${token}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order.shippingAddress ? {} : { address }),
      });

      const sessionPayload = await sessionResponse.json() as PaymentSessionResponse;
      if (!sessionResponse.ok || !sessionPayload.orderId || !sessionPayload.razorpayOrderId || !sessionPayload.amount) {
        throw new Error(sessionPayload.error || 'Could not create payment session.');
      }

      let terminalStateHandled = false;

      const markFailed = async (razorpayOrderId: string, message: string) => {
        if (terminalStateHandled) return;
        terminalStateHandled = true;

        try {
          const statusResponse = await fetch('/api/checkout/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: sessionPayload.orderId,
                amount: sessionPayload.amount! / 100,
                razorpayOrderId,
                status: 'failed',
                paymentRequestToken: token,
              }),
            });

          const statusPayload = await statusResponse.json() as CheckoutStatusResponse;
          if (!statusResponse.ok) {
            throw new Error(statusPayload.error || 'Could not update payment status.');
          }
        } catch (statusError) {
          console.error(statusError);
        }

        setNotice({
          tone: 'error',
          text: message,
        });
        await loadOrder();
      };

      const RazorpayCtor = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayCtor) {
        throw new Error('Razorpay SDK failed to load.');
      }

      const options: RazorpayCheckoutOptions = {
        key: sessionPayload.razorpayKeyId || null,
        amount: sessionPayload.amount,
        currency: order.currency || 'INR',
        name: 'Lily Luxora',
        description: `Payment for order #${order.orderNumber || order.id.slice(0, 8)}`,
        order_id: sessionPayload.razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: sessionPayload.orderId,
                amount: sessionPayload.amount! / 100,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyPayload = await verifyResponse.json() as VerifyPaymentResponse;
            if (!verifyResponse.ok) {
              throw new Error(verifyPayload.error || 'Payment verification failed.');
            }

            terminalStateHandled = true;
            setNotice({
              tone: 'success',
              text: 'Payment confirmed. Your order has been paid successfully.',
            });
            await loadOrder();
          } catch (verificationError) {
            await markFailed(
              paymentResponse.razorpay_order_id,
              verificationError instanceof Error ? verificationError.message : 'Payment verification failed.'
            );
          }
        },
        prefill: {
          name: order.guestName || '',
          email: order.guestEmail || '',
          contact: order.guestPhone || '',
        },
        theme: {
          color: '#8B7768',
        },
        modal: {
          ondismiss: () => {
            if (terminalStateHandled) return;
            setNotice({
              tone: 'info',
              text: 'Payment was not completed. You can reopen this payment request any time.',
            });
          },
        },
      };

      const rzp = new RazorpayCtor(options);
      rzp.on('payment.failed', async (failureResponse) => {
        const failureMessage = failureResponse.error?.description || 'Payment failed.';
        const failureOrderId = failureResponse.error?.metadata?.order_id || sessionPayload.razorpayOrderId || '';
        await markFailed(failureOrderId, failureMessage);
      });
      rzp.open();
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not start payment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-[#F7F3ED] text-[#382F2A] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-10 md:py-16 space-y-8">
        <div className="border-b border-[#B7A596]/40 pb-6">
          <span className="text-[#8B7768] uppercase tracking-[0.24em] text-xs font-sans font-medium block mb-1">
            Lily Luxora Concierge
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-normal tracking-tight text-[#382F2A]">
            {order?.orderNumber ? `Payment for Order #${order.orderNumber}` : 'Secure Payment Request'}
          </h1>
          {order && (
            <p className="mt-2 text-xs font-sans text-[#63574F]">
              Generated on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {notice && (
          <NoticeBanner tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.text}
          </NoticeBanner>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white px-8 py-20 text-center text-[#63574F] font-sans text-sm animate-pulse shadow-xs">
            Loading payment request...
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-[#B7A596]/40 bg-white px-8 py-20 text-center shadow-xs">
            <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-2">Payment request unavailable</h2>
            <p className="text-[#63574F] font-sans text-xs sm:text-sm">
              This link is invalid or no longer active. Please contact customer concierge for assistance.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-1">Order Summary</h2>
                <p className="text-xs font-sans text-[#63574F]">
                  Complete payment to confirm this piece and initiate insured dispatch.
                </p>
              </div>

              <div className="space-y-3.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-xs sm:text-sm font-sans">
                    <div>
                      <p className="font-medium text-[#382F2A]">{item.title || 'Demi-fine Piece'}</p>
                      <p className="text-[11px] text-[#63574F]">Qty {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#382F2A]">₹{item.total_price.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#B7A596]/30 pt-4 flex items-center justify-between text-base sm:text-lg font-heading text-[#382F2A]">
                <span>Total Due</span>
                <span className="font-bold font-sans text-[#382F2A]">₹{order.grandTotal.toFixed(0)}</span>
              </div>
            </div>

            {!order.shippingAddress && (
              <div className="rounded-2xl border border-[#E5DACF] bg-white p-6 sm:p-8 space-y-4 col-span-1 lg:col-span-2 order-last lg:order-none shadow-xs">
                <div>
                  <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-1">Shipping Details</h2>
                  <p className="text-xs font-sans text-[#63574F]">Please provide your destination address for insured Pan-India delivery.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-xs sm:text-sm font-sans pt-2">
                  <input name="firstName" value={address.firstName} onChange={handleAddressChange} placeholder="First Name" className="col-span-1 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                  <input name="lastName" value={address.lastName} onChange={handleAddressChange} placeholder="Last Name" className="col-span-1 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                  <input name="addressLine" value={address.addressLine} onChange={handleAddressChange} placeholder="Street Address" className="col-span-2 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                  <input name="apartment" value={address.apartment} onChange={handleAddressChange} placeholder="Apartment, suite, landmark (optional)" className="col-span-2 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                  <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="col-span-2 md:col-span-1 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="col-span-2 md:col-span-1 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]"
                  >
                    <option value="" className="text-[#8B7E76]">Select State</option>
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state} className="text-[#382F2A]">
                        {state}
                      </option>
                    ))}
                  </select>
                  <input name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="PIN Code" className="col-span-2 bg-[#F7F3ED] border border-[#B7A596]/60 rounded-xl p-3 outline-none focus:border-[#8B7768] transition-colors text-[#382F2A]" />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[#D8CBBE] bg-[#EFE7DE] p-6 sm:p-8 h-max space-y-5 shadow-xs">
              <div>
                <h2 className="text-xl font-heading font-normal text-[#382F2A] mb-1">Razorpay Checkout</h2>
                <p className="text-xs font-sans text-[#63574F] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#8B7768]" />
                  256-bit encrypted UPI &amp; Cards
                </p>
              </div>

              <div className="space-y-1.5 text-xs font-sans text-[#63574F]">
                {order.guestName && <p>Customer: <strong className="text-[#382F2A]">{order.guestName}</strong></p>}
                {order.guestEmail && <p>Email: {order.guestEmail}</p>}
                {order.guestPhone && <p>Phone: {order.guestPhone}</p>}
                <p>Status: <span className="uppercase font-semibold text-[#8B7768]">{order.financialStatus || 'pending'}</span></p>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={submitting || order.financialStatus === 'paid' || !isAddressValid}
                title={!isAddressValid ? "Please fill out your shipping address" : undefined}
                className="w-full rounded-full bg-[#6D5C50] hover:bg-[#58483D] text-[#F7F3ED] py-3.5 px-6 font-sans text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                {order.financialStatus === 'paid' ? 'Already Paid' : submitting ? 'Opening Payment...' : 'Complete Payment Now'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </main>
  );
}
