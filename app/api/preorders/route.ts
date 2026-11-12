import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, preorders: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Preorders are currently disabled.' },
    { status: 410 }
  );
}
