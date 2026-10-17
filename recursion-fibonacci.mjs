function validateLength(length) {
  if (!Number.isInteger(length) || length < 0) throw new RangeError('Length must be a non-negative integer.');
}

export function fibs(length) {
  validateLength(length);
  const result = [];
  for (let index = 0; index < length; index += 1) result.push(index < 2 ? index : result[index - 1] + result[index - 2]);
  return result;
}

export function fibsRec(length, trace) {
  validateLength(length);
  trace?.('This was printed recursively');
  if (length === 0) return [];
  if (length === 1) return [0];
  const previous = fibsRec(length - 1, trace);
  return [...previous, length === 2 ? 1 : previous.at(-1) + previous.at(-2)];
}
