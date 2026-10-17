import { EventEmitter } from 'node:events';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const directory = await mkdtemp(join(tmpdir(), 'odin-node-'));
try {
  const filename = join(directory, 'notes.txt');
  await writeFile(filename, 'Hello from the filesystem!');
  assert.equal(await readFile(filename, 'utf8'), 'Hello from the filesystem!');
  const url = new URL('/books/42?sort=title', 'https://example.com');
  assert.equal(url.pathname, '/books/42');
  assert.equal(url.searchParams.get('sort'), 'title');
  const events = new EventEmitter();
  let received;
  events.once('message', text => { received = text; });
  events.emit('message', 'Hello from an event!');
  assert.equal(received, 'Hello from an event!');
  console.log('Filesystem, URL and EventEmitter exercises passed.');
} finally { await rm(directory, { recursive: true, force: true }); }
