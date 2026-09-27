import type { QRGradient } from '../types';
import { interpolateColor, getContrastRatio } from '../../utils/color';

/**
 * Evaluate a gradient at a normalized canvas coordinate (x, y) ∈ [0,1]².
 *
 * Linear gradients: project (x, y) onto the axis defined by the rotation angle.
 * Radial gradients: compute distance from center (0.5, 0.5).
 *
 * QRGradient has no configurable center — confirmed from types.ts:
 * only `type`, `rotation?` (radians, for linear), and `colorStops`.
 */
export function sampleGradientAtPoint(
  gradient: QRGradient,
  x: number,
  y: number,
): string {
  let t: number;

  if (gradient.type === 'linear') {
    const rotation = gradient.rotation ?? 0;
    const dx = Math.cos(rotation);
    const dy = Math.sin(rotation);
    // Project (x, y) centered at (0.5, 0.5) onto the gradient axis
    const px = x - 0.5;
    const py = y - 0.5;
    const proj = px * dx + py * dy;
    // Normalize to [0, 1] — projection range is [-0.5·√2, 0.5·√2] at most
    // but we use a simpler normalization: shift from [-0.5, 0.5] to [0, 1]
    t = proj + 0.5;
  } else {
    // Radial: distance from center (0.5, 0.5), normalized
    const dx = x - 0.5;
    const dy = y - 0.5;
    t = Math.sqrt(dx * dx + dy * dy) * 2; // max distance 0.5*√2 ≈ 0.707, *2 → ≈1.414
  }

  t = Math.max(0, Math.min(1, t));
  return interpolateAtT(gradient, t);
}

/**
 * Interpolate a gradient's color stops at parameter t ∈ [0, 1].
 */
function interpolateAtT(gradient: QRGradient, t: number): string {
  const stops = gradient.colorStops;
  if (stops.length === 0) return '#000000';
  if (stops.length === 1) return stops[0].color;

  // Find the two stops t falls between
  if (t <= stops[0].offset) return stops[0].color;
  if (t >= stops[stops.length - 1].offset) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].offset && t <= stops[i + 1].offset) {
      const range = stops[i + 1].offset - stops[i].offset;
      if (range < 1e-10) return stops[i].color;
      const factor = (t - stops[i].offset) / range;
      return interpolateColor(stops[i].color, stops[i + 1].color, factor);
    }
  }

  return stops[stops.length - 1].color;
}

export interface ContrastSample {
  x: number;
  y: number;
  contrast: number;
  fgColor: string;
  bgColor: string;
}

/**
 * Sample a foreground color/gradient against a background color/gradient
 * at real canvas coordinates, returning contrast at each point.
 *
 * Uses a grid of `gridSize × gridSize` samples.
 */
function sampleContrastGrid(
  fgColor: string,
  fgGradient: QRGradient | undefined,
  bgColor: string,
  bgGradient: QRGradient | undefined,
  gridSize: number,
): ContrastSample[] {
  const samples: ContrastSample[] = [];

  for (let yi = 0; yi < gridSize; yi++) {
    for (let xi = 0; xi < gridSize; xi++) {
      const x = gridSize === 1 ? 0.5 : xi / (gridSize - 1);
      const y = gridSize === 1 ? 0.5 : yi / (gridSize - 1);

      const fg = fgGradient ? sampleGradientAtPoint(fgGradient, x, y) : fgColor;
      const bg = bgGradient ? sampleGradientAtPoint(bgGradient, x, y) : bgColor;
      const contrast = getContrastRatio(fg, bg);

      samples.push({ x, y, contrast, fgColor: fg, bgColor: bg });
    }
  }

  return samples;
}

/**
 * Find the worst-contrast region between two color/gradient elements.
 *
 * Phase 1: Coarse grid (6×6 = 36 samples)
 * Phase 2: Refine around worst region (5×5 = 25 samples in neighborhood)
 *
 * Returns samples sorted by contrast (ascending — worst first).
 */
export function findWorstContrastRegion(
  fgColor: string,
  fgGradient: QRGradient | undefined,
  bgColor: string,
  bgGradient: QRGradient | undefined,
): ContrastSample[] {
  // Phase 1: coarse grid
  const coarse = sampleContrastGrid(fgColor, fgGradient, bgColor, bgGradient, 6);
  coarse.sort((a, b) => a.contrast - b.contrast);

  if (coarse.length === 0) return [];

  // Phase 2: refine around the worst point
  const worst = coarse[0];
  const refineRadius = 0.1;
  const refineSteps = 5;
  const refined: ContrastSample[] = [];

  for (let yi = 0; yi < refineSteps; yi++) {
    for (let xi = 0; xi < refineSteps; xi++) {
      const x = Math.max(0, Math.min(1,
        worst.x - refineRadius + (2 * refineRadius * xi) / (refineSteps - 1)));
      const y = Math.max(0, Math.min(1,
        worst.y - refineRadius + (2 * refineRadius * yi) / (refineSteps - 1)));

      const fg = fgGradient ? sampleGradientAtPoint(fgGradient, x, y) : fgColor;
      const bg = bgGradient ? sampleGradientAtPoint(bgGradient, x, y) : bgColor;
      const contrast = getContrastRatio(fg, bg);

      refined.push({ x, y, contrast, fgColor: fg, bgColor: bg });
    }
  }

  // Merge and sort
  const all = [...coarse, ...refined];
  all.sort((a, b) => a.contrast - b.contrast);
  return all;
}

/**
 * Get the worst-case contrast using canvas-coordinate sampling.
 * This is used as a heuristic by the solver — the real accept/reject
 * gate uses getWorstCaseContrast from utils/color.ts.
 */
export function getCanvasWorstCaseContrast(
  fgColor: string,
  fgGradient: QRGradient | undefined,
  bgColor: string,
  bgGradient: QRGradient | undefined,
): number {
  const samples = findWorstContrastRegion(fgColor, fgGradient, bgColor, bgGradient);
  if (samples.length === 0) return 21; // no samples = assume good
  return samples[0].contrast;
}

/**
 * Find which gradient stop index is nearest to a canvas point,
 * based on the gradient's geometry.
 */
export function findNearestStopIndex(
  gradient: QRGradient,
  x: number,
  y: number,
): number {
  let t: number;

  if (gradient.type === 'linear') {
    const rotation = gradient.rotation ?? 0;
    const dx = Math.cos(rotation);
    const dy = Math.sin(rotation);
    const px = x - 0.5;
    const py = y - 0.5;
    t = (px * dx + py * dy) + 0.5;
  } else {
    const dx = x - 0.5;
    const dy = y - 0.5;
    t = Math.sqrt(dx * dx + dy * dy) * 2;
  }

  t = Math.max(0, Math.min(1, t));

  let nearestIdx = 0;
  let nearestDist = Infinity;
  for (let i = 0; i < gradient.colorStops.length; i++) {
    const dist = Math.abs(gradient.colorStops[i].offset - t);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}
