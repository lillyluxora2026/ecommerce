import { NextResponse } from 'next/server';
import {
  recoverCheckoutSession,
  saveCheckoutSession,
  type CheckoutSessionInput,
} from '@/lib/server/checkout-sessions';

// Saves the in-progress checkout so it can be recovered if the shopper leaves.
export async function POST(req: Request) {
  try {
    const body = await req.json() as CheckoutSessionInput;
    const token = await saveCheckoutSession(body);
    return NextResponse.json({ token });
  } catch (err: unknown) {
    console.error('Checkout session save error', err);
    return NextResponse.json({ error: 'Could not save checkout.' }, { status: 500 });
  }
}

// Restores a checkout from a recovery link: /checkout?recover=<token>
export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token') || '';
    const session = await recoverCheckoutSession(token);

    if (!session) {
      return NextResponse.json({ error: 'This checkout link has expired or was already completed.' }, { status: 404 });
    }

    return NextResponse.json({ session }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: unknown) {
    console.error('Checkout session recovery error', err);
    return NextResponse.json({ error: 'Could not restore checkout.' }, { status: 500 });
  }
}
