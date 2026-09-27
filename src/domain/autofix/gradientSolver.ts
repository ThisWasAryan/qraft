import type { QRGradient } from '../types';
import { getWorstCaseContrast } from '../../utils/color';
import { solveSolidContrast } from './solidSolver';
import { findWorstContrastRegion, findNearestStopIndex } from './gradientSampler';

/** Maximum re-check rounds after each stop adjustment. */
const MAX_RECHECK_ROUNDS = 3;

export interface GradientSolverResult {
  adjustedGradient: QRGradient;
  adjustedSolidColor: string;
  achievedContrast: number;
}

/**
 * Fix gradient contrast by adjusting color stops.
 *
 * Strategy:
 * 1. Find worst-contrast region via canvas-coordinate sampling
 * 2. Identify the stop nearest to the worst point
 * 3. Apply solidSolver to that stop's color against the opposing color
 * 4. Re-check: re-sample for new worst region. If still failing, fix that stop too.
 * 5. Repeat up to MAX_RECHECK_ROUNDS times (determinism bound).
 *
 * Accept/reject uses the REAL getWorstCaseContrast from utils/color.ts,
 * not the canvas heuristic.
 *
 * Preserves gradient type, rotation, stop offsets — only stop colors change.
 */
export function fixGradientContrast(
  fgColor: string,
  fgGradient: QRGradient | undefined,
  bgColor: string,
  bgGradient: QRGradient | undefined,
  targetRatio: number,
): GradientSolverResult | null {
  // If fg has no gradient, this is a solid case — use solidSolver directly
  if (!fgGradient || fgGradient.colorStops.length === 0) {
    const bgForSolid = bgColor; // For solid fg, solve against bg solid color
    const result = solveSolidContrast(fgColor, bgForSolid, targetRatio);
    if (!result) return null;
    return {
      adjustedGradient: undefined as unknown as QRGradient,
      adjustedSolidColor: result.hex,
      achievedContrast: result.achievedContrast,
    };
  }

  // Work with a mutable copy of the gradient stops
  const adjustedStops = fgGradient.colorStops.map((s) => ({ ...s }));
  const fixedStopIndices = new Set<number>();

  for (let round = 0; round < MAX_RECHECK_ROUNDS; round++) {
    const currentGradient: QRGradient = {
      ...fgGradient,
      colorStops: adjustedStops.map((s) => ({ ...s })),
    };

    // Check via the REAL production function
    const currentContrast = getWorstCaseContrast(
      fgColor,
      currentGradient,
      bgColor,
      bgGradient,
    );

    if (currentContrast >= targetRatio - 0.1 || currentContrast === -1) {
      const solidResult = solveSolidContrast(fgColor, bgColor, targetRatio);
      return {
        adjustedGradient: currentGradient,
        adjustedSolidColor: solidResult ? solidResult.hex : fgColor,
        achievedContrast: currentContrast,
      };
    }

    // Canvas-coordinate sampling to find which region is worst
    const worstRegion = findWorstContrastRegion(
      fgColor,
      currentGradient,
      bgColor,
      bgGradient,
    );

    if (worstRegion.length === 0) break;

    const worstPoint = worstRegion[0];

    // Find nearest stop to worst point
    const nearestIdx = findNearestStopIndex(currentGradient, worstPoint.x, worstPoint.y);

    // Determine the opposing color at the worst point
    // If bg has a gradient, sample it at the worst point; otherwise use solid bg
    const opposingColor = worstPoint.bgColor;

    // Solve for this stop's color
    const stopResult = solveSolidContrast(
      adjustedStops[nearestIdx].color,
      opposingColor,
      targetRatio,
    );

    if (stopResult) {
      adjustedStops[nearestIdx] = { ...adjustedStops[nearestIdx], color: stopResult.hex };
      fixedStopIndices.add(nearestIdx);
    } else {
      // This stop is infeasible — try the other endpoint if not already tried
      const otherIdx = nearestIdx === 0
        ? adjustedStops.length - 1
        : nearestIdx === adjustedStops.length - 1
          ? 0
          : nearestIdx; // middle stop, no obvious "other"

      if (otherIdx !== nearestIdx && !fixedStopIndices.has(otherIdx)) {
        const otherResult = solveSolidContrast(
          adjustedStops[otherIdx].color,
          opposingColor,
          targetRatio,
        );
        if (otherResult) {
          adjustedStops[otherIdx] = { ...adjustedStops[otherIdx], color: otherResult.hex };
          fixedStopIndices.add(otherIdx);
        }
      }
    }
  }

  // Final check with the real function
  const finalGradient: QRGradient = {
    ...fgGradient,
    colorStops: adjustedStops.map((s) => ({ ...s })),
  };
  const finalContrast = getWorstCaseContrast(fgColor, finalGradient, bgColor, bgGradient);

  if (finalContrast >= targetRatio - 0.1 || finalContrast === -1) {
    const solidResult = solveSolidContrast(fgColor, bgColor, targetRatio);
    return {
      adjustedGradient: finalGradient,
      adjustedSolidColor: solidResult ? solidResult.hex : fgColor,
      achievedContrast: finalContrast,
    };
  }

  // If still failing after MAX_RECHECK_ROUNDS, try fixing ALL stops
  for (let i = 0; i < adjustedStops.length; i++) {
    if (fixedStopIndices.has(i)) continue;
    const fallbackResult = solveSolidContrast(adjustedStops[i].color, bgColor, targetRatio);
    if (fallbackResult) {
      adjustedStops[i] = { ...adjustedStops[i], color: fallbackResult.hex };
    }
  }

  const lastResortGradient: QRGradient = {
    ...fgGradient,
    colorStops: adjustedStops.map((s) => ({ ...s })),
  };
  const lastResortContrast = getWorstCaseContrast(fgColor, lastResortGradient, bgColor, bgGradient);

  if (lastResortContrast >= targetRatio - 0.1 || lastResortContrast === -1) {
    const solidResult = solveSolidContrast(fgColor, bgColor, targetRatio);
    return {
      adjustedGradient: lastResortGradient,
      adjustedSolidColor: solidResult ? solidResult.hex : fgColor,
      achievedContrast: lastResortContrast,
    };
  }

  return null;
}
