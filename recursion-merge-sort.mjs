export function mergeSort(array) {
  if (!Array.isArray(array) || array.some(value => typeof value !== 'number' || !Number.isFinite(value))) throw new TypeError('Expected an array of finite numbers.');
  function sort(values) {
    if (values.length < 2) return [...values];
    const middle = Math.floor(values.length / 2);
    const left = sort(values.slice(0, middle));
    const right = sort(values.slice(middle));
    const merged = [];
    let first = 0;
    let second = 0;
    while (first < left.length && second < right.length) {
      if (left[first] <= right[second]) merged.push(left[first++]);
      else merged.push(right[second++]);
    }
    return [...merged, ...left.slice(first), ...right.slice(second)];
  }
  return sort(array);
}
