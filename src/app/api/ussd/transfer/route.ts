import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, pin, toPhoneNumber, amount } = body;

    // Validation
    if (!phoneNumber || !pin || !toPhoneNumber || !amount) {
      return NextResponse.json({ error: 'Missing required fields', code: 'INVALID_PARAMS' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/api/ussd/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, pin, toPhoneNumber, amount }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to connect to API server', code: 'API_ERROR' }, { status: 500 });
  }
}
