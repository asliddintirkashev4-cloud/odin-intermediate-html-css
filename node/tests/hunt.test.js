import { testDatabaseUrl } from './database.js';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import request from 'supertest';
import { createApp } from '../app.js';
import { createPrisma } from '../lib/prisma.js';

const db = new pg.Pool({ connectionString: testDatabaseUrl() });
const prisma = createPrisma(testDatabaseUrl());
const app = createApp(db, { prisma });
let gameId;
after(async () => { if (gameId) await prisma.hunt.deleteMany({ where: { id: gameId } }); for (const store of app.locals.sessionStores) { await store.shutdown?.(); store.close?.(); } await prisma.$disconnect(); await db.end(); });
test('hunt validates normalized coordinates, serializes finds and records server timing', async () => {
  const created = await request(app).post('/hunt/api/games').send({}).expect(201);
  gameId = created.body.id;
  const base = '/hunt/api/games/' + gameId;
  assert.equal(created.body.targets.length, 3);
  assert.equal(created.body.targets[0].x, undefined);
  await request(app).post(base + '/score').send({ name: 'Too early', elapsedMs: 1 }).expect(409);
  await request(app).post(base + '/guess').send({ target: 'milo', x: 2, y: .38 }).expect(400);
  await request(app).post(base + '/guess').send({ target: 'milo', x: .1, y: .1 }).expect(200).expect(({ body }) => assert.equal(body.correct, false));
  await request(app).post(base + '/guess').send({ target: 'milo', x: .23, y: .38 }).expect(200).expect(({ body }) => assert.equal(body.found.length, 1));
  await request(app).post(base + '/guess').send({ target: 'milo', x: .23, y: .38 }).expect(200).expect(({ body }) => assert.equal(body.found.length, 1));
  const last = await Promise.all([
    request(app).post(base + '/guess').send({ target: 'ada', x: .68, y: .68 }).expect(200),
    request(app).post(base + '/guess').send({ target: 'pip', x: .82, y: .29 }).expect(200)
  ]);
  assert.ok(last.some(r => r.body.complete));
  const game = await prisma.hunt.findUnique({ where: { id: gameId } });
  assert.equal(game.found.length, 3);
  assert.ok(game.elapsedMs >= 0 && game.elapsedMs < 30000);
  await request(app).post(base + '/score').send({ name: 'Park tester', elapsedMs: -1 }).expect(201);
  assert.equal((await prisma.hunt.findUnique({ where: { id: gameId } })).elapsedMs, game.elapsedMs);
  await request(app).post(base + '/score').send({ name: 'Overwrite' }).expect(409);
  await request(app).get('/hunt/api/scores').expect(200).expect(({ body }) => assert.ok(body.scores.some(s => s.playerName === 'Park tester')));
});
