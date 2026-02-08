import Fraction from 'fraction.js';

/**
 * Parse a mixed number string or individual parts into a Fraction object
 * @param {string|number} input - Can be "5 3/8", "5-3/8", "5.375", or just "5"
 * @param {number} whole - Whole number part (if providing separate parts)
 * @param {number} numerator - Numerator (if providing separate parts)
 * @param {number} denominator - Denominator (if providing separate parts)
 * @returns {Fraction}
 */
export function parseFraction(input, whole = null, numerator = null, denominator = null) {
  // If separate parts provided
  if (whole !== null || numerator !== null || denominator !== null) {
    const w = whole || 0;
    const n = numerator || 0;
    const d = denominator || 1;

    // Validate denominator
    if (d === 0) {
      throw new Error('Denominator cannot be zero');
    }

    // Convert to improper fraction: whole + (numerator/denominator)
    return new Fraction(w).add(new Fraction(n, d));
  }

  // Parse string input
  if (typeof input === 'string') {
    // Handle formats like "5 3/8" or "5-3/8"
    const cleaned = input.trim().replace('-', ' ');
    return new Fraction(cleaned);
  }

  // Handle numeric input
  return new Fraction(input);
}

/**
 * Convert a Fraction to mixed number format
 * @param {Fraction} fraction
 * @returns {Object} { whole: number, numerator: number, denominator: number }
 */
export function toMixedNumber(fraction) {
  const whole = Math.floor(fraction.valueOf());
  const remainder = fraction.sub(whole);

  return {
    whole: whole,
    numerator: Number(remainder.n),
    denominator: Number(remainder.d)
  };
}

/**
 * Format a Fraction as a mixed number string
 * @param {Fraction} fraction
 * @param {boolean} includeInches - Add inch symbol (")
 * @returns {string} e.g., "5-3/8"" or "5.375"
 */
export function formatMixedNumber(fraction, includeInches = true) {
  const mixed = toMixedNumber(fraction);
  const suffix = includeInches ? '"' : '';

  if (mixed.numerator === 0) {
    // Just a whole number
    return `${mixed.whole}${suffix}`;
  } else if (mixed.whole === 0) {
    // Just a fraction
    return `${mixed.numerator}/${mixed.denominator}${suffix}`;
  } else {
    // Mixed number
    return `${mixed.whole}-${mixed.numerator}/${mixed.denominator}${suffix}`;
  }
}

/**
 * Check if a denominator is a "standard" woodworking fraction
 * Standard woodworking uses only powers of 2 (matching tape measure markings)
 * @param {number} denominator
 * @returns {boolean}
 */
export function isStandardDenominator(denominator) {
  // Only powers of 2: 1, 2, 4, 8, 16, 32, 64
  const standard = [2, 4, 8, 16, 32, 64];
  return standard.includes(denominator);
}

/**
 * Round a fraction to the nearest standard denominator
 * @param {Fraction} fraction
 * @param {number} precision - Target denominator (16, 32, or 64)
 * @returns {Fraction}
 */
export function roundToStandardFraction(fraction, precision = 16) {
  const decimal = fraction.valueOf();

  // Round to nearest 1/precision
  const rounded = Math.round(decimal * precision) / precision;

  return new Fraction(rounded);
}

/**
 * Convert decimal to fraction with specified precision
 * @param {number} decimal
 * @param {number} precision - Denominator (16, 32, or 64)
 * @returns {Fraction}
 */
export function decimalToFraction(decimal, precision = 16) {
  const frac = new Fraction(decimal);

  // Round to nearest precision
  const rounded = Math.round(decimal * precision) / precision;
  return new Fraction(rounded);
}

/**
 * Simplify a fraction to lowest terms
 * @param {Fraction} fraction
 * @returns {Fraction}
 */
export function simplify(fraction) {
  // Fraction.js automatically simplifies, but we expose this for clarity
  return new Fraction(fraction);
}

/**
 * Add two fractions
 * @param {Fraction} a
 * @param {Fraction} b
 * @returns {Fraction}
 */
export function add(a, b) {
  return a.add(b);
}

/**
 * Subtract two fractions
 * @param {Fraction} a
 * @param {Fraction} b
 * @returns {Fraction}
 */
export function subtract(a, b) {
  return a.sub(b);
}

/**
 * Multiply two fractions
 * @param {Fraction} a
 * @param {Fraction} b
 * @returns {Fraction}
 */
export function multiply(a, b) {
  return a.mul(b);
}

/**
 * Divide two fractions
 * @param {Fraction} a
 * @param {Fraction} b
 * @returns {Fraction}
 */
export function divide(a, b) {
  if (b.valueOf() === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a.div(b);
}

/**
 * Convert fraction to decimal
 * @param {Fraction} fraction
 * @param {number} decimals - Number of decimal places
 * @returns {number}
 */
export function toDecimal(fraction, decimals = 4) {
  return parseFloat(fraction.valueOf().toFixed(decimals));
}
