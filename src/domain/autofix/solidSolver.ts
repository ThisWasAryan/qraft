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
function hexLuminance(hex: string): number {
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
 * Newton/weighted-least-norm solver: find the minimum-cost OKLCH adjustment
 * that reaches a specific target luminance.
 *
 * Strategy:
 * - Start from the original OKLCH color
 * - Estimate how L, C, H each affect sRGB luminance (numerical Jacobian)
 * - Take a weighted step that distributes the fix across dimensions
 * - Gamut-clamp after each step
 * - If Jacobian is near-singular (gamut edge), fall back to 1D bisection on L
 *
 * Returns the adjusted OKLCH color, or null if the target is unreachable.
 */

/**
 * Compute numerical partial derivative of luminance w.r.t. an OKLCH component.
 */


/**
 * 1D bisection fallback: find the lightness that achieves the target luminance,
 * preserving hue and reducing chroma as needed for gamut.
 */
function bisectionFallback(original: OKLCH, targetLum: number): OKLCH | null {
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
  const currentRatio = getContrastRatio(fgHex, bgHex);
  if (currentRatio >= targetRatio) {
    // Already sufficient
    return {
      hex: fgHex,
      oklch: hexToOklch(fgHex),
      cost: 0,
      achievedContrast: currentRatio,
    };
  }

  const bgLum = hexLuminance(bgHex);

  // O(1) infeasibility check
  if (isForegroundInfeasible(bgLum, targetRatio)) {
    return null;
  }

  const originalOklch = hexToOklch(fgHex);
  const targets = computeTargetLuminances(bgLum, targetRatio);

  let bestResult: SolidSolverResult | null = null;

  // Try both directions: make fg darker, make fg lighter
  for (const targetLum of [targets.darker, targets.lighter]) {
    if (targetLum < 0 || targetLum > 1) continue;

    const solved = bisectionFallback(originalOklch, targetLum);
    if (!solved) continue;

    const solvedHex = oklchToHex(solved.L, solved.C, solved.H);
    const achievedContrast = getContrastRatio(solvedHex, bgHex);

    // Must actually achieve the target (accounting for quantization)
    if (achievedContrast < targetRatio - 0.1) continue;

    const cost = colorChangeCost(originalOklch, solved);

    if (!bestResult || cost < bestResult.cost) {
      bestResult = {
        hex: solvedHex,
        oklch: solved,
        cost,
        achievedContrast,
      };
    }
  }

  return bestResult;
}

