import { describe, expect, it } from 'vitest';

import {
  clampIntInRange,
  clampNonNegative,
  clampPositive,
  isNonNegativeDecimalInput,
  isNonNegativeIntegerInput,
  normalizePositiveDistance,
  parseNonNegativeFloat,
  parseNonNegativeInt,
  parsePositiveFloat,
  parsePositiveInt,
} from './non-negative-number';

describe('isNonNegativeIntegerInput', () => {
  it('allows empty and digits', () => {
    expect(isNonNegativeIntegerInput('')).toBe(true);
    expect(isNonNegativeIntegerInput('0')).toBe(true);
    expect(isNonNegativeIntegerInput('42')).toBe(true);
  });

  it('rejects minus and decimals', () => {
    expect(isNonNegativeIntegerInput('-')).toBe(false);
    expect(isNonNegativeIntegerInput('-1')).toBe(false);
    expect(isNonNegativeIntegerInput('1.5')).toBe(false);
    expect(isNonNegativeIntegerInput('abc')).toBe(false);
  });
});

describe('isNonNegativeDecimalInput', () => {
  it('allows empty, integers, and limited decimals', () => {
    expect(isNonNegativeDecimalInput('')).toBe(true);
    expect(isNonNegativeDecimalInput('18')).toBe(true);
    expect(isNonNegativeDecimalInput('18.5')).toBe(true);
    expect(isNonNegativeDecimalInput('18.50')).toBe(true);
    expect(isNonNegativeDecimalInput('.5')).toBe(true);
  });

  it('rejects minus and excess decimals', () => {
    expect(isNonNegativeDecimalInput('-')).toBe(false);
    expect(isNonNegativeDecimalInput('-1')).toBe(false);
    expect(isNonNegativeDecimalInput('1.234')).toBe(false);
  });
});

describe('parse helpers', () => {
  it('parseNonNegativeInt', () => {
    expect(parseNonNegativeInt('')).toBeUndefined();
    expect(parseNonNegativeInt('12')).toBe(12);
    expect(parseNonNegativeInt('0')).toBe(0);
    expect(parseNonNegativeInt('-3')).toBeUndefined();
    expect(parseNonNegativeInt('x')).toBeUndefined();
  });

  it('parsePositiveInt', () => {
    expect(parsePositiveInt('0')).toBeUndefined();
    expect(parsePositiveInt('12')).toBe(12);
  });

  it('parseNonNegativeFloat', () => {
    expect(parseNonNegativeFloat('18.5')).toBe(18.5);
    expect(parseNonNegativeFloat('-0.1')).toBeUndefined();
  });

  it('parsePositiveFloat', () => {
    expect(parsePositiveFloat('0')).toBeUndefined();
    expect(parsePositiveFloat('40')).toBe(40);
  });

  it('clampNonNegative', () => {
    expect(clampNonNegative(-5)).toBe(0);
    expect(clampNonNegative(3)).toBe(3);
    expect(clampNonNegative(undefined)).toBeUndefined();
  });

  it('clampPositive', () => {
    expect(clampPositive(0)).toBeUndefined();
    expect(clampPositive(-1)).toBeUndefined();
    expect(clampPositive(2.5)).toBe(2.5);
  });

  it('normalizePositiveDistance', () => {
    expect(normalizePositiveDistance('')).toBeUndefined();
    expect(normalizePositiveDistance('0')).toBeUndefined();
    expect(normalizePositiveDistance('0.0')).toBeUndefined();
    expect(normalizePositiveDistance('18.5')).toBe('18.5');
    expect(normalizePositiveDistance('.5')).toBe('0.5');
    expect(normalizePositiveDistance('-10')).toBeUndefined();
  });

  it('clampIntInRange', () => {
    expect(clampIntInRange(-1, 1, 100, 18)).toBe(1);
    expect(clampIntInRange(50, 1, 100, 18)).toBe(50);
    expect(clampIntInRange(200, 1, 100, 18)).toBe(100);
    expect(clampIntInRange('', 1, 100, 18)).toBe(18);
  });
});
