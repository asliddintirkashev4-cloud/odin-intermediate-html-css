import bcrypt from 'bcrypt';
import { createPrisma } from '../lib/prisma.js';
const prisma = createPrisma(process.env.DATABASE_URL);
try {
  const email = (process.env.AUTHOR_EMAIL || "").trim().toLowerCase();
  const password = process.env.AUTHOR_PASSWORD;
  if (!email || !password || password.length < 10 || Buffer.byteLength(password) > 72) throw new Error('Set AUTHOR_EMAIL and AUTHOR_PASSWORD (10–72 bytes) before running this command.');
  if (await prisma.user.findUnique({ where: { email } })) throw new Error('This account already exists. Existing passwords and roles were not changed.');
  await prisma.user.create({ data: { email: email.trim().toLowerCase(), firstName: process.env.AUTHOR_FIRST_NAME || 'Blog', lastName: process.env.AUTHOR_LAST_NAME || 'Author', passwordHash: await bcrypt.hash(password, 12), admin: true, member: true } });
  console.log('Author account created.');
} finally { await prisma.$disconnect(); }
