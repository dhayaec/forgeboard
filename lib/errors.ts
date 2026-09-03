/**
 * Application error classes.
 * Each error has a stable code, HTTP status, and human-readable message.
 *
 * Why custom classes?
 * - Stable error codes for clients
 * - HTTP status mapping at API boundary
 * - User-friendly messages
 * - Optional safe metadata
 */

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly safe: boolean;
  readonly metadata?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode = 500,
    safe = true,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.safe = safe;
    this.metadata = metadata;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHENTICATED', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('RATE_LIMITED', 'Too many requests', 429, true, { retryAfter });
  }
}

export class DependencyError extends AppError {
  constructor(service: string, cause?: Error) {
    super('DEPENDENCY_UNAVAILABLE', `${service} is unavailable`, 503, false, {
      service,
      cause: cause?.message,
    });
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred', metadata?: Record<string, unknown>) {
    super('INTERNAL_ERROR', message, 500, false, metadata);
  }
}

/**
 * Format an unknown error for safe client output.
 * Strips stack traces, internal paths, and provider details.
 */
export function formatErrorForClient(error: unknown, requestId?: string) {
  if (error instanceof AppError && error.safe) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.metadata ? { details: error.metadata } : {}),
        requestId,
      },
    };
  }

  if (error instanceof AppError && !error.safe) {
    // Internal error - hide details
    return {
      error: {
        code: error.code,
        message: 'An unexpected error occurred',
        requestId,
      },
    };
  }

  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  };
}
