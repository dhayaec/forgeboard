/**
 * Auth.js v5 (NextAuth) configuration.
 *
 * Provides:
 * - Credentials provider (email + password) with bcrypt
 * - Google OAuth provider
 * - GitHub OAuth provider
 * - JWT session strategy
 * - Server-side session retrieval via getServerSession()
 * - Type-safe session shape (User + organization context)
 * - TOTP MFA via otpauth + QR codes via qrcode
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logger } from '@/lib/logging/logger';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { envServer } from '@/lib/env';

export const config = {
  providers: [
    ...(envServer.GOOGLE_CLIENT_ID && envServer.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: envServer.GOOGLE_CLIENT_ID,
            clientSecret: envServer.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(envServer.GITHUB_CLIENT_ID && envServer.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: envServer.GITHUB_CLIENT_ID,
            clientSecret: envServer.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) {
          logger.warn({ event: 'auth.authorize.invalid_input' }, 'Invalid auth input');
          return null;
        }
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          include: { members: true },
        });
        if (!user || !user.passwordHash) {
          logger.info({ event: 'auth.authorize.user_not_found', email }, 'User not found');
          return null;
        }

        // Compare password with bcrypt hash
        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          logger.info({ event: 'auth.authorize.invalid_password', email }, 'Invalid password');
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = {
          id: token.sub,
          email: session.user?.email ?? '',
          name: session.user?.name ?? null,
        };
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        // Track OAuth provider for later use
        token.provider = account?.provider ?? null;
      }
      return token;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);

// ---------------------------------------------------------------------------
// MFA helpers
// ---------------------------------------------------------------------------

/** Configure TOTP authenticator defaults. */
authenticator.options = {
  window: 1,
  step: 30,
};

/**
 * Generate a new TOTP secret for a user and return the otpauth:// URI + QR code data URL.
 * Call this once when enabling MFA — store mfaSecret on the user.
 */
export async function generateMfaSetup(userId: string, email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, envServer.MFA_ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 200,
  });
  return { secret, otpauth, qrDataUrl };
}

/**
 * Verify a TOTP token against a stored mfaSecret.
 */
export function verifyMfaToken(token: string, mfaSecret: string): boolean {
  return authenticator.verify({ token, secret: mfaSecret });
}
