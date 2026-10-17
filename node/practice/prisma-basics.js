import assert from 'node:assert/strict';
import { createPrisma } from '../lib/prisma.js';
const prisma = createPrisma(process.env.DATABASE_URL);
const email = 'orm-practice-' + Date.now() + '@example.test';
try {
  const user = await prisma.user.create({ data: { email, firstName: 'Prisma', lastName: 'Practice', passwordHash: 'not-a-login-account', posts: { create: { title: 'Hello ORM', content: 'A relation created with Prisma.', published: true } } }, include: { posts: true } });
  assert.equal(user.posts.length, 1);
  await prisma.user.update({ where: { id: user.id }, data: { bio: 'Updated with Prisma' } });
  assert.equal((await prisma.user.findUnique({ where: { email } })).bio, 'Updated with Prisma');
  assert.equal((await prisma.$queryRaw`SELECT 1 AS value`)[0].value, 1);
  await prisma.user.delete({ where: { id: user.id } });
  assert.equal(await prisma.blogPost.count({ where: { authorId: user.id } }), 0);
  console.log('Prisma create, relation, read, update, raw SQL and cascading delete passed.');
} finally { await prisma.user.deleteMany({ where: { email } }); await prisma.$disconnect(); }
