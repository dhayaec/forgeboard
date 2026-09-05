import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

for (const file of ['.env.local', '.env']) {
  const full = path.resolve(process.cwd(), file);
  if (existsSync(full)) loadDotenv({ path: full, override: false });
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const orgFilter = { organization: { slug: 'demo-org' } };

async function main() {
  await prisma.auditLog.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.notification.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.taskAssignee.deleteMany({ where: { task: { project: orgFilter } } }).catch(() => {});
  await prisma.taskLabel.deleteMany({ where: { task: { project: orgFilter } } }).catch(() => {});
  await prisma.comment.deleteMany({ where: { task: { project: orgFilter } } }).catch(() => {});
  await prisma.attachment.deleteMany({ where: { task: { project: orgFilter } } }).catch(() => {});
  await prisma.task.deleteMany({ where: { project: orgFilter } }).catch(() => {});
  await prisma.project.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.apiKey.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.webhook.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.organizationMember.deleteMany({ where: orgFilter }).catch(() => {});
  await prisma.rolePermission.deleteMany({ where: { role: { organization: { slug: 'demo-org' } } } }).catch(() => {});
  await prisma.role.deleteMany({ where: { organization: { slug: 'demo-org' } } }).catch(() => {});
  await prisma.organization.deleteMany({ where: { slug: 'demo-org' } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: 'test@forgeboard.local' } }).catch(() => {});
  await prisma.permission.deleteMany({}).catch(() => {});

  const org = await prisma.organization.create({ data: { name: 'Demo Organization', slug: 'demo-org' } });
  const adminRole = await prisma.role.create({ data: { organizationId: org.id, name: 'Admin', isSystem: true } });

  const resources = ['projects', 'tasks', 'members', 'comments', 'labels', 'attachments', 'webhooks', 'apiKeys'] as const;
  const actions = ['create', 'read', 'update', 'delete', 'manage'] as const;
  const perms: { id: string; resource: string; action: string }[] = [];
  for (const resource of resources) for (const action of actions) perms.push({ id: `${resource}-${action}`, resource, action });
  await prisma.permission.createMany({ data: perms });

  const allPerms = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({ data: allPerms.map((p) => ({ roleId: adminRole.id, permissionId: p.id })) });

  const user = await prisma.user.create({
    data: {
      email: 'test@forgeboard.local', name: 'Test User',
      passwordHash: await bcrypt.hash('TestPass123!', 10), emailVerified: new Date(),
    },
  });
  await prisma.organizationMember.create({ data: { organizationId: org.id, userId: user.id, roleId: adminRole.id } });
  console.log({ org: org.id, user: user.id, email: user.email });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
