export class Node {
  constructor(value = null, nextNode = null) { this.value = value; this.nextNode = nextNode; }
}

export class LinkedList {
  #head = null;
  #tail = null;
  #count = 0;
  append(value) {
    const node = new Node(value);
    if (this.#tail) this.#tail.nextNode = node;
    else this.#head = node;
    this.#tail = node;
    this.#count += 1;
  }
  prepend(value) {
    this.#head = new Node(value, this.#head);
    if (!this.#tail) this.#tail = this.#head;
    this.#count += 1;
  }
  size() { return this.#count; }
  head() { return this.#head?.value; }
  tail() { return this.#tail?.value; }
  #nodeAt(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#count) return undefined;
    let node = this.#head;
    for (let position = 0; position < index; position += 1) node = node.nextNode;
    return node;
  }
  at(index) { return this.#nodeAt(index)?.value; }
  // The current course specification defines pop as removing the head.
  pop() {
    if (!this.#head) return undefined;
    const value = this.#head.value;
    this.#head = this.#head.nextNode;
    this.#count -= 1;
    if (this.#count === 0) this.#tail = null;
    return value;
  }
  findIndex(value) {
    let node = this.#head;
    let index = 0;
    while (node) {
      if (Object.is(node.value, value)) return index;
      node = node.nextNode;
      index += 1;
    }
    return -1;
  }
  contains(value) { return this.findIndex(value) !== -1; }
  toString() {
    const values = [];
    for (let node = this.#head; node; node = node.nextNode) values.push(`( ${String(node.value)} )`);
    return values.length ? `${values.join(' -> ')} -> null` : '';
  }
  insertAt(index, ...values) {
    if (!Number.isInteger(index) || index < 0 || index > this.#count) throw new RangeError('Index out of bounds.');
    if (values.length === 0) return;
    const dummy = new Node(null, this.#head);
    const previous = index === 0 ? dummy : this.#nodeAt(index - 1);
    let tail = previous;
    const following = previous.nextNode;
    for (const value of values) { tail.nextNode = new Node(value); tail = tail.nextNode; }
    tail.nextNode = following;
    this.#head = dummy.nextNode;
    if (index === this.#count) this.#tail = tail;
    this.#count += values.length;
  }
  removeAt(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#count) throw new RangeError('Index out of bounds.');
    if (index === 0) return this.pop();
    const previous = this.#nodeAt(index - 1);
    const removed = previous.nextNode;
    previous.nextNode = removed.nextNode;
    if (removed === this.#tail) this.#tail = previous;
    this.#count -= 1;
    return removed.value;
  }
}
