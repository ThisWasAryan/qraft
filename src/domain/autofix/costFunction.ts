import type { OKLCH } from './colorConversion';

/**
 * Default cost weights for each QR component.
 * Higher weight = more reluctant to change that component.
 */
export interface ComponentCostWeights {
  background: number;
  pattern: number;
  eyeFrame: number;
  eyeCenter: number;
}

export const DEFAULT_COST_WEIGHTS: ComponentCostWeights = {
  background: 2.0,
  pattern: 1.0,
  eyeFrame: 1.0,
  eyeCenter: 0.8,
};

/**
 * Compute the circular hue difference in degrees, range [0, 180].
 */
function circularHueDiff(h1: number, h2: number): number {
  let d = Math.abs(h1 - h2) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

/**
 * Perceptual cost of changing one color in OKLCH space.
 *
 * Cost = ΔL² + ΔC² + chromaWeight · ΔH²
 *
 * The chroma weighting on hue means:
 * - Low-chroma (gray) colors accept hue shifts cheaply (ΔH doesn't matter for grays)
 * - High-chroma (saturated) colors penalize hue shifts heavily
 *
 * ΔH is in radians-equivalent for scale consistency with L and C.
 */
export function colorChangeCost(original: OKLCH, adjusted: OKLCH): number {
  const dL = adjusted.L - original.L;
  const dC = adjusted.C - original.C;

  // Circular hue difference in degrees, converted to a 0-1 scale for consistency
  const dHDeg = circularHueDiff(original.H, adjusted.H);
  const dH = dHDeg / 180; // normalize to [0, 1]

  // Chroma weight: average of original and adjusted chroma, scaled
  // When chroma is ~0 (gray), hue cost vanishes naturally
  const chromaWeight = (original.C + adjusted.C) / 2;

  return dL * dL + dC * dC + chromaWeight * dH * dH;
}
