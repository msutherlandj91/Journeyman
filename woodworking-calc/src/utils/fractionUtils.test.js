import { describe, it, expect } from 'vitest';
import Fraction from 'fraction.js';
import {
  parseFraction,
  toMixedNumber,
  formatMixedNumber,
  isStandardDenominator,
  roundToStandardFraction,
  decimalToFraction,
  simplify,
  add,
  subtract,
  multiply,
  divide,
  toDecimal
} from './fractionUtils';

describe('parseFraction', () => {
  it('should parse string format "5 3/8"', () => {
    const result = parseFraction('5 3/8');
    expect(result.valueOf()).toBe(5.375);
  });

  it('should parse string format "5-3/8"', () => {
    const result = parseFraction('5-3/8');
    expect(result.valueOf()).toBe(5.375);
  });

  it('should parse decimal string "5.375"', () => {
    const result = parseFraction('5.375');
    expect(result.valueOf()).toBe(5.375);
  });

  it('should parse whole number string "5"', () => {
    const result = parseFraction('5');
    expect(result.valueOf()).toBe(5);
  });

  it('should parse numeric input', () => {
    const result = parseFraction(5.375);
    expect(result.valueOf()).toBe(5.375);
  });

  it('should parse separate parts (whole, numerator, denominator)', () => {
    const result = parseFraction(null, 5, 3, 8);
    expect(result.valueOf()).toBe(5.375);
  });

  it('should handle zero numerator in separate parts', () => {
    const result = parseFraction(null, 5, 0, 8);
    expect(result.valueOf()).toBe(5);
  });

  it('should handle negative fractions', () => {
    // Note: parseFraction replaces '-' with ' ' for mixed number format
    // Use direct numeric input for negatives
    const result = parseFraction(-0.375);
    expect(result.valueOf()).toBe(-0.375);
  });

  it('should throw error for zero denominator', () => {
    // Using nullish coalescing (??) allows 0 to pass through for validation
    expect(() => parseFraction(null, 5, 3, 0)).toThrow('Denominator cannot be zero');
  });

  it('should handle improper fractions', () => {
    const result = parseFraction('9/8');
    expect(result.valueOf()).toBe(1.125);
  });
});

describe('toMixedNumber', () => {
  it('should convert proper fraction to mixed number', () => {
    const frac = new Fraction(5.375);
    const result = toMixedNumber(frac);
    expect(result.whole).toBe(5);
    expect(result.numerator).toBe(3);
    expect(result.denominator).toBe(8);
  });

  it('should handle whole numbers', () => {
    const frac = new Fraction(5);
    const result = toMixedNumber(frac);
    expect(result.whole).toBe(5);
    expect(result.numerator).toBe(0);
    expect(result.denominator).toBe(1);
  });

  it('should handle improper fractions', () => {
    const frac = new Fraction(9, 8);
    const result = toMixedNumber(frac);
    expect(result.whole).toBe(1);
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(8);
  });

  it('should handle negative fractions', () => {
    const frac = new Fraction(-5.375);
    const result = toMixedNumber(frac);
    expect(result.whole).toBe(-6);
    // Note: Fraction.js handles negatives by keeping the floor behavior
  });

  it('should convert BigInt values to Numbers', () => {
    const frac = new Fraction(3, 8);
    const result = toMixedNumber(frac);
    expect(typeof result.numerator).toBe('number');
    expect(typeof result.denominator).toBe('number');
  });
});

describe('formatMixedNumber', () => {
  it('should format mixed number with inch symbol', () => {
    const frac = new Fraction(5.375);
    const result = formatMixedNumber(frac, true);
    expect(result).toBe('5-3/8"');
  });

  it('should format mixed number without inch symbol', () => {
    const frac = new Fraction(5.375);
    const result = formatMixedNumber(frac, false);
    expect(result).toBe('5-3/8');
  });

  it('should format whole number', () => {
    const frac = new Fraction(5);
    const result = formatMixedNumber(frac, true);
    expect(result).toBe('5"');
  });

  it('should format fraction without whole part', () => {
    const frac = new Fraction(3, 8);
    const result = formatMixedNumber(frac, true);
    expect(result).toBe('3/8"');
  });

  it('should default to including inches', () => {
    const frac = new Fraction(5.375);
    const result = formatMixedNumber(frac);
    expect(result).toBe('5-3/8"');
  });
});

describe('isStandardDenominator', () => {
  it('should return true for powers of 2', () => {
    expect(isStandardDenominator(2)).toBe(true);
    expect(isStandardDenominator(4)).toBe(true);
    expect(isStandardDenominator(8)).toBe(true);
    expect(isStandardDenominator(16)).toBe(true);
    expect(isStandardDenominator(32)).toBe(true);
    expect(isStandardDenominator(64)).toBe(true);
  });

  it('should return false for non-standard denominators', () => {
    expect(isStandardDenominator(3)).toBe(false);
    expect(isStandardDenominator(5)).toBe(false);
    expect(isStandardDenominator(7)).toBe(false);
    expect(isStandardDenominator(10)).toBe(false);
    expect(isStandardDenominator(12)).toBe(false);
  });

  it('should return false for 1', () => {
    expect(isStandardDenominator(1)).toBe(false);
  });
});

describe('roundToStandardFraction', () => {
  it('should round to nearest 1/16', () => {
    const frac = new Fraction(5.3333); // Not cleanly divisible by 16
    const result = roundToStandardFraction(frac, 16);
    // 5.3333 * 16 = 85.33, rounds to 85, 85/16 = 5.3125
    expect(result.valueOf()).toBe(5.3125);
  });

  it('should round to nearest 1/32', () => {
    const frac = new Fraction(5.3333);
    const result = roundToStandardFraction(frac, 32);
    // 5.3333 * 32 = 170.66, rounds to 171, 171/32 = 5.34375
    expect(result.valueOf()).toBeCloseTo(5.34375, 5);
  });

  it('should default to precision 16', () => {
    const frac = new Fraction(5.3333);
    const result = roundToStandardFraction(frac);
    expect(result.valueOf()).toBe(5.3125);
  });

  it('should handle exact divisions', () => {
    const frac = new Fraction(5.375); // Exactly 5-3/8 = 86/16
    const result = roundToStandardFraction(frac, 16);
    expect(result.valueOf()).toBe(5.375);
  });
});

describe('decimalToFraction', () => {
  it('should convert decimal to fraction with default precision', () => {
    const result = decimalToFraction(5.375);
    expect(result.valueOf()).toBe(5.375);
  });

  it('should round to specified precision', () => {
    const result = decimalToFraction(5.3333, 16);
    expect(result.valueOf()).toBe(5.3125);
  });

  it('should handle precision 32', () => {
    const result = decimalToFraction(5.3333, 32);
    expect(result.valueOf()).toBeCloseTo(5.34375, 5);
  });

  it('should handle whole numbers', () => {
    const result = decimalToFraction(5, 16);
    expect(result.valueOf()).toBe(5);
  });
});

describe('simplify', () => {
  it('should simplify reducible fractions', () => {
    const frac = new Fraction(6, 8);
    const result = simplify(frac);
    expect(result.n).toBe(3n);
    expect(result.d).toBe(4n);
  });

  it('should handle already simplified fractions', () => {
    const frac = new Fraction(3, 8);
    const result = simplify(frac);
    expect(result.n).toBe(3n);
    expect(result.d).toBe(8n);
  });

  it('should handle whole numbers', () => {
    const frac = new Fraction(8, 4);
    const result = simplify(frac);
    expect(result.valueOf()).toBe(2);
  });
});

describe('add', () => {
  it('should add two fractions', () => {
    const a = new Fraction(1, 4);
    const b = new Fraction(1, 8);
    const result = add(a, b);
    expect(result.valueOf()).toBe(0.375); // 3/8
  });

  it('should add whole numbers', () => {
    const a = new Fraction(5);
    const b = new Fraction(3);
    const result = add(a, b);
    expect(result.valueOf()).toBe(8);
  });

  it('should add mixed fractions', () => {
    const a = new Fraction(5.375);
    const b = new Fraction(2.125);
    const result = add(a, b);
    expect(result.valueOf()).toBe(7.5);
  });

  it('should handle zero', () => {
    const a = new Fraction(5);
    const b = new Fraction(0);
    const result = add(a, b);
    expect(result.valueOf()).toBe(5);
  });
});

describe('subtract', () => {
  it('should subtract two fractions', () => {
    const a = new Fraction(3, 8);
    const b = new Fraction(1, 8);
    const result = subtract(a, b);
    expect(result.valueOf()).toBe(0.25); // 2/8 = 1/4
  });

  it('should subtract whole numbers', () => {
    const a = new Fraction(5);
    const b = new Fraction(3);
    const result = subtract(a, b);
    expect(result.valueOf()).toBe(2);
  });

  it('should handle negative results', () => {
    const a = new Fraction(1, 8);
    const b = new Fraction(3, 8);
    const result = subtract(a, b);
    expect(result.valueOf()).toBe(-0.25);
  });

  it('should handle zero', () => {
    const a = new Fraction(5);
    const b = new Fraction(0);
    const result = subtract(a, b);
    expect(result.valueOf()).toBe(5);
  });
});

describe('multiply', () => {
  it('should multiply two fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 4);
    const result = multiply(a, b);
    expect(result.valueOf()).toBe(0.125); // 1/8
  });

  it('should multiply whole numbers', () => {
    const a = new Fraction(5);
    const b = new Fraction(3);
    const result = multiply(a, b);
    expect(result.valueOf()).toBe(15);
  });

  it('should handle multiplication by zero', () => {
    const a = new Fraction(5);
    const b = new Fraction(0);
    const result = multiply(a, b);
    expect(result.valueOf()).toBe(0);
  });

  it('should multiply mixed fractions', () => {
    const a = new Fraction(2.5);
    const b = new Fraction(4);
    const result = multiply(a, b);
    expect(result.valueOf()).toBe(10);
  });
});

describe('divide', () => {
  it('should divide two fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 4);
    const result = divide(a, b);
    expect(result.valueOf()).toBe(2);
  });

  it('should divide whole numbers', () => {
    const a = new Fraction(10);
    const b = new Fraction(2);
    const result = divide(a, b);
    expect(result.valueOf()).toBe(5);
  });

  it('should throw error when dividing by zero', () => {
    const a = new Fraction(5);
    const b = new Fraction(0);
    expect(() => divide(a, b)).toThrow('Cannot divide by zero');
  });

  it('should handle division resulting in fraction', () => {
    const a = new Fraction(1);
    const b = new Fraction(8);
    const result = divide(a, b);
    expect(result.valueOf()).toBe(0.125);
  });
});

describe('toDecimal', () => {
  it('should convert fraction to decimal with default precision', () => {
    const frac = new Fraction(5, 8);
    const result = toDecimal(frac);
    expect(result).toBe(0.625);
  });

  it('should round to specified decimal places', () => {
    const frac = new Fraction(1, 3);
    const result = toDecimal(frac, 2);
    expect(result).toBe(0.33);
  });

  it('should handle whole numbers', () => {
    const frac = new Fraction(5);
    const result = toDecimal(frac, 2);
    expect(result).toBe(5);
  });

  it('should handle different decimal place specifications', () => {
    const frac = new Fraction(1, 3);
    expect(toDecimal(frac, 1)).toBe(0.3);
    expect(toDecimal(frac, 3)).toBe(0.333);
    expect(toDecimal(frac, 5)).toBe(0.33333);
  });
});
