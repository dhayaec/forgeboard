import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body ?? {};

    if (!email || !password || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name: name ?? email.split('@')[0],
        passwordHash: hash,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ message: 'Registered' }, { status: 201 });
  } catch (e: any) {
    console.error('[register]', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
