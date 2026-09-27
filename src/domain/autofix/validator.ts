import type { QRConfig, QRStyle } from '../types';
import { analyzeReliability } from '../reliability';

/**
 * Independently validate a fix by applying the patch to the original config
 * and running the real production reliability analysis.
 *
 * Returns true only if NO contrast/gradient-contrast/eye-contrast
 * warnings or dangers remain.
 *
 * This is the final gate — never trust the solver's internal math as the last word.
 */
export function validateFixResult(
  originalConfig: QRConfig,
  patch: Partial<QRStyle>,
): boolean {
  const patchedConfig: QRConfig = {
    ...originalConfig,
    style: applyStylePatch(originalConfig.style, patch),
  };

  const report = analyzeReliability(patchedConfig);

  const contrastCheckIds = ['contrast', 'eye-contrast', 'gradient-contrast'];

  const result = !report.checks.some(
    (c) =>
      contrastCheckIds.includes(c.id) &&
      (c.severity === 'danger' ||
        (c.severity === 'warning' && c.id !== 'contrast')),
  );
  return result;
}

/**
 * Apply a partial style patch to a QRStyle, deep-merging nested objects.
 */
export function applyStylePatch(
  style: QRStyle,
  patch: Partial<QRStyle>,
): QRStyle {
  return {
    ...style,
    ...patch,
    dotOptions: patch.dotOptions
      ? { ...style.dotOptions, ...patch.dotOptions }
      : style.dotOptions,
    cornerSquareOptions: patch.cornerSquareOptions
      ? { ...style.cornerSquareOptions, ...patch.cornerSquareOptions }
      : style.cornerSquareOptions,
    cornerDotOptions: patch.cornerDotOptions
      ? { ...style.cornerDotOptions, ...patch.cornerDotOptions }
      : style.cornerDotOptions,
    backgroundOptions: patch.backgroundOptions
      ? { ...style.backgroundOptions, ...patch.backgroundOptions }
      : style.backgroundOptions,
  };
}
