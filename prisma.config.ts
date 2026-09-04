/**
 * Prisma configuration for ForgeBoard.
 *
 * Prisma 7 expects the datasource URL here (not in schema.prisma) and
 * resolves `env()` against `process.env`, so we load `.env.local` ourselves
 * because Next.js (not Prisma) reads it.
 */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

for (const file of ['.env.local', '.env']) {
  const full = path.resolve(process.cwd(), file);
  if (existsSync(full)) loadDotenv({ path: full, override: false });
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
