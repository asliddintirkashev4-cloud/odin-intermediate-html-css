function pascal(row) {
  if (!Number.isInteger(row) || row < 1) return undefined;
  if (row === 1) return [1];
  const previous = pascal(row - 1);
  return Array.from({length: row}, (_, index) => (previous[index - 1] ?? 0) + (previous[index] ?? 0));
}
module.exports = pascal;
