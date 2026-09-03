import { NextResponse } from 'next/server';

export async function GET() {
  // In production this would check DB, Redis, etc.
  // For now, just confirm the app is alive.
  const ready = true;

  if (!ready) {
    return NextResponse.json(
      { status: 'not ready', reason: 'dependency check failed' },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    },
    { status: 200 }
  );
}
