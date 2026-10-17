export function capitalize(text) {
  return text.length ? text[0].toUpperCase() + text.slice(1) : '';
}

export function reverseString(text) {
  return [...text].reverse().join('');
}

export const calculator = {divide: (a, b) => a / b, multiply: (a, b) => a * b, subtract: (a, b) => a - b, add: (a, b) => a + b};

export function caesarCipher(text, shift) {
  const offset = ((shift % 26) + 26) % 26;
  return [...text].map(character => {
    if (!/[A-Za-z]/.test(character)) return character;
    const base = character >= 'a' && character <= 'z' ? 97 : 65;
    return String.fromCharCode(base + (character.charCodeAt(0) - base + offset) % 26);
  }).join('');
}

export function analyzeArray(values) {
  if (!Array.isArray(values) || !values.length || values.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new TypeError('Expected a non-empty array of finite numbers.');
  }
  return {average: values.reduce((sum, value) => sum + value, 0) / values.length,
    min: Math.min(...values), max: Math.max(...values), length: values.length};
}
