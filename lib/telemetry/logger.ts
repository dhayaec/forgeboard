/**
 * Structured logger built on pino with OpenTelemetry-aware correlation.
 *
 * Every log line is auto-tagged with:
 *   - requestId (from AsyncLocalStorage)
 *   - userId, organizationId (if set in context)
 *   - traceId, spanId (from the active OpenTelemetry span, if any)
 *
 * Sensitive fields are redacted automatically via pino's redact path.
 *
 * Usage:
 *   import { logger } from '@/lib/telemetry/logger';
 *   logger.info({ taskId: '...' }, 'task created');
 *   logger.error({ err }, 'something went wrong');
 */

import pino, { Logger, LoggerOptions, DestinationStream } from 'pino';
import { getCurrentSpan } from '@/lib/telemetry/index';
import { getRequestContext } from '@/lib/telemetry/request-context';

const isDev = process.env.NODE_ENV !== 'production';

const redactPaths = [
  'password',
  '*.password',
  'passwordHash',
  '*.passwordHash',
  'token',
  '*.token',
  'accessToken',
  '*.accessToken',
  'refreshToken',
  '*.refreshToken',
  'authorization',
  'headers.authorization',
  'headers.cookie',
  'cookie',
  'secret',
  '*.secret',
  'webhookSecret',
  '*.webhookSecret',
  'apiKey',
  '*.apiKey',
  'idempotencyKey',
  '*.idempotencyKey',
];

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: {
    service: 'forgeboard',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: { paths: redactPaths, remove: true },
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({ pid: bindings.pid, host: bindings.hostname, ...bindings }),
    log: (obj) => obj,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    // Auto-attach request context to every log line
    const ctx = getRequestContext();
    if (!ctx) return {};
    return {
      requestId: ctx.requestId,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
    };
  },
};

const destination: DestinationStream | undefined = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    })
  : undefined;

export const logger: Logger = destination ? pino(baseOptions, destination) : pino(baseOptions);

/**
 * Logger mixin for OpenTelemetry trace correlation.
 * Attach traceId/spanId to every log so a log can be jumped back to in Tempo/Jaeger.
 */
export function withTraceCorrelation(): void {
  const span = getCurrentSpan();
  if (!span) return;
  const { traceId, spanId } = span.spanContext();
  if (traceId && traceId !== '00000000000000000000000000000000') {
    logger.setBindings({ traceId, spanId });
  }
}

/**
 * Create a child logger with a permanent `component` binding.
 * Use this for service-level loggers to keep code clean.
 *
 * Example:
 *   const log = createLogger('auth-service');
 *   log.info('user logged in');
 */
export function createLogger(component: string): Logger {
  return logger.child({ component });
}
