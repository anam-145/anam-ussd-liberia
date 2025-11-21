import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://liberia.anamwallet.io';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, pin } = body;

    // Validation
    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber is required', code: 'INVALID_PARAMS' }, { status: 400 });
    }

    if (!pin) {
      return NextResponse.json({ error: 'pin is required', code: 'INVALID_PARAMS' }, { status: 400 });
    }

    // PIN 형식 검증 (4-6자리 숫자)
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits', code: 'INVALID_PIN_FORMAT' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/api/ussd/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, pin }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to connect to API server', code: 'API_ERROR' }, { status: 500 });
  }
}
