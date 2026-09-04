/**
 * Prisma configuration for ForgeBoard.
 *
 * In Prisma 6.19+ the datasource connection URL is configured here
 * rather than in schema.prisma. See: https://pris.ly/d/config-datasource
 */
import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
