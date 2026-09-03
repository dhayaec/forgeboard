/**
 * Prisma client singleton.
 * In development, enables connection pooling with `prisma db push` / `prisma migrate dev`.
 * In production, uses connection pooling via `DATABASE_URL` (PgBouncer / Neon / etc).
 */

import { PrismaClient } from '@prisma/client';
import { envServer } from '@/lib/env';
import { logger } from '@/lib/logging/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      envServer.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasourceUrl: envServer.DATABASE_URL,
  });

if (envServer.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Ensure the client is disconnected on shutdown
process.on('beforeExit', async () => {
  await db.$disconnect();
});
