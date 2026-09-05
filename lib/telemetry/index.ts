/**
 * OpenTelemetry instrumentation for ForgeBoard
 *
 * Setup:
 *   npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/sdk-trace-node
 *   npm install @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http
 *   npm install @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
 *   npm install @opentelemetry/instrumentation-pg @opentelemetry/instrumentation-redis-4
 *   npm install @opentelemetry/resources @opentelemetry/semantic-conventions
 *   npm install @opentelemetry/sdk-metrics
 *
 * Then add instrumentation.setup() at the top of your Next.js server entrypoint
 * (before any other imports, in a file imported via `serverExternalPackages`).
 *
 * For development, set OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
 * For production, use the gRPC endpoint: OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { trace, metrics, context, Span, SpanStatusCode } from '@opentelemetry/api';
import { withRequestId, getRequestId } from '@/lib/telemetry/request-context';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'forgeboard';
const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? '0.1.0';

let sdk: NodeSDK | null = null;

/**
 * Initialise the OpenTelemetry SDK.
 * Call this once at application startup, before any other imports.
 */
export function initTelemetry(): void {
  if (sdk) return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';

  const traceExporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });
  const metricExporter = new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` });
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15_000,
  });

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    }),
    traceExporter,
    metricReader,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-pg': { enabled: true },
      }),
    ],
  });

  sdk.start();

  // Graceful shutdown
  process.on('SIGTERM', () =>
    sdk
      ?.shutdown()
      .then(() => console.log('[telemetry] SDK shut down'))
      .catch(console.error),
  );
}

// ─── Tracing ──────────────────────────────────────────────────────────────────

export { trace };
export type { Span } from '@opentelemetry/api';
export { SpanStatusCode } from '@opentelemetry/api';
export type { Resource } from '@opentelemetry/resources';


/** Get the current active span, or undefined. */
export function getCurrentSpan(): Span | undefined {
  return trace.getSpan(context.active());
}

/** Get the current span's traceId as a hex string, or undefined. */
export function getTraceId(): string | undefined {
  return getCurrentSpan()?.spanContext().traceId;
}

/**
 * Wrap an async function with a new OpenTelemetry span.
 * Automatically attaches the requestId from the current context.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  opts?: { attributes?: Record<string, string | number | boolean> },
): Promise<T> {
  const tracer = trace.getTracer(serviceName, serviceVersion);
  return tracer.startActiveSpan(name, { attributes: opts?.attributes }, async (span) => {
    try {
      // Attach requestId from our AsyncLocalStorage context
      const requestId = getRequestId();
      if (requestId) span.setAttribute('request.id', requestId);

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err instanceof Error ? err : new Error(String(err)));
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      throw err;
    } finally {
      span.end();
    }
  });
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export { metrics };

/** Get a named counter metric. */
export function getCounter(name: string, opts?: { description?: string; unit?: string }) {
  return metrics.getMeter(serviceName, serviceVersion).createCounter(name, opts);
}

/** Get a named histogram metric. */
export function getHistogram(
  name: string,
  opts?: { description?: string; unit?: string; boundaries?: number[] },
) {
  return metrics
    .getMeter(serviceName, serviceVersion)
    .createHistogram(name, { boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], ...opts });
}

/** Get a named up-down counter (gauge). */
export function getUpDownCounter(name: string, opts?: { description?: string; unit?: string }) {
  return metrics.getMeter(serviceName, serviceVersion).createUpDownCounter(name, opts);
}

// ─── Pre-defined ForgeBoard metrics ────────────────────────────────────────────

export const forgeMetrics = {
  /** Counters */
  httpRequests: getCounter('forge.http.requests', { description: 'Total HTTP requests' }),
  apiRequests: getCounter('forge.api.requests', { description: 'Total API requests' }),
  dbQueries: getCounter('forge.db.queries', { description: 'Total DB queries' }),
  authFailures: getCounter('forge.auth.failures', { description: 'Authentication failures' }),
  authSuccesses: getCounter('forge.auth.successes', { description: 'Successful authentications' }),
  jobsEnqueued: getCounter('forge.jobs.enqueued', { description: 'Jobs enqueued' }),
  jobsCompleted: getCounter('forge.jobs.completed', { description: 'Jobs completed successfully' }),
  jobsFailed: getCounter('forge.jobs.failed', { description: 'Jobs that exhausted all retries' }),
  webhooksDelivered: getCounter('forge.webhooks.delivered', { description: 'Webhook deliveries' }),
  webhooksFailed: getCounter('forge.webhooks.failed', { description: 'Failed webhook deliveries' }),
  errors: getCounter('forge.errors', { description: 'Application errors' }),

  /** Histograms */
  httpRequestDuration: getHistogram('forge.http.request.duration', {
    description: 'HTTP request duration in seconds',
    unit: 's',
  }),
  dbQueryDuration: getHistogram('forge.db.query.duration', {
    description: 'DB query duration in seconds',
    unit: 's',
  }),
  jobDuration: getHistogram('forge.job.duration', {
    description: 'Job execution duration in seconds',
    unit: 's',
  }),

  /** Up-down counters (gauges) */
  activeHttpRequests: getUpDownCounter('forge.http.active_requests', {
    description: 'Number of currently in-flight HTTP requests',
  }),
  queueDepth: getUpDownCounter('forge.queue.depth', {
    description: 'Current size of the job queue',
  }),
} as const;

/**
 * Record an HTTP request metric.
 * Call at the start and end of each request handler.
 */
export function recordHttpRequest({
  method,
  path,
  statusCode,
  durationSeconds,
}: {
  method: string;
  path: string;
  statusCode: number;
  durationSeconds: number;
}) {
  const attrs = { method, path, status_code: statusCode };
  forgeMetrics.httpRequests.add(1, attrs);
  forgeMetrics.httpRequestDuration.record(durationSeconds, attrs);
}

/**
 * Record a DB query metric.
 */
export function recordDbQuery({ operation, model, durationSeconds }: {
  operation: string;
  model: string;
  durationSeconds: number;
}) {
  const attrs = { operation, model };
  forgeMetrics.dbQueries.add(1, attrs);
  forgeMetrics.dbQueryDuration.record(durationSeconds, attrs);
}
