import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRetryPaymentSession, ensureOrderPaymentRequestToken } from '@/lib/server/checkout';
import { customerCanAccessOrder } from '@/lib/server/orders';

type RetryOrderBody = {
  orderId: string;
};

function getAuthClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const authClient = getAuthClient(token);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { orderId } = await req.json() as RetryOrderBody;

    if (!orderId) {
      return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });
    }

    const canAccessOrder = await customerCanAccessOrder({
      orderId,
      userId: user.id,
      email: user.email,
    });

    if (!canAccessOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const session = await createRetryPaymentSession(orderId);
    const paymentRequestToken = await ensureOrderPaymentRequestToken(orderId);
    return NextResponse.json({ success: true, ...session, paymentRequestToken });
  } catch (err: unknown) {
    console.error('Retry payment session error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create retry payment session.' },
      { status: 500 }
    );
  }
}
