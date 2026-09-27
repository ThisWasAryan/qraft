import { hexToRgb, getRelativeLuminance, getContrastRatio } from '../../utils/color';
import { hexToOklch, oklchToHex, gamutClamp } from './colorConversion';
import { colorChangeCost } from './costFunction';
import type { OKLCH } from './colorConversion';

/**
 * O(1) infeasibility check: can ANY sRGB color achieve the target contrast
 * against the given background luminance?
 *
 * Contrast is maximized at the luminance extremes (Y=0 black, Y=1 white).
 * If neither extreme reaches the target, no in-gamut color at any hue/chroma can.
 */
export function isForegroundInfeasible(bgLuminance: number, targetRatio: number): boolean {
  // Contrast of pure black (Y=0) against bg
  const contrastWithBlack = (bgLuminance + 0.05) / (0 + 0.05);
  // Contrast of pure white (Y=1) against bg
  const contrastWithWhite = (1 + 0.05) / (bgLuminance + 0.05);
  const maxContrast = Math.max(contrastWithBlack, contrastWithWhite);
  return maxContrast < targetRatio;
}

/**
 * Compute the target luminance for a foreground color to achieve exactly
 * `targetRatio` contrast against a background with luminance `bgLum`.
 * Returns both the "darker" and "lighter" targets.
 */
function computeTargetLuminances(bgLum: number, targetRatio: number): { darker: number; lighter: number } {
  // Darker foreground: bg is lighter → (bgLum+0.05)/(Y'+0.05) = targetRatio
  const darker = (bgLum + 0.05) / targetRatio - 0.05;
  // Lighter foreground: fg is lighter → (Y'+0.05)/(bgLum+0.05) = targetRatio
  const lighter = targetRatio * (bgLum + 0.05) - 0.05;
  return { darker, lighter };
}

/**
 * Get the relative luminance of a hex color.
 */
/**
 * Get the relative luminance of a hex color.
 */
export function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return getRelativeLuminance(r, g, b);
}

/**
 * Get the WCAG relative luminance from an OKLCH color (via round-trip to sRGB).
 */
function oklchLuminance(lch: OKLCH): number {
  const hex = oklchToHex(lch.L, lch.C, lch.H);
  return hexLuminance(hex);
}

/**
 * 1D bisection fallback: find the lightness that achieves the target luminance,
 * preserving hue and reducing chroma as needed for gamut.
 */
export function bisectionFallback(original: OKLCH, targetLum: number): OKLCH | null {
  let lo = 0;
  let hi = 1;

  // Determine direction: if target < current, search darker (lo side)
  for (let i = 0; i < 24; i++) {
    const midL = (lo + hi) / 2;
    const clamped = gamutClamp(midL, original.C, original.H);
    const midLum = oklchLuminance(clamped);

    if (midLum > targetLum) {
      hi = midL;
    } else {
      lo = midL;
    }
  }

  const finalL = (lo + hi) / 2;
  const result = gamutClamp(finalL, original.C, original.H);

  const finalLum = oklchLuminance(result);
  if (Math.abs(finalLum - targetLum) < 0.02) {
    return result;
  }

  return null;
}

export interface SolidSolverResult {
  hex: string;
  oklch: OKLCH;
  cost: number;
  achievedContrast: number;
}

export interface SymmetricSolverResult {
  hex1: string;
  oklch1: OKLCH;
  hex2: string;
  oklch2: OKLCH;
  achievedContrast: number;
}

/**
 * Find all valid color adjustments to achieve at least `targetRatio`
 * contrast against `bgHex` (both darker and lighter, if possible).
 */
export function solveSolidContrastCandidates(
  fgHex: string,
  bgHex: string,
  targetRatio: number,
): SolidSolverResult[] {
  const currentRatio = getContrastRatio(fgHex, bgHex);
  if (currentRatio >= targetRatio) {
    return [{
      hex: fgHex,
      oklch: hexToOklch(fgHex),
      cost: 0,
      achievedContrast: currentRatio,
    }];
  }

  const bgLum = hexLuminance(bgHex);
  if (isForegroundInfeasible(bgLum, targetRatio)) {
    return [];
  }

  const originalOklch = hexToOklch(fgHex);
  const targets = computeTargetLuminances(bgLum, targetRatio);
  const results: SolidSolverResult[] = [];

  for (const targetLum of [targets.darker, targets.lighter]) {
    if (targetLum < 0 || targetLum > 1) continue;

    const solved = bisectionFallback(originalOklch, targetLum);
    if (!solved) continue;

    const solvedHex = oklchToHex(solved.L, solved.C, solved.H);
    const achievedContrast = getContrastRatio(solvedHex, bgHex);

    if (achievedContrast < targetRatio - 0.1) continue;

    const cost = colorChangeCost(originalOklch, solved);
    results.push({
      hex: solvedHex,
      oklch: solved,
      cost,
      achievedContrast,
    });
  }

  return results;
}

/**
 * Find the minimum-cost color adjustment to achieve at least `targetRatio`
 * contrast against `bgHex`.
 *
 * Returns null if provably infeasible (O(1) check).
 */
export function solveSolidContrast(
  fgHex: string,
  bgHex: string,
  targetRatio: number,
): SolidSolverResult | null {
  const candidates = solveSolidContrastCandidates(fgHex, bgHex, targetRatio);
  if (candidates.length === 0) return null;

  let bestResult = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].cost < bestResult.cost) {
      bestResult = candidates[i];
    }
  }
  return bestResult;
}

/**
 * Symmetrically adjust both colors away from their geometric mean luminance.
 * This preserves chroma for both by preventing either from hitting extreme lightness values.
 */
export function solveSymmetricContrast(
  hex1: string,
  hex2: string,
  targetRatio: number,
): SymmetricSolverResult | null {
  const currentRatio = getContrastRatio(hex1, hex2);
  if (currentRatio >= targetRatio) {
    return {
      hex1, oklch1: hexToOklch(hex1),
      hex2, oklch2: hexToOklch(hex2),
      achievedContrast: currentRatio,
    };
  }

  const y1 = hexLuminance(hex1);
  const y2 = hexLuminance(hex2);

  const M = Math.sqrt((y1 + 0.05) * (y2 + 0.05));
  const is1Lighter = y1 > y2;

  let yLighterTarget = M * Math.sqrt(targetRatio) - 0.05;
  let yDarkerTarget = M / Math.sqrt(targetRatio) - 0.05;

  if (yLighterTarget > 1) {
    yLighterTarget = 1;
    yDarkerTarget = (1 + 0.05) / targetRatio - 0.05;
  } else if (yLighterTarget < 0) {
    yLighterTarget = 0;
    yDarkerTarget = 0;
  }

  if (yDarkerTarget < 0) {
    yDarkerTarget = 0;
    yLighterTarget = targetRatio * (0 + 0.05) - 0.05;
  } else if (yDarkerTarget > 1) {
    yDarkerTarget = 1;
    yLighterTarget = 1;
  }

  if (yLighterTarget > 1 || yDarkerTarget < 0) return null;

  const y1Target = is1Lighter ? yLighterTarget : yDarkerTarget;
  const y2Target = is1Lighter ? yDarkerTarget : yLighterTarget;

  const oklch1 = hexToOklch(hex1);
  const solved1 = bisectionFallback(oklch1, y1Target);
  
  const oklch2 = hexToOklch(hex2);
  const solved2 = bisectionFallback(oklch2, y2Target);

  if (!solved1 || !solved2) return null;

  const outHex1 = oklchToHex(solved1.L, solved1.C, solved1.H);
  const outHex2 = oklchToHex(solved2.L, solved2.C, solved2.H);

  const achievedContrast = getContrastRatio(outHex1, outHex2);
  if (achievedContrast < targetRatio - 0.1) return null;

  return {
    hex1: outHex1,
    oklch1: solved1,
    hex2: outHex2,
    oklch2: solved2,
    achievedContrast
  };
}

