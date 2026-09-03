import 'server-only';
import pino from 'pino';
import { envServer } from '@/lib/env';

/**
 * Structured JSON logger (Pino).
 *
 * Production: emits JSON to stdout for log aggregation.
 * Development: pretty-prints to terminal.
 *
 * Never log secrets, passwords, session tokens, or PII.
 */

const isProduction = envServer.NODE_ENV === 'production';

export const logger = pino({
  level: envServer.LOG_LEVEL,
  base: {
    service: envServer.OTEL_SERVICE_NAME,
    env: envServer.NODE_ENV,
    version: process.env.APP_VERSION ?? '0.1.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'sessionToken',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'mfaSecret',
      'cookie',
      'authorization',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }),
});

/** Generate a request ID (correlates logs across a single request). */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/** Logger with request-bound context. */
export function withRequest(requestId: string, metadata?: Record<string, unknown>) {
  return logger.child({ requestId, ...metadata });
}

/** Logger with user-bound context. */
export function withUser(userId: string, organizationId?: string) {
  return logger.child({ userId, organizationId });
}
