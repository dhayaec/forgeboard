import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { createOrganization } from '@/app/actions/org';

export const dynamic = 'force-dynamic';

export default async function CreateOrgPage() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Create Organization</h1>
      <form action={createOrganization} className="space-y-4">
        <input name="name" required placeholder="Organization name" className="w-full rounded-lg border border-border bg-background px-4 py-3" />
        <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Create</button>
      </form>
    </div>
  );
}
