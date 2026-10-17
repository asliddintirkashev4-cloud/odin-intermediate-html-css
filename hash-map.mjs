export class HashMap {
  #buckets;
  #count = 0;
  #capacity;
  constructor(loadFactor = 0.75, capacity = 16) {
    if (!Number.isFinite(loadFactor) || loadFactor <= 0 || loadFactor > 1 || !Number.isInteger(capacity) || capacity < 1) throw new RangeError('Invalid load factor or capacity.');
    this.loadFactor = loadFactor;
    this.#capacity = capacity;
    this.#buckets = Array.from({length:capacity}, () => []);
  }
  get capacity() { return this.#capacity; }
  hash(key) {
    if (typeof key !== 'string') throw new TypeError('Keys must be strings.');
    let result = 0;
    for (let index = 0; index < key.length; index += 1) result = (31 * result + key.charCodeAt(index)) % this.#capacity;
    return result;
  }
  #bucket(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#buckets.length) throw new Error('Trying to access index out of bounds');
    return this.#buckets[index];
  }
  #grow() {
    const entries = this.entries();
    this.#capacity *= 2;
    this.#buckets = Array.from({length:this.#capacity}, () => []);
    for (const [key, value] of entries) this.#bucket(this.hash(key)).push([key, value]);
  }
  set(key, value) {
    const bucket = this.#bucket(this.hash(key));
    const entry = bucket.find(entry => entry[0] === key);
    if (entry) entry[1] = value;
    else {
      bucket.push([key, value]);
      this.#count += 1;
      if (this.#count / this.#capacity > this.loadFactor) this.#grow();
    }
    return this;
  }
  get(key) { return this.#bucket(this.hash(key)).find(entry => entry[0] === key)?.[1]; }
  has(key) { return this.#bucket(this.hash(key)).some(entry => entry[0] === key); }
  remove(key) {
    const bucket = this.#bucket(this.hash(key));
    const index = bucket.findIndex(entry => entry[0] === key);
    if (index === -1) return false;
    bucket.splice(index, 1);
    this.#count -= 1;
    return true;
  }
  length() { return this.#count; }
  clear() { this.#buckets = Array.from({length:this.#capacity}, () => []); this.#count = 0; }
  entries() { return this.#buckets.flatMap(bucket => bucket.map(([key,value]) => [key,value])); }
  keys() { return this.entries().map(([key]) => key); }
  values() { return this.entries().map(([,value]) => value); }
}

export class HashSet {
  #map = new HashMap();
  get capacity() { return this.#map.capacity; }
  set(key) { this.#map.set(key, true); return this; }
  add(key) { return this.set(key); }
  has(key) { return this.#map.has(key); }
  remove(key) { return this.#map.remove(key); }
  length() { return this.#map.length(); }
  clear() { this.#map.clear(); }
  keys() { return this.#map.keys(); }
}
