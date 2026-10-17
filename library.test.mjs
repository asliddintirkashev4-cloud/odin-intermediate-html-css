import test from 'node:test';
import assert from 'node:assert/strict';
import {Book, addBookToLibrary, removeBookFromLibrary} from './library-model.mjs';

test('duplicate titles have stable, distinct identities when another book is removed', () => {
  const library = [];
  const first = addBookToLibrary(library, 'Same title', 'Author', 100);
  const second = addBookToLibrary(library, 'Same title', 'Author', 100);
  assert.notEqual(first.id, second.id);
  assert.equal(removeBookFromLibrary(library, first.id), true);
  assert.equal(library.length, 1);
  assert.equal(library[0].id, second.id);
  assert.equal(removeBookFromLibrary(library, first.id), false);
});

test('prototype status toggles do not affect other books', () => {
  const first = new Book('One', 'A', 10);
  const second = new Book('Two', 'B', 20);
  assert.equal(Object.hasOwn(first, 'toggleRead'), false);
  assert.equal(first.toggleRead(), true);
  assert.equal(second.read, false);
  assert.equal(first.toggleRead(), false);
});

test('invalid page counts or blank metadata cannot enter the library', () => {
  const library = [];
  for (const pages of [0, -1, 1.5, 'no pages']) assert.throws(() => addBookToLibrary(library, 'Title', 'Author', pages));
  assert.throws(() => addBookToLibrary(library, '  ', 'Author', 10));
  assert.throws(() => addBookToLibrary(library, undefined, 'Author', 10));
  assert.equal(library.length, 0);
});
