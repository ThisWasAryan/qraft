import type { QRConfig, QRStyle, QRGradient } from '../types';
import { getContrastRatio, getWorstCaseContrast } from '../../utils/color';
import { solveSolidContrast, isForegroundInfeasible, solveSymmetricContrast, solveSolidContrastCandidates } from './solidSolver';
import { fixGradientContrast } from './gradientSolver';
import { hexToOklch } from './colorConversion';
import { colorChangeCost, DEFAULT_COST_WEIGHTS } from './costFunction';
import { validateFixResult } from './validator';
import type { ComponentCostWeights } from './costFunction';
import { hexToRgb, getRelativeLuminance } from '../../utils/color';

// ── Public Types ──────────────────────────────────────────────────────────

export interface AutoFixOptions {
  costWeights?: Partial<ComponentCostWeights>;
  eyeContrastTarget?: number;
  patternContrastTarget?: number;
  enablePatternEyeSeparation?: boolean;
}

export interface FixDiagnostic {
  component: string;
  relationship: string;
  before: string;
  after: string;
  contrastBefore?: number;
  contrastAfter?: number;
  visualChangeMagnitude?: number;
}

export type AutoFixResult =
  | { success: true; patch: Partial<QRStyle>; diagnostics: FixDiagnostic[] }
  | { success: false; reason: string; unfixableRelationships: string[] };

// ── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_PATTERN_TARGET = 4.6;
const DEFAULT_EYE_TARGET = 4.6;

// ── Helpers ───────────────────────────────────────────────────────────────

function resolveColor(explicit: string | undefined, fallback: string): string {
  return explicit || fallback;
}

function hexLum(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return getRelativeLuminance(r, g, b);
}

function computeDiagnostic(
  component: FixDiagnostic['component'],
  relationship: string,
  beforeHex: string,
  afterHex: string,
  bgHex: string,
): FixDiagnostic {
  const contrastBefore = getContrastRatio(beforeHex, bgHex);
  const contrastAfter = getContrastRatio(afterHex, bgHex);
  const beforeOklch = hexToOklch(beforeHex);
  const afterOklch = hexToOklch(afterHex);
  return {
    component,
    relationship,
    before: beforeHex,
    after: afterHex,
    contrastBefore,
    contrastAfter,
    visualChangeMagnitude: colorChangeCost(beforeOklch, afterOklch),
  };
}

interface Relationship {
  id: string;
  fgComponent: 'pattern' | 'eyeFrame' | 'eyeCenter';
  fgColor: string;
  fgGradient?: QRGradient;
  bgColor: string;
  bgGradient?: QRGradient;
  target: number;
}

function buildRelationships(style: QRStyle, patternTarget: number, eyeTarget: number): Relationship[] {
  const bg = style.backgroundOptions.color;
  const bgGradient = style.backgroundOptions.gradient;

  const patternColor = style.dotOptions.color;
  const patternGradient = style.dotOptions.gradient;

  const eyeFrameHasOwnStyle = style.cornerSquareOptions.color || style.cornerSquareOptions.gradient;
  const eyeFrameColor = resolveColor(style.cornerSquareOptions.color, patternColor);
  const eyeFrameGradient = eyeFrameHasOwnStyle ? style.cornerSquareOptions.gradient : patternGradient;

  const eyeCenterHasOwnStyle = style.cornerDotOptions.color || style.cornerDotOptions.gradient;
  const eyeCenterColor = resolveColor(style.cornerDotOptions.color, eyeFrameColor);
  const eyeCenterGradient = eyeCenterHasOwnStyle ? style.cornerDotOptions.gradient : eyeFrameGradient;

  return [
    {
      id: 'bg↔pattern',
      fgComponent: 'pattern',
      fgColor: patternColor,
      fgGradient: patternGradient,
      bgColor: bg,
      bgGradient,
      target: patternTarget,
    },
    {
      id: 'bg↔eyeFrame',
      fgComponent: 'eyeFrame',
      fgColor: eyeFrameColor,
      fgGradient: eyeFrameGradient,
      bgColor: bg,
      bgGradient,
      target: eyeTarget,
    },
    {
      id: 'bg↔eyeCenter',
      fgComponent: 'eyeCenter',
      fgColor: eyeCenterColor,
      fgGradient: eyeCenterGradient,
      bgColor: bg,
      bgGradient,
      target: eyeTarget,
    },
  ];
}

function getContrastForRelationship(rel: Relationship): number {
  if (rel.fgGradient || rel.bgGradient) {
    return getWorstCaseContrast(rel.fgColor, rel.fgGradient, rel.bgColor, rel.bgGradient);
  }
  return getContrastRatio(rel.fgColor, rel.bgColor);
}

// ── Main Function ─────────────────────────────────────────────────────────

/**
 * Pure function: analyze a QR config and produce the smallest perceptual
 * color change that satisfies all contrast requirements.
 *
 * Never touches the store directly. Returns a patch to apply as one undoable action.
 */
export function autoFixContrast(
  config: QRConfig,
  options?: AutoFixOptions,
): AutoFixResult {
  const patternTarget = options?.patternContrastTarget ?? DEFAULT_PATTERN_TARGET;
  const eyeTarget = options?.eyeContrastTarget ?? DEFAULT_EYE_TARGET;
  const bg = config.style.backgroundOptions.color;
  const weights = { ...DEFAULT_COST_WEIGHTS, ...options?.costWeights };

  // ── Transparent background: structured failure ──
  if (bg.toLowerCase() === 'transparent') {
    return {
      success: false,
      reason: 'Cannot auto-fix contrast with a transparent background. Please set a solid or gradient background color first, then retry.',
      unfixableRelationships: ['background↔pattern', 'background↔eyeFrame', 'background↔eyeCenter'],
    };
  }

  type Strategy = 'fg-first' | 'symmetric' | { type: 'bg-candidate'; bgHex: string };
  const executeStrategy = (strategy: Strategy): { cost: number; patch: Partial<QRStyle>; diagnostics: FixDiagnostic[] } | null => {
    const patch: Partial<QRStyle> = {};
    const diagnostics: FixDiagnostic[] = [];
    let currentStyle: QRStyle = { ...config.style };

    if (strategy === 'symmetric') {
      const bgCol = currentStyle.backgroundOptions.color;
      const fgCol = currentStyle.dotOptions.color;
      const hasBgGradient = !!currentStyle.backgroundOptions.gradient;
      const hasFgGradient = !!currentStyle.dotOptions.gradient;
      
      if (!hasBgGradient && !hasFgGradient) {
        const maxTarget = Math.max(patternTarget, eyeTarget);
        const symResult = solveSymmetricContrast(bgCol, fgCol, maxTarget);
        if (symResult) {
          const newBgOptions = { ...currentStyle.backgroundOptions, color: symResult.hex1, gradient: undefined };
          const diag = computeDiagnostic('background', 'background adjustment (symmetric)', bgCol, symResult.hex1, fgCol);
          diagnostics.push(diag);
          currentStyle.backgroundOptions = newBgOptions;
          patch.backgroundOptions = newBgOptions;
        } else {
          return null; // Symmetric solve failed
        }
      } else {
        return null; // Can't do symmetric on gradients right now
      }
    } else if (typeof strategy === 'object' && strategy.type === 'bg-candidate') {
      const originalBg = config.style.backgroundOptions.color;
      const patternColor = currentStyle.dotOptions.color;
      const newBg = strategy.bgHex;

      const newDiag = computeDiagnostic('background', 'background adjustment', originalBg, newBg, patternColor);
      diagnostics.push(newDiag);

      const newBgOptions = {
        ...currentStyle.backgroundOptions,
        color: newBg,
        gradient: undefined,
      };

      currentStyle.backgroundOptions = newBgOptions;
      patch.backgroundOptions = newBgOptions;
    }

    const relationships = buildRelationships(currentStyle, patternTarget, eyeTarget);
    let anyUnfixable = false;

    for (const rel of relationships) {
      const contrast = getContrastForRelationship(rel);
      if (contrast >= rel.target || contrast === -1) continue;

      const bgLum = hexLum(rel.bgColor);
      const hasGradient = !!rel.fgGradient;

      if (!hasGradient && isForegroundInfeasible(bgLum, rel.target)) {
        anyUnfixable = true;
        break;
      }

      const fixResult = hasGradient
        ? fixGradientContrast(rel.fgColor, rel.fgGradient, rel.bgColor, rel.bgGradient, rel.target)
        : (() => {
            const solidResult = solveSolidContrast(rel.fgColor, rel.bgColor, rel.target);
            if (!solidResult) return null;
            return { adjustedSolidColor: solidResult.hex, adjustedGradient: undefined as unknown as QRGradient, achievedContrast: solidResult.achievedContrast };
          })();

      if (!fixResult) {
        anyUnfixable = true;
        break;
      }

      applyComponentFix(currentStyle, patch, diagnostics, rel, fixResult, currentStyle.backgroundOptions.color);
    }

    if (anyUnfixable) return null;

    let totalCost = 0;
    for (const diag of diagnostics) {
      const weight = weights[diag.component as keyof ComponentCostWeights] ?? 1.0;
      totalCost += (diag.visualChangeMagnitude ?? 0) * weight;
    }

    return { cost: totalCost, patch, diagnostics };
  };

  const candidates: Strategy[] = ['fg-first', 'symmetric'];

  // Generate background candidates
  const originalBg = config.style.backgroundOptions.color;
  const maxTarget = Math.max(patternTarget, eyeTarget);
  
  const bgSolveResults = solveSolidContrastCandidates(originalBg, config.style.dotOptions.color, maxTarget);
  for (const r of bgSolveResults) {
    candidates.push({ type: 'bg-candidate', bgHex: r.hex });
  }

  // Fallbacks
  const origLum = hexLum(originalBg);
  const primaryFallback = origLum >= 0.5 ? '#000000' : '#ffffff';
  const altFallback = origLum >= 0.5 ? '#ffffff' : '#000000';
  candidates.push({ type: 'bg-candidate', bgHex: primaryFallback });
  candidates.push({ type: 'bg-candidate', bgHex: altFallback });

  let bestStrategy: ReturnType<typeof executeStrategy> = null;

  for (const strat of candidates) {
    const result = executeStrategy(strat);
    if (result && (!bestStrategy || result.cost < bestStrategy.cost)) {
      bestStrategy = result;
    }
  }

  if (!bestStrategy) {
    return {
      success: false,
      reason: 'Unable to find a color adjustment that satisfies all contrast requirements while preserving your design.',
      unfixableRelationships: [],
    };
  }

  // Final validation
  if (!validateFixResult(config, bestStrategy.patch)) {
    return {
      success: false,
      reason: 'The solver found a candidate fix, but it did not pass independent validation. The design may require manual contrast adjustment.',
      unfixableRelationships: [],
    };
  }

  // Check if any changes were actually made
  if (bestStrategy.diagnostics.length === 0) {
    return {
      success: false,
      reason: 'No contrast issues were found that require fixing.',
      unfixableRelationships: [],
    };
  }

  return { success: true, patch: bestStrategy.patch, diagnostics: bestStrategy.diagnostics };
}

// ── Internal Helpers ──────────────────────────────────────────────────────

function applyComponentFix(
  currentStyle: QRStyle,
  patch: Partial<QRStyle>,
  diagnostics: FixDiagnostic[],
  rel: Relationship,
  fixResult: { adjustedSolidColor: string; adjustedGradient: QRGradient; achievedContrast: number },
  bgHex: string,
): void {
  switch (rel.fgComponent) {
    case 'pattern': {
      const newDotOptions = {
        ...currentStyle.dotOptions,
        color: fixResult.adjustedSolidColor || currentStyle.dotOptions.color,
        gradient: fixResult.adjustedGradient || currentStyle.dotOptions.gradient,
      };
      currentStyle.dotOptions = newDotOptions;
      patch.dotOptions = newDotOptions;

      const existingIdx = diagnostics.findIndex(d => d.component === 'pattern');
      const origBeforeHex = existingIdx !== -1 ? diagnostics[existingIdx].before : rel.fgColor;
      const origContrast = existingIdx !== -1 ? diagnostics[existingIdx].contrastBefore : undefined;

      const newDiag = computeDiagnostic(
        'pattern', rel.id, origBeforeHex,
        fixResult.adjustedSolidColor || rel.fgColor, bgHex,
      );
      if (origContrast !== undefined) newDiag.contrastBefore = origContrast;

      if (existingIdx !== -1) diagnostics[existingIdx] = newDiag;
      else diagnostics.push(newDiag);
      break;
    }
    case 'eyeFrame': {
      const newSquareOptions = {
        ...currentStyle.cornerSquareOptions,
        color: fixResult.adjustedSolidColor || currentStyle.cornerSquareOptions.color,
        gradient: fixResult.adjustedGradient || currentStyle.cornerSquareOptions.gradient,
      };
      currentStyle.cornerSquareOptions = newSquareOptions;
      patch.cornerSquareOptions = newSquareOptions;

      const existingIdx = diagnostics.findIndex(d => d.component === 'eyeFrame');
      const origBeforeHex = existingIdx !== -1 ? diagnostics[existingIdx].before : rel.fgColor;
      const origContrast = existingIdx !== -1 ? diagnostics[existingIdx].contrastBefore : undefined;

      const newDiag = computeDiagnostic(
        'eyeFrame', rel.id, origBeforeHex,
        fixResult.adjustedSolidColor || rel.fgColor, bgHex,
      );
      if (origContrast !== undefined) newDiag.contrastBefore = origContrast;

      if (existingIdx !== -1) diagnostics[existingIdx] = newDiag;
      else diagnostics.push(newDiag);
      break;
    }
    case 'eyeCenter': {
      const newDotCenterOptions = {
        ...currentStyle.cornerDotOptions,
        color: fixResult.adjustedSolidColor || currentStyle.cornerDotOptions.color,
        gradient: fixResult.adjustedGradient || currentStyle.cornerDotOptions.gradient,
      };
      currentStyle.cornerDotOptions = newDotCenterOptions;
      patch.cornerDotOptions = newDotCenterOptions;

      const existingIdx = diagnostics.findIndex(d => d.component === 'eyeCenter');
      const origBeforeHex = existingIdx !== -1 ? diagnostics[existingIdx].before : rel.fgColor;
      const origContrast = existingIdx !== -1 ? diagnostics[existingIdx].contrastBefore : undefined;

      const newDiag = computeDiagnostic(
        'eyeCenter', rel.id, origBeforeHex,
        fixResult.adjustedSolidColor || rel.fgColor, bgHex,
      );
      if (origContrast !== undefined) newDiag.contrastBefore = origContrast;

      if (existingIdx !== -1) diagnostics[existingIdx] = newDiag;
      else diagnostics.push(newDiag);
      break;
    }
  }
}
