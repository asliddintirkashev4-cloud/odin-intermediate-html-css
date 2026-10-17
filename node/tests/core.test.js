import { testDatabaseUrl } from './database.js';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import request from 'supertest';
import { createApp } from '../app.js';
import { createServer } from '../basic-site/index.js';
const db = new pg.Pool({ connectionString: testDatabaseUrl() });
const app = createApp(db);
before(async () => {  await db.query(await readFile(new URL('../scripts/schema.sql', import.meta.url), 'utf8')); });
after(async () => db.end());
test('native HTTP server routes pages, ignores query parameters and returns genuine 404', async () => {
  const server = createServer();
  try {
    await request(server).get('/').expect(200).expect(/A small corner/);
    await request(server).get('/about?source=test').expect(200).expect(/About this project/);
    await request(server).get('/contact-me').expect(200).expect(/GitHub/);
    await request(server).get('/unknown').expect(404).expect(/Page not found/);
    await request(server).post('/').expect(405);
  } finally { server.close(); }
});
test('Express rewrite serves the same pages and missing routes', async () => {
  for (const path of ['/info/', '/info/about', '/info/contact-me']) await request(app).get(path).expect(200);
  await request(app).get('/info/missing').expect(404);
});
test('board validates input, persists a message, escapes markup and exposes its details', async () => {
  await request(app).post('/board/new').type('form').send({ user: ' ', text: '' }).expect(400).expect(/Author must/);
  const text = 'Database test ' + Date.now() + ' <script>alert(1)</script>';
  await request(app).post('/board/new').type('form').send({ user: 'Test reader', text }).expect(303).expect('Location', '/board/');
  const saved = (await db.query('SELECT id FROM board_messages WHERE text=$1', [text])).rows[0];
  assert.ok(saved.id);
  await request(createApp(db)).get('/board/messages/' + saved.id).expect(200).expect(/&lt;script&gt;/).expect(/Test reader/);
  await request(app).get('/board/messages/invalid').expect(404);
  await request(app).get('/board/messages/2147483647').expect(404);
  await db.query('DELETE FROM board_messages WHERE id=$1', [saved.id]);
});
test('inventory CRUD enforces admin permission and category relations', async () => {
  const inventoryApp = createApp(db, { adminPasscode: 'test-only-passcode' });
  const categoryName = 'Test category ' + Date.now();
  await request(inventoryApp).post('/inventory/categories').type('form').send({ name: categoryName, description: '' }).expect(403);
  await request(inventoryApp).post('/inventory/categories').type('form').send({ name: categoryName, description: 'Test', passcode: 'test-only-passcode' }).expect(303);
  const category = (await db.query('SELECT * FROM categories WHERE name=$1', [categoryName])).rows[0];
  const data = { name: 'Test pen', description: '<b>Ink</b>', categoryId: category.id, price: '2.50', stock: '3', passcode: 'test-only-passcode' };
  await request(inventoryApp).post('/inventory/items').type('form').send({ ...data, price: '-1' }).expect(400);
  await request(inventoryApp).post('/inventory/items').type('form').send(data).expect(303);
  const item = (await db.query('SELECT * FROM inventory_items WHERE category_id=$1', [category.id])).rows[0];
  assert.equal(item.price_cents, 250);
  await request(inventoryApp).get('/inventory/items/' + item.id).expect(200).expect(/&lt;b&gt;Ink/);
  await request(inventoryApp).post('/inventory/categories/' + category.id + '/delete').type('form').send({ passcode: 'test-only-passcode' }).expect(409);
  await request(inventoryApp).post('/inventory/items/' + item.id).type('form').send({ ...data, stock: '8' }).expect(303);
  assert.equal((await db.query('SELECT stock FROM inventory_items WHERE id=$1', [item.id])).rows[0].stock, 8);
  await request(inventoryApp).post('/inventory/items/' + item.id + '/delete').type('form').send({ passcode: 'wrong' }).expect(403);
  await request(inventoryApp).post('/inventory/items/' + item.id + '/delete').type('form').send({ passcode: 'test-only-passcode' }).expect(303);
  await request(inventoryApp).post('/inventory/categories/' + category.id + '/delete').type('form').send({ passcode: 'test-only-passcode' }).expect(303);
  await request(inventoryApp).get('/inventory/items/' + item.id).expect(404);
});
test('practice user validation, SQL search, update and delete work through routes', async () => {
  await request(app).get('/practice/books/42/reserve').expect(200).expect(/42/);
  await request(app).get('/practice/odin/messages/7?sort=date').expect(200).expect(({ body }) => { assert.equal(body.params.messageId, '7'); assert.equal(body.query.sort, 'date'); });
  const data = { firstName: 'Alex', lastName: 'Reader', email: 'alex-' + Date.now() + '@example.test', age: '22', bio: 'Learning Express' };
  await request(app).post('/practice/users/create').type('form').send({ ...data, age: '17' }).expect(400);
  await request(app).post('/practice/users/create').type('form').send({ ...data, email: 'invalid' }).expect(400);
  await request(app).post('/practice/users/create').type('form').send(data).expect(303);
  const user = (await db.query('SELECT * FROM practice_users WHERE email=$1', [data.email])).rows[0];
  await request(app).get('/practice/search').query({ name: 'Alex', email: data.email }).expect(200).expect(/Learning Express/);
  await request(app).get('/practice/search').query({ name: "' OR 1=1 --" }).expect(200).expect(/No matching users/);
  await request(app).post('/practice/users/' + user.id + '/update').type('form').send({ ...data, bio: 'Updated bio' }).expect(303);
  await request(app).get('/practice/search').query({ email: data.email }).expect(200).expect(/Updated bio/);
  await request(app).post('/practice/users/' + user.id + '/delete').expect(303);
  assert.equal((await db.query('SELECT * FROM practice_users WHERE id=$1', [user.id])).rowCount, 0);
});
