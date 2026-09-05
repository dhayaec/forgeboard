'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function createOrganization(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/auth/login');
  const name = formData.get('name') as string;
  if (!name?.trim()) throw new Error('Name required');
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const adminRole = await db.role.create({
    data: { organizationId: '', name: 'Admin', isSystem: true },
  });

  const org = await db.organization.create({
    data: { name, slug, roles: { create: { id: adminRole.id, name: 'Admin', isSystem: true } } },
  }).catch(async () => {
    // If org creation fails (slug taken), just create the org without roles
    return db.organization.create({ data: { name, slug } });
  });

  // Ensure admin role exists
  let role = await db.role.findFirst({ where: { organizationId: org.id, name: 'Admin' } });
  if (!role) {
    role = await db.role.create({ data: { organizationId: org.id, name: 'Admin', isSystem: true } });
  }

  await db.organizationMember.create({
    data: { organizationId: org.id, userId: user.id, roleId: role.id },
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
