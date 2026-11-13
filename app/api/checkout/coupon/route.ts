import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/server/coupons';

// Checks a discount code for the order summary. The amount is a preview only:
// the order total is always recalculated on the server when the order is placed.
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json() as { code?: string; subtotal?: number };
    const orderSubtotal = Number(subtotal);

    if (typeof code !== 'string' || !code.trim() || !Number.isFinite(orderSubtotal) || orderSubtotal <= 0) {
      return NextResponse.json({ error: 'Enter a discount code.' }, { status: 400 });
    }

    const result = await validateCoupon(code.slice(0, 60), orderSubtotal);
    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      code: result.code,
      amount: Math.min(result.amountOff, orderSubtotal),
    });
  } catch (err: unknown) {
    console.error('Coupon check error', err);
    return NextResponse.json({ error: 'Could not check this code. Please try again.' }, { status: 500 });
  }
}
