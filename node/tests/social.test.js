import { testDatabaseUrl } from './database.js';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createApp } from '../app.js';
import { createPrisma } from '../lib/prisma.js';

const db = new pg.Pool({ connectionString: testDatabaseUrl() });
const prisma = createPrisma(testDatabaseUrl());
const app = createApp(db, { prisma });
const emails = [];
after(async () => { await prisma.user.deleteMany({ where: { email: { in: emails } } }); for (const store of app.locals.sessionStores) { await store.shutdown?.(); store.close?.(); } await prisma.$disconnect(); await db.end(); });
async function form(agent, area, path, data = {}, status = 303) {
  const page = await agent.get('/' + area + '/login');
  const csrf = page.text.match(/name="csrf-token" content="([a-f0-9]+)"/)[1];
  return agent.post('/' + area + path).type('form').send({ ...data, _csrf: csrf }).expect(status);
}
async function account(name) {
  const email = name.toLowerCase() + '-' + Date.now() + '@example.test'; emails.push(email);
  const password = 'Learning-Social-123';
  const user = await prisma.user.create({ data: { email, firstName: name, lastName: 'Tester', passwordHash: await bcrypt.hash(password, 10) } });
  const agent = request.agent(app);
  for (const area of ['messages', 'book']) await form(agent, area, '/login', { email, password });
  return { user, agent };
}
test('direct messages are private to participants and profile updates cannot grant roles', async () => {
  const a = await account('Sender'); const b = await account('Recipient'); const outsider = await account('Outsider');
  await request(app).get('/messages/').expect(302);
  const message = 'Private note ' + Date.now();
  await form(a.agent, 'messages', '/conversation/' + b.user.id, { text: message, senderId: outsider.user.id });
  await b.agent.get('/messages/conversation/' + a.user.id).expect(200).expect(new RegExp(message));
  await outsider.agent.get('/messages/conversation/' + b.user.id).expect(200).expect(response => assert.ok(!response.text.includes(message)));
  const stored = await prisma.directMessage.findFirst({ where: { text: message } });
  assert.equal(stored.senderId, a.user.id);
  await form(a.agent, 'messages', '/profile', { firstName: 'Sender', lastName: 'Tester', bio: 'A thoughtful reader', avatar: '', admin: 'true' });
  const updated = await prisma.user.findUnique({ where: { id: a.user.id } });
  assert.equal(updated.bio, 'A thoughtful reader'); assert.equal(updated.admin, false);
});
test('social requests require recipient acceptance, feed filters follows and likes are unique', async () => {
  const a = await account('Follower'); const b = await account('Author'); const c = await account('Third');
  await request(app).get('/book/').expect(302).expect('Location', '/book/login');
  const text = 'A social post ' + Date.now();
  await form(b.agent, 'book', '/posts', { text });
  const post = await prisma.socialPost.findFirst({ where: { text } });
  await a.agent.get('/book/').expect(200).expect(response => assert.ok(!response.text.includes(text)));
  await form(a.agent, 'book', '/people/' + b.user.id + '/follow');
  await form(c.agent, 'book', '/people/' + a.user.id + '/accept', {}, 404);
  await form(b.agent, 'book', '/people/' + a.user.id + '/accept');
  await a.agent.get('/book/').expect(200).expect(new RegExp(text));
  await form(a.agent, 'book', '/posts/' + post.id + '/like');
  await form(a.agent, 'book', '/posts/' + post.id + '/like');
  assert.equal(await prisma.like.count({ where: { postId: post.id, userId: a.user.id } }), 1);
  await form(a.agent, 'book', '/posts/' + post.id + '/comments', { text: 'A thoughtful reply' });
  await b.agent.get('/book/').expect(200).expect(/A thoughtful reply/);
  await form(a.agent, 'book', '/posts/' + post.id + '/delete', {}, 404);
  await form(a.agent, 'book', '/people/' + b.user.id + '/unfollow');
  await a.agent.get('/book/').expect(200).expect(response => assert.ok(!response.text.includes(text)));
  await form(b.agent, 'book', '/posts/' + post.id + '/delete');
  assert.equal(await prisma.socialComment.count({ where: { postId: post.id } }), 0);
});
