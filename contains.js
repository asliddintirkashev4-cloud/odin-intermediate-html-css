function contains(object, target, seen = new Set()) {
  if (!object || typeof object !== 'object' || seen.has(object)) return false;
  seen.add(object);
  return Object.values(object).some(value => Object.is(value, target) || contains(value, target, seen));
}
module.exports = contains;
