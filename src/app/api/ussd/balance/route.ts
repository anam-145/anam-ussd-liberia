import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phoneNumber');

  if (!phoneNumber) {
    return NextResponse.json({ error: 'phoneNumber is required', code: 'INVALID_PARAMS' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/ussd/balance?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to connect to API server', code: 'API_ERROR' }, { status: 500 });
  }
}
