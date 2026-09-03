import { PrismaClient } from '@prisma/client';
const { hash } = await import('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'test@forgeboard.local',
      name: 'Test User',
      passwordHash: await hash('TestPass123!', 10),
      emailVerified: new Date(),
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      roleId: (await prisma.role.create({
        data: {
          organizationId: org.id,
          name: 'Admin',
          isSystem: true,
        },
      })).id,
    },
  });

  console.log({ org: org.id, user: user.id, email: user.email });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
