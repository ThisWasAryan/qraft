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
  background: 0.5,
  pattern: 2.0,
  eyeFrame: 2.0,
  eyeCenter: 1.5,
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

  // Asymmetric penalty: if we lose chroma (turn grey), penalize heavily
  // If we gain chroma (which rarely happens in gamut clamp but is possible), normal cost
  const chromaPenalty = dC < 0 ? 5.0 : 1.0;

  let baseCost = dL * dL + (dC * dC * chromaPenalty) + (chromaWeight * dH * dH);

  // DEATH PENALTY: If the original color had noticeable saturation (C >= 0.02)
  // but the adjusted color is essentially washed out to grayscale/white/black (C < 0.01),
  // apply a massive flat penalty. This prevents the solver from taking the "easy way out"
  // of just blowing colors out to #ffffff or #000000 when they are very light/dark.
  if (original.C >= 0.02 && adjusted.C < 0.01) {
    baseCost += 2.0;
  }

  return baseCost;
}
