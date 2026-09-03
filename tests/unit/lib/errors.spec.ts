import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/errors';

describe('AppError hierarchy', () => {
  it('AppError has code, statusCode, safe, and message', () => {
    const err = new AppError('TEST_ERROR', 'Something went wrong', 500);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.statusCode).toBe(500);
    expect(err.safe).toBe(false);
    expect(err.message).toBe('Something went wrong');
    expect(err.toJSON()).toMatchObject({ code: 'TEST_ERROR', statusCode: 500, safe: false });
  });

  it('NotFoundError defaults to 404', () => {
    const err = new NotFoundError('Project not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.safe).toBe(true);
  });

  it('UnauthorizedError defaults to 401', () => {
    const err = new UnauthorizedError('Not authenticated');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.safe).toBe(true);
  });

  it('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError('Forbidden');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.safe).toBe(true);
  });

  it('ValidationError defaults to 422', () => {
    const err = new ValidationError('Invalid input', { field: ['required'] });
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.safe).toBe(true);
    expect(err.details).toEqual({ field: ['required'] });
  });
});
