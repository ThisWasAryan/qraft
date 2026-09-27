import type { QRConfig, QRStyle, QRGradient } from '../types';
import { getContrastRatio, getWorstCaseContrast } from '../../utils/color';
import { solveSolidContrast, isForegroundInfeasible } from './solidSolver';
import { fixGradientContrast } from './gradientSolver';
import { hexToOklch } from './colorConversion';
import { colorChangeCost } from './costFunction';
import type { ComponentCostWeights } from './costFunction';
import { validateFixResult } from './validator';
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
const MAX_BACKGROUND_RIPPLE_PASSES = 2;

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

  // ── Transparent background: structured failure ──
  if (bg.toLowerCase() === 'transparent') {
    return {
      success: false,
      reason: 'Cannot auto-fix contrast with a transparent background. Please set a solid or gradient background color first, then retry.',
      unfixableRelationships: ['background↔pattern', 'background↔eyeFrame', 'background↔eyeCenter'],
    };
  }

  // ── Build working copy ──
  const patch: Partial<QRStyle> = {};
  const diagnostics: FixDiagnostic[] = [];

  // Track current state of each component as we fix things
  let currentStyle: QRStyle = { ...config.style };

  // ── Phase 1: Try fixing all foreground elements with background frozen ──
  let bgMustMove = false;
  const unfixableFgRelationships: string[] = [];

  const relationships = buildRelationships(currentStyle, patternTarget, eyeTarget);

  for (const rel of relationships) {
    const contrast = getContrastForRelationship(rel);
    if (contrast >= rel.target || contrast === -1) continue;

    // O(1) infeasibility check for solid colors
    const bgLum = hexLum(rel.bgColor);
    const hasGradient = !!rel.fgGradient;

    if (!hasGradient && isForegroundInfeasible(bgLum, rel.target)) {
      unfixableFgRelationships.push(rel.id);
      bgMustMove = true;
      continue;
    }

    // Try solving foreground
    const fixResult = hasGradient
      ? fixGradientContrast(rel.fgColor, rel.fgGradient, rel.bgColor, rel.bgGradient, rel.target)
      : (() => {
          const solidResult = solveSolidContrast(rel.fgColor, rel.bgColor, rel.target);
          if (!solidResult) return null;
          return { adjustedSolidColor: solidResult.hex, adjustedGradient: undefined as unknown as QRGradient, achievedContrast: solidResult.achievedContrast };
        })();

    if (!fixResult) {
      unfixableFgRelationships.push(rel.id);
      bgMustMove = true;
      continue;
    }

    // Apply fix to working style
    applyComponentFix(currentStyle, patch, diagnostics, rel, fixResult, bg);
  }

  // ── Phase 2: Move background if needed ──
  if (bgMustMove) {
    const bgResult = fixBackground(config, currentStyle, patch, diagnostics, patternTarget, eyeTarget);
    if (!bgResult) {
      return {
        success: false,
        reason: 'Unable to find a color adjustment that satisfies all contrast requirements while preserving your design.',
        unfixableRelationships: unfixableFgRelationships,
      };
    }
    currentStyle = bgResult;
  }

  // ── Phase 3: Ripple pass — background change may have broken other relationships ──
  for (let pass = 0; pass < MAX_BACKGROUND_RIPPLE_PASSES; pass++) {
    const postRelationships = buildRelationships(currentStyle, patternTarget, eyeTarget);
    let anyNewFailure = false;

    for (const rel of postRelationships) {
      const contrast = getContrastForRelationship(rel);
      if (contrast >= rel.target || contrast === -1) continue;

      anyNewFailure = true;
      const hasGradient = !!rel.fgGradient;

      const fixResult = hasGradient
        ? fixGradientContrast(rel.fgColor, rel.fgGradient, rel.bgColor, rel.bgGradient, rel.target)
        : (() => {
            const solidResult = solveSolidContrast(rel.fgColor, rel.bgColor, rel.target);
            if (!solidResult) return null;
            return { adjustedSolidColor: solidResult.hex, adjustedGradient: undefined as unknown as QRGradient, achievedContrast: solidResult.achievedContrast };
          })();

      if (fixResult) {
        applyComponentFix(
          currentStyle, patch, diagnostics, rel, fixResult,
          currentStyle.backgroundOptions.color,
        );
      }
    }

    if (!anyNewFailure) break;
  }

  // ── Phase 4: Final validation ──
  if (!validateFixResult(config, patch)) {
    return {
      success: false,
      reason: 'The solver found a candidate fix, but it did not pass independent validation. The design may require manual contrast adjustment.',
      unfixableRelationships: [],
    };
  }

  // Check if any changes were actually made
  if (diagnostics.length === 0) {
    return {
      success: false,
      reason: 'No contrast issues were found that require fixing.',
      unfixableRelationships: [],
    };
  }

  return { success: true, patch, diagnostics };
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

/**
 * Fix the background when foreground-only fixes are provably infeasible.
 *
 * Strategy: solve background color against the hardest-to-satisfy foreground,
 * then re-check ALL relationships (ripple).
 */
function fixBackground(
  originalConfig: QRConfig,
  currentStyle: QRStyle,
  patch: Partial<QRStyle>,
  diagnostics: FixDiagnostic[],
  patternTarget: number,
  eyeTarget: number,
): QRStyle | null {
  const originalBg = originalConfig.style.backgroundOptions.color;
  const maxTarget = Math.max(patternTarget, eyeTarget);

  // Solve: find the minimum-cost background change that lets the hardest
  // foreground element meet its target.
  // We try adjusting the background against the pattern first (it's the most
  // common relationship), then validate the result against all others.
  const patternColor = currentStyle.dotOptions.color;

  // Invert the problem: solve bg against fg
  let bgResult = solveSolidContrast(originalBg, patternColor, maxTarget);
  let newBg: string;

  if (bgResult) {
    newBg = bgResult.hex;
  } else {
    // Both foreground and background are mid-gray, making it impossible
    // to adjust only one. We push the background towards the nearest extreme
    // just enough to allow the ripple pass to fix the foreground.
    const origLum = hexLum(originalBg);
    const extremeFg = origLum >= 0.5 ? '#000000' : '#ffffff';
    const fallbackBgResult = solveSolidContrast(originalBg, extremeFg, 21);
    
    if (fallbackBgResult) {
      newBg = fallbackBgResult.hex;
    } else {
      newBg = origLum >= 0.5 ? '#ffffff' : '#000000';
    }
  }

  const existingIdx = diagnostics.findIndex(d => d.component === 'background');
  const origBeforeHex = existingIdx !== -1 ? diagnostics[existingIdx].before : originalBg;
  const origContrast = existingIdx !== -1 ? diagnostics[existingIdx].contrastBefore : undefined;

  const newDiag = computeDiagnostic(
    'background', 'background adjustment', origBeforeHex, newBg, patternColor,
  );
  if (origContrast !== undefined) newDiag.contrastBefore = origContrast;

  if (existingIdx !== -1) diagnostics[existingIdx] = newDiag;
  else diagnostics.push(newDiag);

  const newBgOptions = {
    ...currentStyle.backgroundOptions,
    color: newBg,
    gradient: undefined, // Clear gradient when bg must move
  };

  currentStyle.backgroundOptions = newBgOptions;
  patch.backgroundOptions = newBgOptions;

  return currentStyle;
}
