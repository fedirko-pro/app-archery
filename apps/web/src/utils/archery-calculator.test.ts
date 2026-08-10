import { describe, expect, it } from 'vitest';

import {
  calculateArrowWeightGrains,
  calculateFoc,
  calculateGpp,
  calculateKineticEnergy,
  calculateMomentum,
  estimateDrawLength,
  suggestSpine,
  suggestWoodSpine,
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

describe('suggestWoodSpine', () => {
  it('matches the table: 40 lb / 26" / 125 gr → 25/30', () => {
    const result = suggestWoodSpine({
      drawWeightLbs: 40,
      arrowLengthIn: 26,
      pointWeightGrains: 125,
    });
    expect(result).toEqual({ spineLow: 25, spineHigh: 30 });
  });

  it('matches the table: 67 lb / 30" / 125 gr → 70/75', () => {
    const result = suggestWoodSpine({
      drawWeightLbs: 67,
      arrowLengthIn: 30,
      pointWeightGrains: 125,
    });
    expect(result).toEqual({ spineLow: 70, spineHigh: 75 });
  });

  it('clamps low end like the table (<10): 22 lb / 25"', () => {
    const result = suggestWoodSpine({
      drawWeightLbs: 22,
      arrowLengthIn: 25,
      pointWeightGrains: 125,
    });
    expect(result).toEqual({ spineLow: 0, spineHigh: 5 });
  });

  it('defaults to a 125 gr point', () => {
    const withDefault = suggestWoodSpine({ drawWeightLbs: 45, arrowLengthIn: 28 });
    const with125 = suggestWoodSpine({
      drawWeightLbs: 45,
      arrowLengthIn: 28,
      pointWeightGrains: 125,
    });
    expect(withDefault).toEqual(with125);
    expect(withDefault).toEqual({ spineLow: 40, spineHigh: 45 });
  });

  it('deducts 5 lb per 25 gr below 125 gr point', () => {
    const result = suggestWoodSpine({
      drawWeightLbs: 45,
      arrowLengthIn: 28,
      pointWeightGrains: 100,
    });
    expect(result).toEqual({ spineLow: 35, spineHigh: 40 });
  });

  it('deducts 10 lb for a 70/75 gr point', () => {
    const at70 = suggestWoodSpine({ drawWeightLbs: 45, arrowLengthIn: 28, pointWeightGrains: 70 });
    const at75 = suggestWoodSpine({ drawWeightLbs: 45, arrowLengthIn: 28, pointWeightGrains: 75 });
    expect(at70).toEqual({ spineLow: 30, spineHigh: 35 });
    expect(at75).toEqual(at70);
  });

  it('adds 5 lb for a 150 gr point and does not adjust beyond 150 gr', () => {
    const at150 = suggestWoodSpine({
      drawWeightLbs: 45,
      arrowLengthIn: 28,
      pointWeightGrains: 150,
    });
    const at200 = suggestWoodSpine({
      drawWeightLbs: 45,
      arrowLengthIn: 28,
      pointWeightGrains: 200,
    });
    expect(at150).toEqual({ spineLow: 45, spineHigh: 50 });
    expect(at200).toEqual(at150);
  });

  it('returns null for non-positive inputs', () => {
    expect(suggestWoodSpine({ drawWeightLbs: 0, arrowLengthIn: 28 })).toBeNull();
    expect(suggestWoodSpine({ drawWeightLbs: 40, arrowLengthIn: 0 })).toBeNull();
  });
});
