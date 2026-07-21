/**
 * Helpers for quantity-style numeric fields (shots, distance, score, draw weight, etc.).
 * Negative values are never meaningful; some fields also reject zero.
 */

/** Empty or non-negative integer while typing (no leading minus). */
export function isNonNegativeIntegerInput(value: string): boolean {
  return value === '' || /^\d+$/.test(value);
}

/**
 * Empty or non-negative decimal while typing.
 * @param maxDecimals - max digits after the decimal point (default 2)
 */
export function isNonNegativeDecimalInput(value: string, maxDecimals = 2): boolean {
  if (value === '') return true;
  if (maxDecimals <= 0) return isNonNegativeIntegerInput(value);
  const pattern = new RegExp(`^\\d*(\\.\\d{0,${maxDecimals}})?$`);
  return pattern.test(value);
}

/** Parse optional non-negative integer; invalid / negative → undefined. */
export function parseNonNegativeInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

/** Parse optional positive integer (> 0); empty / invalid / ≤0 → undefined. */
export function parsePositiveInt(value: string): number | undefined {
  const n = parseNonNegativeInt(value);
  return n !== undefined && n > 0 ? n : undefined;
}

/** Parse optional non-negative float; invalid / negative → undefined. */
export function parseNonNegativeFloat(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

/** Parse optional positive float (> 0); empty / invalid / ≤0 → undefined. */
export function parsePositiveFloat(value: string): number | undefined {
  const n = parseNonNegativeFloat(value);
  return n !== undefined && n > 0 ? n : undefined;
}

/** Clamp a number to ≥ 0; non-finite → undefined. */
export function clampNonNegative(value: number | undefined | null): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, value);
}

/** Keep value only if it is finite and > 0; otherwise undefined. */
export function clampPositive(value: number | undefined | null): number | undefined {
  if (value == null || !Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

/**
 * Normalize a distance string: empty → undefined; reject ≤ 0;
 * returns a canonical positive numeric string.
 */
export function normalizePositiveDistance(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return String(n);
}

/** @deprecated Use normalizePositiveDistance */
export const normalizeNonNegativeDistance = normalizePositiveDistance;

/** Clamp integer to [min, max] with fallback when empty/invalid. */
export function clampIntInRange(
  value: string | number,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
