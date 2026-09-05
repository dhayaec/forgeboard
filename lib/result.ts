/**
 * Typed result pattern — avoids throwing for expected error cases.
 * Used throughout the codebase for server-side operations.
 *
 * @example
 * const result = await createProject(data);
 * if (!result.ok) {
 *   return result.error.code; // TypeScript knows this is a string
 * }
 * return result.data; // TypeScript knows this is Project
 */

export type Result<T, E extends AppError = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type AppError = {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
};

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E extends AppError = AppError>(
  error: E
): Result<never, E> {
  return { ok: false, error };
}

/** Create a typed error with a code, message, and optional request ID */
export function appError(
  code: string,
  message: string,
  requestId?: string,
  details?: Record<string, unknown>
): AppError {
  return { code, message, requestId, details };
}

/** Type guard: check if a result is ok */
export function isOk<T, E extends AppError>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok === true;
}

/** Type guard: check if a result is an error */
export function isErr<T, E extends AppError>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Map the success value of a Result.
 * Pass-through errors unchanged.
 */
export function mapResult<T, U, E extends AppError>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  return { ok: true, data: fn(result.data) };
}

/**
 * Chain Result operations — call fn only on success.
 * Useful for sequential operations that might fail.
 */
export function andThen<T, U, E extends AppError>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.data);
}
