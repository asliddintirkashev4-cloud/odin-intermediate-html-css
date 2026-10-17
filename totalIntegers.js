function totalIntegers(input) {
  if (!input || typeof input !== 'object') return undefined;
  function count(value, seen) {
    if (Number.isInteger(value)) return 1;
    if (!value || typeof value !== 'object' || seen.has(value)) return 0;
    const next = new Set(seen).add(value);
    return Object.values(value).reduce((sum, item) => sum + count(item, next), 0);
  }
  return count(input, new Set());
}
module.exports = totalIntegers;
