import { describe, expect, it } from 'vitest';

import {
  calculateArrowWeightGrains,
  calculateFoc,
  calculateGpp,
  calculateKineticEnergy,
  calculateMomentum,
  estimateDrawLength,
  suggestSpine,
} from './archery-calculator';

describe('calculateFoc', () => {
  it('computes FOC for a typical setup', () => {
    // ((16.5 - 14.5) / 29) * 100 = 6.9
    expect(calculateFoc(29, 16.5)).toBe(6.9);
  });

  it('returns null for invalid length', () => {
    expect(calculateFoc(0, 15)).toBeNull();
  });
});

describe('calculateArrowWeightGrains', () => {
  it('sums shaft GPI and components', () => {
    expect(
      calculateArrowWeightGrains({
        gpi: 8.5,
        shaftLengthIn: 28,
        pointGrains: 100,
        insertGrains: 14,
        nockGrains: 8,
        fletchingGrains: 18,
      }),
    ).toBe(378);
  });
});

describe('calculateKineticEnergy / momentum', () => {
  it('computes KE and momentum', () => {
    expect(calculateKineticEnergy(400, 280)).toBe(69.65);
    expect(calculateMomentum(400, 280)).toBe(0.497);
  });
});

describe('estimateDrawLength', () => {
  it('divides wingspan by 2.5', () => {
    expect(estimateDrawLength(70)).toBe(28);
  });
});

describe('calculateGpp', () => {
  it('divides arrow weight by draw weight', () => {
    expect(calculateGpp(400, 50)).toBe(8);
  });
});

describe('suggestSpine', () => {
  it('suggests a spine band near 40 lb / 28" / 100 gr', () => {
    const result = suggestSpine({ drawWeightLbs: 40, arrowLengthIn: 28, pointWeightGrains: 100 });
    expect(result).toEqual({ spineLow: 600, spineHigh: 700, effectiveDrawWeight: 40 });
  });

  it('stiffens suggestion for longer arrows', () => {
    const result = suggestSpine({ drawWeightLbs: 40, arrowLengthIn: 30, pointWeightGrains: 100 });
    expect(result?.effectiveDrawWeight).toBe(50);
    expect(result?.spineLow).toBe(400);
  });
});
