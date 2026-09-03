/**
 * Auth.js v5 route handlers.
 *
 * Mounts the GET + POST handlers that power sign-in, sign-out, callbacks,
 * and the session JSON endpoint.
 *
 * See: https://authjs.dev/getting-started/installation#configure
 */
import { handlers } from '@/lib/auth/auth';

export const { GET, POST } = handlers;
