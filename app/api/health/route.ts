import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'forgeboard',
      version: process.env.APP_VERSION ?? '0.1.0',
    },
    { status: 200 }
  );
}
