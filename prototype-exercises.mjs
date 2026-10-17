import assert from 'node:assert/strict';

// Practice reference: https://javascript.info/prototype-inheritance

// 1. An own property wins; deletion reveals the prototype, then no property.
{
  const animal = { jumps: null };
  const rabbit = Object.assign(Object.create(animal), { jumps: true });
  assert.equal(rabbit.jumps, true);
  delete rabbit.jumps;
  assert.equal(rabbit.jumps, null);
  delete animal.jumps;
  assert.equal(rabbit.jumps, undefined);
}

// 2. Lookups travel toward the prototype, never toward its descendants.
// The direct lookup takes fewer conceptual steps. Actual speed depends on the
// engine and its caches; this example does not assume a performance ordering.
{
  const head = { glasses: 1 };
  const table = { pen: 3 };
  const bed = { sheet: 1, pillow: 2 };
  const pockets = { money: 2000 };
  Object.setPrototypeOf(table, head);
  Object.setPrototypeOf(bed, table);
  Object.setPrototypeOf(pockets, bed);
  assert.equal(pockets.pen, 3);
  assert.equal(bed.glasses, 1);
  assert.equal(pockets.glasses, head.glasses);
  assert.equal(table.money, undefined);
}

// 3. A method's receiver controls `this`, even when the method is inherited.
{
  const animal = { eat() { this.full = true; } };
  const rabbit = Object.create(animal);
  rabbit.eat();
  assert.equal(Object.hasOwn(rabbit, 'full'), true);
  assert.equal(rabbit.full, true);
  assert.equal(Object.hasOwn(animal, 'full'), false);
}

// 4. Each instance owns its mutable state; the prototype only shares behavior.
{
  const hamster = { eat(food) { this.stomach.push(food); } };
  function createHamster() {
    return Object.assign(Object.create(hamster), { stomach: [] });
  }
  const speedy = createHamster();
  const lazy = createHamster();
  speedy.eat('apple');
  speedy.eat('carrot');
  assert.deepEqual(speedy.stomach, ['apple', 'carrot']);
  assert.deepEqual(lazy.stomach, []);
  assert.notEqual(speedy.stomach, lazy.stomach);
}

console.log('All four prototype exercises passed.');
