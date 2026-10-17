import { testDatabaseUrl } from './database.js';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import request from 'supertest';
import { createApp } from '../app.js';
import { createPrisma } from '../lib/prisma.js';

const db = new pg.Pool({ connectionString: testDatabaseUrl() });
const prisma = createPrisma(testDatabaseUrl());
const app = createApp(db, { prisma, fileStorage: 'database' });
const emails = [];
after(async () => {
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) { await prisma.storedFile.deleteMany({ where: { ownerId: user.id } }); await prisma.user.delete({ where: { id: user.id } }); }
  }
  for (const store of app.locals.sessionStores) { await store.shutdown?.(); store.close?.(); }
  await prisma.$disconnect(); await db.end();
});
async function token(agent) { const page = await agent.get('/files/login'); return page.text.match(/name="csrf-token" content="([a-f0-9]+)"/)[1]; }
async function form(agent, path, data, status = 303) { const csrf = await token(agent); return agent.post(path).type('form').send({ ...data, _csrf: csrf }).expect(status); }
async function account(agent, prefix) {
  const email = prefix + '-' + Date.now() + '@example.test'; emails.push(email);
  await form(agent, '/files/signup', { firstName: 'File', lastName: 'Reader', email, password: 'Learning-Files-123', confirmPassword: 'Learning-Files-123' });
  return prisma.user.findUnique({ where: { email } });
}
test('file folders, validated uploads, private downloads and persistent Prisma sessions', async () => {
  const owner = request.agent(app);
  const other = request.agent(app);
  const user = await account(owner, 'owner');
  await account(other, 'other');
  await form(owner, '/files/folders', { name: 'Research notes' });
  const folder = await prisma.folder.findFirst({ where: { ownerId: user.id } });
  await other.get('/files/folders/' + folder.id).expect(404);
  const csrf = await token(owner);
  const contents = Buffer.from('A private learning note.');
  await owner.post('/files/upload').field('_csrf', csrf).field('folderId', folder.id).attach('file', contents, 'notes.txt').expect(303);
  const file = await prisma.storedFile.findFirst({ where: { ownerId: user.id } });
  assert.equal(file.size, contents.length);
  assert.deepEqual(Buffer.from(file.data), contents);
  assert.ok(await prisma.session.count());
  const download = await owner.get('/files/items/' + file.id + '/download').expect(200).expect('Content-Disposition', /attachment/);
  assert.equal(download.text, contents.toString());
  await other.get('/files/items/' + file.id + '/download').expect(404);
  const otherToken = await token(other);
  await other.post('/files/upload').field('_csrf', otherToken).field('folderId', folder.id).attach('file', contents, 'wrong-owner.txt').expect(404);
  const ownerToken = await token(owner);
  await owner.post('/files/upload').field('_csrf', ownerToken).field('folderId', folder.id).attach('file', Buffer.from('<script>bad</script>'), 'script.html').expect(400);
  await form(owner, '/files/folders/' + folder.id + '/delete', {}, 409);
  await form(owner, '/files/folders/' + folder.id + '/rename', { name: 'Renamed notes' });
  await owner.get('/files/folders/' + folder.id).expect(200).expect(/Renamed notes/);
  await form(owner, '/files/items/' + file.id + '/delete', {});
  await form(owner, '/files/folders/' + folder.id + '/delete', {});
  assert.equal(await prisma.folder.count({ where: { id: folder.id } }), 0);
});
