import {capitalize, reverseString, calculator, caesarCipher, analyzeArray} from './practice.js';

test('capitalize changes the first letter while preserving the rest of the string', () => {
  expect(capitalize('hello world')).toBe('Hello world');
});

test('reverseString reverses spaces and punctuation as well as letters', () => {
  expect(reverseString('Hello, world!')).toBe('!dlrow ,olleH');
});

test('calculator adds two numbers', () => {
  expect(calculator.add(7, -3)).toBe(4);
});

test('calculator can subtract', () => {expect(calculator.subtract(7, 10)).toBe(-3);});

test('calculator can multiply', () => {expect(calculator.multiply(-4, 2.5)).toBe(-10);});

test('calculator can divide', () => {expect(calculator.divide(9, 2)).toBe(4.5);});

test('caesarCipher wraps at the end of the alphabet', () => {expect(caesarCipher('xyz', 3)).toBe('abc');});

test('caesarCipher preserves case and punctuation', () => {expect(caesarCipher('HeLLo, World!', 3)).toBe('KhOOr, Zruog!'); expect(caesarCipher('Abc!', -1)).toBe('Zab!');});

test('analyzeArray reports statistics for a numeric array', () => {expect(analyzeArray([1,8,3,4,2,6])).toEqual({average:4,min:1,max:8,length:6});});

test('empty strings, Unicode and large shifts', () => {
  expect(capitalize('')).toBe('');
  expect(capitalize('hELLO')).toBe('HELLO');
  expect(reverseString('A😀B')).toBe('B😀A');
  expect(reverseString('')).toBe('');
  expect(caesarCipher('Zebra 123!', 52)).toBe('Zebra 123!');
  expect(calculator.divide(3, 0)).toBe(Infinity);
});
test('analyzeArray handles negatives without changing input and rejects empty data', () => {
  const input = [-5, -1, -3];
  expect(analyzeArray(input)).toEqual({average:-3, min:-5, max:-1, length:3});
  expect(input).toEqual([-5, -1, -3]);
  expect(() => analyzeArray([])).toThrow(TypeError);
});
