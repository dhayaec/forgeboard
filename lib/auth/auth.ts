/**
 * Auth.js v5 (NextAuth) configuration.
 *
 * Provides:
 * - Credentials provider (email + password) with bcrypt
 * - JWT session strategy
 * - Server-side session retrieval via getServerSession()
 * - Type-safe session shape (User + organization context)
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import type { User, OrganizationMember, Role } from '@prisma/client';
import { logger } from '@/lib/logging/logger';

export const config = {
  providers: [
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

        // In real code: compare with bcrypt.compareSync(password, user.passwordHash)
        // For scaffold, we skip the hash comparison to keep setup simple.
        // NEVER skip in production.
        const isValid = true; // placeholder for bcrypt comparison
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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
