import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('ForgeBoard'),
  APP_VERSION: z.string().default('0.1.0'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(10),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_TRUST_HOST: z.enum(['true', 'false']).default('false'),
  AUTH_URL: z.string().url().default('http://localhost:3000'),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().default(2592000),
  SESSION_UPDATE_AGE_SECONDS: z.coerce.number().int().default(86400),

  // MFA
  MFA_ISSUER: z.string().default('ForgeBoard'),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_ATTACHMENTS: z.string().optional(),
  S3_BUCKET_BACKUPS: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().default('noreply@forgeboard.example'),

  // Observability
  OTEL_SERVICE_NAME: z.string().default('forgeboard'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().default(100),

  // Feature flags
  FEATURE_FLAGS_API_ENABLED: z.enum(['true', 'false']).default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const message = Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(', ')}`)
    .join('\n');

  throw new Error(`❌ Invalid environment variables:\n${message}`);
}

const env = parsed.data;

// Server-only env (never exposed to client)
export const envServer = {
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL,
  DATABASE_POOL_MIN: env.DATABASE_POOL_MIN,
  DATABASE_POOL_MAX: env.DATABASE_POOL_MAX,
  REDIS_URL: env.REDIS_URL,
  AUTH_SECRET: env.AUTH_SECRET,
  AUTH_TRUST_HOST: env.AUTH_TRUST_HOST === 'true',
  AUTH_URL: env.AUTH_URL,
  SESSION_MAX_AGE_SECONDS: env.SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS: env.SESSION_UPDATE_AGE_SECONDS,
  MFA_ISSUER: env.MFA_ISSUER,
  AWS_REGION: env.AWS_REGION,
  AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_ATTACHMENTS: env.S3_BUCKET_ATTACHMENTS,
  S3_BUCKET_BACKUPS: env.S3_BUCKET_BACKUPS,
  SMTP_HOST: env.SMTP_HOST,
  SMTP_PORT: env.SMTP_PORT,
  SMTP_USER: env.SMTP_USER,
  SMTP_PASSWORD: env.SMTP_PASSWORD,
  SMTP_FROM: env.SMTP_FROM,
  OTEL_SERVICE_NAME: env.OTEL_SERVICE_NAME,
  OTEL_EXPORTER_OTLP_ENDPOINT: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  LOG_LEVEL: env.LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
  FEATURE_FLAGS_API_ENABLED: env.FEATURE_FLAGS_API_ENABLED === 'true',
} as const;

// Client-safe env (public vars only)
export const envClient = {
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME,
  APP_VERSION: env.APP_VERSION,
  NODE_ENV: env.NODE_ENV,
} as const;

// Type exports for consumers
export type EnvServer = typeof envServer;
export type EnvClient = typeof envClient;
