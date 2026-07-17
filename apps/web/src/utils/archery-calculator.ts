/** Pure archery setup calculators (approximate guidance, not manufacturer charts). */

export function roundTo(n: number, digits = 2): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/**
 * Front of Center (%). Balance point measured from nock throat to balance point.
 * FOC% = ((balancePoint - arrowLength / 2) / arrowLength) * 100
 */
export function calculateFoc(arrowLengthIn: number, balancePointIn: number): number | null {
  if (arrowLengthIn <= 0 || balancePointIn <= 0) return null;
  return roundTo(((balancePointIn - arrowLengthIn / 2) / arrowLengthIn) * 100, 2);
}

export function calculateArrowWeightGrains(input: {
  gpi: number;
  shaftLengthIn: number;
  pointGrains?: number;
  insertGrains?: number;
  nockGrains?: number;
  fletchingGrains?: number;
}): number | null {
  const {
    gpi,
    shaftLengthIn,
    pointGrains = 0,
    insertGrains = 0,
    nockGrains = 0,
    fletchingGrains = 0,
  } = input;
  if (gpi < 0 || shaftLengthIn <= 0) return null;
  return roundTo(
    gpi * shaftLengthIn + pointGrains + insertGrains + nockGrains + fletchingGrains,
    1,
  );
}

/** Kinetic energy in ft·lbs from arrow weight (grains) and speed (fps). */
export function calculateKineticEnergy(arrowWeightGrains: number, speedFps: number): number | null {
  if (arrowWeightGrains <= 0 || speedFps <= 0) return null;
  return roundTo((arrowWeightGrains * speedFps * speedFps) / 450240, 2);
}

/** Momentum (slug·ft/s) from arrow weight (grains) and speed (fps). */
export function calculateMomentum(arrowWeightGrains: number, speedFps: number): number | null {
  if (arrowWeightGrains <= 0 || speedFps <= 0) return null;
  return roundTo((arrowWeightGrains * speedFps) / 225218, 3);
}

/** AMO-style draw length estimate: wingspan (inches) / 2.5 */
export function estimateDrawLength(wingspanIn: number): number | null {
  if (wingspanIn <= 0) return null;
  return roundTo(wingspanIn / 2.5, 2);
}

/** Grains per pound of draw weight. */
export function calculateGpp(arrowWeightGrains: number, drawWeightLbs: number): number | null {
  if (arrowWeightGrains <= 0 || drawWeightLbs <= 0) return null;
  return roundTo(arrowWeightGrains / drawWeightLbs, 2);
}

export type SpineSuggestion = {
  spineLow: number;
  spineHigh: number;
  effectiveDrawWeight: number;
};

/**
 * Very rough carbon spine band from draw weight, arrow length, and point weight.
 * Longer arrows / heavier points are treated as needing a stiffer (lower) spine.
 * Label as approximate guidance only.
 */
export function suggestSpine(input: {
  drawWeightLbs: number;
  arrowLengthIn: number;
  pointWeightGrains?: number;
}): SpineSuggestion | null {
  const { drawWeightLbs, arrowLengthIn, pointWeightGrains = 100 } = input;
  if (drawWeightLbs <= 0 || arrowLengthIn <= 0) return null;

  const lengthAdj = (arrowLengthIn - 28) * 5;
  const pointAdj = ((pointWeightGrains - 100) / 25) * 5;
  const effectiveDrawWeight = roundTo(drawWeightLbs + lengthAdj + pointAdj, 1);

  const bands: Array<{ maxDw: number; spineLow: number; spineHigh: number }> = [
    { maxDw: 25, spineLow: 900, spineHigh: 1000 },
    { maxDw: 30, spineLow: 800, spineHigh: 900 },
    { maxDw: 35, spineLow: 700, spineHigh: 800 },
    { maxDw: 40, spineLow: 600, spineHigh: 700 },
    { maxDw: 45, spineLow: 500, spineHigh: 600 },
    { maxDw: 50, spineLow: 400, spineHigh: 500 },
    { maxDw: 55, spineLow: 340, spineHigh: 400 },
    { maxDw: 60, spineLow: 300, spineHigh: 340 },
    { maxDw: 70, spineLow: 250, spineHigh: 300 },
    { maxDw: Infinity, spineLow: 200, spineHigh: 250 },
  ];

  const band = bands.find((b) => effectiveDrawWeight <= b.maxDw) ?? bands[bands.length - 1];
  return {
    spineLow: band.spineLow,
    spineHigh: band.spineHigh,
    effectiveDrawWeight,
  };
}
