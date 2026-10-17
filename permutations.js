function permutations(values) {
  if (!values.length) return [[]];
  return values.flatMap((value, index) => permutations([...values.slice(0, index), ...values.slice(index + 1)]).map(rest => [value, ...rest]));
}
module.exports = permutations;
