import test from 'node:test';
import assert from 'node:assert/strict';
import {fibs, fibsRec} from './recursion-fibonacci.mjs';
import {mergeSort} from './recursion-merge-sort.mjs';
import {LinkedList} from './linked-list.mjs';
import {HashMap, HashSet} from './hash-map.mjs';
import {Tree, Node} from './binary-search-tree.mjs';
import {knightMoves} from './knights-travails.mjs';

test('Fibonacci iteration and recursion produce the prescribed sequence and base cases', () => {
  for (const fn of [fibs, fibsRec]) {
    assert.deepEqual(fn(8), [0,1,1,2,3,5,8,13]);
    assert.deepEqual(fn(0), []);
    assert.deepEqual(fn(1), [0]);
    assert.deepEqual(fn(2), [0,1]);
    assert.throws(() => fn(-1), RangeError);
  }
  const calls = [];
  fibsRec(8, message => calls.push(message));
  assert.equal(calls.length, 8);
});

test('merge sort handles duplicates, empty arrays, negatives and original course examples', () => {
  const input = [3,2,1,13,8,5,0,1];
  assert.deepEqual(mergeSort(input), [0,1,1,2,3,5,8,13]);
  assert.deepEqual(input, [3,2,1,13,8,5,0,1]);
  assert.deepEqual(mergeSort([105,79,100,110]), [79,100,105,110]);
  assert.deepEqual(mergeSort([]), []);
  assert.deepEqual(mergeSort([73]), [73]);
  assert.deepEqual(mergeSort([2,-5,2,-1]), [-5,-1,2,2]);
});

test('linked list appends, prepends, finds values and removes the head using pop', () => {
  const list = new LinkedList();
  assert.equal(list.head(), undefined); assert.equal(list.tail(), undefined);
  assert.equal(list.pop(), undefined); assert.equal(list.toString(), '');
  list.append('cat'); list.prepend('dog'); list.append('cat');
  assert.equal(list.size(), 3); assert.equal(list.head(), 'dog'); assert.equal(list.tail(), 'cat');
  assert.equal(list.at(1), 'cat'); assert.equal(list.at(3), undefined);
  assert.equal(list.findIndex('cat'), 1); assert.equal(list.findIndex('bird'), -1);
  assert.equal(list.contains('dog'), true); assert.equal(list.contains('bird'), false);
  assert.equal(list.toString(), '( dog ) -> ( cat ) -> ( cat ) -> null');
  assert.equal(list.pop(), 'dog'); assert.equal(list.size(), 2);
  list.pop(); list.pop(); list.append('new');
  assert.equal(list.head(), 'new'); assert.equal(list.tail(), 'new');
});

test('linked list inserts several values at any boundary and repairs its tail on removal', () => {
  const list = new LinkedList();
  list.insertAt(0, 'a', 'd'); list.insertAt(1, 'b', 'c'); list.insertAt(4, 'e');
  assert.equal(list.toString(), '( a ) -> ( b ) -> ( c ) -> ( d ) -> ( e ) -> null');
  assert.equal(list.removeAt(4), 'e'); assert.equal(list.tail(), 'd');
  assert.equal(list.removeAt(0), 'a'); assert.equal(list.removeAt(1), 'c');
  assert.equal(list.toString(), '( b ) -> ( d ) -> null');
  assert.throws(() => list.insertAt(3, 'x'), RangeError);
  assert.throws(() => list.removeAt(-1), RangeError);
});

test('hash map separates collisions, overwrites values and grows only above its load factor', () => {
  const map = new HashMap();
  assert.equal(map.hash('a'), map.hash('q'));
  map.set('a', 1); map.set('q', 2); map.set('a', 3);
  assert.equal(map.length(), 2); assert.equal(map.get('a'), 3); assert.equal(map.get('q'), 2);
  assert.equal(map.remove('a'), true); assert.equal(map.get('q'), 2);
  assert.equal(map.remove('missing'), false); assert.equal(map.get('missing'), undefined);
  map.clear();
  const keys = ['apple','banana','carrot','dog','elephant','frog','grape','hat','ice cream','jacket','kite','lion'];
  keys.forEach((key,index) => map.set(key, index));
  assert.equal(map.capacity, 16); assert.equal(map.length(), 12);
  map.set('apple', 99); assert.equal(map.capacity, 16); assert.equal(map.length(), 12);
  map.set('moon', 'silver');
  assert.equal(map.capacity, 32); assert.equal(map.length(), 13); assert.equal(map.get('apple'), 99);
  keys.slice(1).forEach((key,index) => assert.equal(map.get(key), index + 1));
  assert.equal(map.has('moon'), true); assert.equal(map.has('sun'), false);
  assert.equal(map.keys().length, 13); assert.equal(map.values().includes('silver'), true);
  const entries = map.entries(); entries[0][1] = 'outside mutation';
  assert.equal(map.get('moon'), 'silver');
  assert.ok(Number.isInteger(map.hash('a'.repeat(100000))));
  map.clear(); assert.equal(map.length(), 0); assert.deepEqual(map.entries(), []);
});

test('hash set stores each key once', () => {
  const set = new HashSet(); set.add('cat').add('cat').add('dog');
  assert.equal(set.length(), 2); assert.equal(set.has('dog'), true);
  assert.equal(set.remove('cat'), true); assert.deepEqual(set.keys(), ['dog']);
  set.clear(); assert.equal(set.length(), 0);
});

function traversal(tree, method) { const result = []; tree[method](value => result.push(value)); return result; }
test('balanced tree deduplicates values and supplies all four traversals', () => {
  const input = [7,6,5,4,3,2,1,3]; const tree = new Tree(input);
  assert.equal(tree.root.data, 4); assert.equal(tree.isBalanced(), true);
  assert.deepEqual(traversal(tree,'inOrderForEach'), [1,2,3,4,5,6,7]);
  assert.deepEqual(traversal(tree,'preOrderForEach'), [4,2,1,3,6,5,7]);
  assert.deepEqual(traversal(tree,'postOrderForEach'), [1,3,2,5,7,6,4]);
  assert.deepEqual(traversal(tree,'levelOrderForEach'), [4,2,6,1,3,5,7]);
  assert.equal(tree.height(4), 2); assert.equal(tree.height(1), 0); assert.equal(tree.depth(7), 2);
  assert.equal(tree.height(100), undefined); assert.equal(tree.depth(100), undefined);
  for (const method of ['inOrderForEach','preOrderForEach','postOrderForEach','levelOrderForEach']) assert.throws(() => tree[method](), TypeError);
  assert.deepEqual(input, [7,6,5,4,3,2,1,3]);
});

test('tree inserts and deletes leaves, single-child nodes, two-child nodes and the root', () => {
  const tree = new Tree([1,2,3,4,5,6,7]);
  assert.equal(tree.insert(7), false); assert.equal(tree.insert(8), true);
  assert.equal(tree.deleteItem(1), true); assert.equal(tree.deleteItem(7), true);
  assert.equal(tree.includes(8), true); assert.equal(tree.deleteItem(4), true);
  assert.deepEqual(traversal(tree,'inOrderForEach'), [2,3,5,6,8]);
  assert.equal(tree.deleteItem(99), false);
  for (const value of [2,3,5,6,8]) tree.deleteItem(value);
  assert.equal(tree.root, null); assert.equal(tree.isBalanced(), true);
  tree.insert(10); assert.equal(tree.root.data, 10);
});

test('balance checks descendants even when root subtree heights match, and rebalance retains new values', () => {
  const tree = new Tree();
  tree.root = new Node(10,new Node(5,new Node(4,new Node(3))),new Node(15,null,new Node(16,null,new Node(17))));
  assert.equal(tree.isBalanced(), false);
  tree.rebalance(); assert.equal(tree.isBalanced(), true);
  [101,102,103,104,105].forEach(value => tree.insert(value));
  assert.equal(tree.isBalanced(), false); tree.rebalance(); assert.equal(tree.isBalanced(), true);
  assert.deepEqual(traversal(tree,'inOrderForEach'), [3,4,5,10,15,16,17,101,102,103,104,105]);
});

test('knight BFS returns known shortest distances and legal paths', () => {
  for (const [start,end,distance] of [[[0,0],[1,2],1],[[0,0],[3,3],2],[[0,0],[7,7],6],[[3,3],[4,3],3],[[4,4],[4,4],0]]) {
    const path = knightMoves(start,end);
    assert.equal(path.length - 1, distance); assert.deepEqual(path[0], start); assert.deepEqual(path.at(-1),end);
    assert.equal(new Set(path.map(square => square.join(','))).size, path.length);
    for (let index = 1; index < path.length; index += 1) {
      const [x,y] = path[index]; const [px,py] = path[index-1];
      assert.ok(x >= 0 && x < 8 && y >= 0 && y < 8);
      assert.deepEqual([Math.abs(x-px),Math.abs(y-py)].sort(), [1,2]);
    }
  }
  assert.throws(() => knightMoves([-1,0],[0,0]), RangeError);
  assert.throws(() => knightMoves([0,0],[8,8]), RangeError);
});
