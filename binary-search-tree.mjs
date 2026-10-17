export class Node {
  constructor(data, left = null, right = null) { this.data = data; this.left = left; this.right = right; }
}
function number(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Tree values must be finite numbers.');
}
function balanced(values, start = 0, end = values.length) {
  if (start >= end) return null;
  const middle = Math.floor((start + end) / 2);
  return new Node(values[middle], balanced(values, start, middle), balanced(values, middle + 1, end));
}
export function buildTree(array) {
  if (!Array.isArray(array)) throw new TypeError('Expected an array.');
  array.forEach(number);
  return balanced([...new Set(array)].sort((a,b) => a-b));
}
function nodeHeight(node) { return node ? 1 + Math.max(nodeHeight(node.left), nodeHeight(node.right)) : -1; }
function requireCallback(callback) { if (typeof callback !== 'function') throw new TypeError('A callback is required.'); }

export class Tree {
  constructor(array = []) { this.root = buildTree(array); }
  #find(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
    let node = this.root;
    while (node) {
      if (value === node.data) return node;
      node = value < node.data ? node.left : node.right;
    }
    return undefined;
  }
  includes(value) { return this.#find(value) !== undefined; }
  insert(value) {
    number(value);
    if (!this.root) { this.root = new Node(value); return true; }
    let node = this.root;
    while (node) {
      if (value === node.data) return false;
      const side = value < node.data ? 'left' : 'right';
      if (!node[side]) { node[side] = new Node(value); return true; }
      node = node[side];
    }
  }
  deleteItem(value) {
    if (!this.includes(value)) return false;
    function remove(node, target) {
      if (!node) return null;
      if (target < node.data) node.left = remove(node.left, target);
      else if (target > node.data) node.right = remove(node.right, target);
      else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let successor = node.right;
        while (successor.left) successor = successor.left;
        node.data = successor.data;
        node.right = remove(node.right, successor.data);
      }
      return node;
    }
    this.root = remove(this.root, value);
    return true;
  }
  levelOrderForEach(callback) {
    requireCallback(callback);
    if (!this.root) return;
    const queue = [this.root];
    for (let index = 0; index < queue.length; index += 1) {
      const node = queue[index];
      callback(node.data);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  #traverse(callback, order) {
    requireCallback(callback);
    function visit(node) {
      if (!node) return;
      if (order === 'pre') callback(node.data);
      visit(node.left);
      if (order === 'in') callback(node.data);
      visit(node.right);
      if (order === 'post') callback(node.data);
    }
    visit(this.root);
  }
  inOrderForEach(callback) { this.#traverse(callback, 'in'); }
  preOrderForEach(callback) { this.#traverse(callback, 'pre'); }
  postOrderForEach(callback) { this.#traverse(callback, 'post'); }
  height(value) { const node = this.#find(value); return node ? nodeHeight(node) : undefined; }
  depth(value) {
    if (!this.includes(value)) return undefined;
    let node = this.root;
    let depth = 0;
    while (node.data !== value) { node = value < node.data ? node.left : node.right; depth += 1; }
    return depth;
  }
  isBalanced() {
    function check(node) {
      if (!node) return -1;
      const left = check(node.left);
      const right = check(node.right);
      if (left === -Infinity || right === -Infinity || Math.abs(left-right) > 1) return -Infinity;
      return 1 + Math.max(left, right);
    }
    return check(this.root) !== -Infinity;
  }
  rebalance() { const values = []; this.inOrderForEach(value => values.push(value)); this.root = balanced(values); }
}
