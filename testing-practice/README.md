# Testing Practice

ES module functions with Jest and Babel: capitalization, string reversal, arithmetic, Caesar cipher and numeric array statistics.

Run `npm ci` followed by `npm test`. Tests cover known assignment examples, alphabet wrapping, case and punctuation, negative shifts, empty strings, Unicode code points and negative numbers. Empty or non-numeric arrays are rejected by `analyzeArray`; calculator division follows JavaScript arithmetic.

Each new function was introduced through a failing test and a passing implementation. Later cases extend the same public interfaces.
