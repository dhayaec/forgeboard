'use client';

import { signIn } from 'next-auth/react';

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Signed out</h1>
        <p className="text-sm text-muted-foreground">Thanks for using ForgeBoard.</p>
        <button onClick={() => signIn('credentials', { callbackUrl: '/dashboard' })}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Sign back in
        </button>
      </div>
    </div>
  );
}
