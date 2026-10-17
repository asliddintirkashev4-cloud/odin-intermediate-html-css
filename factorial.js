function factorial(value) {
  if (!Number.isInteger(value) || value < 0) return undefined;
  if (value === 0) return 1;
  return value * factorial(value - 1);
}
module.exports = factorial;
