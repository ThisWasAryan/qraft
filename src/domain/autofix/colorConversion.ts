import { hexToRgb } from '../../utils/color';

/**
 * Convert sRGB component (0-255) to linear RGB (0-1).
 * Uses the same linearization as getRelativeLuminance in utils/color.ts.
 */
export function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB component (0-1) to sRGB (0-255), clamped.
 */
export function linearToSrgb(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  const s = clamped <= 0.00304 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(255, s * 255)));
}

/**
 * Linear RGB (0-1 each) → OKLab (L, a, b).
 * Uses Björn Ottosson's matrices.
 */
export function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

/**
 * OKLab (L, a, b) → linear RGB (0-1 each).
 */
export function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  return [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  ];
}

export interface OKLCH {
  L: number; // 0-1
  C: number; // 0+
  H: number; // 0-360 degrees
}

/**
 * OKLab → OKLCH conversion.
 */
export function oklabToOklch(L: number, a: number, b: number): OKLCH {
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H };
}

/**
 * OKLCH → OKLab conversion.
 */
export function oklchToOklab(L: number, C: number, H: number): [number, number, number] {
  const hRad = H * (Math.PI / 180);
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

/**
 * Hex color string → OKLCH.
 */
export function hexToOklch(hex: string): OKLCH {
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const [labL, labA, labB] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(labL, labA, labB);
}

/**
 * OKLCH → hex color string.
 * Clamps to sRGB gamut during conversion.
 */
export function oklchToHex(L: number, C: number, H: number): string {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearRgb(labL, labA, labB);
  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const b = linearToSrgb(lb);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Check whether an OKLCH color maps to a valid sRGB point.
 * "Valid" means all linear RGB channels are in [0, 1] within a small tolerance.
 */
export function isInGamut(L: number, C: number, H: number): boolean {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [r, g, b] = oklabToLinearRgb(labL, labA, labB);
  const tol = -0.001;
  return r >= tol && r <= 1.001 && g >= tol && g <= 1.001 && b >= tol && b <= 1.001;
}

/**
 * Clamp an OKLCH color into sRGB gamut by reducing chroma until in-gamut.
 * Binary search, max 20 iterations. Preserves L and H.
 */
export function gamutClamp(L: number, C: number, H: number): OKLCH {
  // Extremes are always in gamut
  if (L <= 0) return { L: 0, C: 0, H };
  if (L >= 1) return { L: 1, C: 0, H };

  if (isInGamut(L, C, H)) return { L, C, H };

  let lo = 0;
  let hi = C;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInGamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { L, C: lo, H };
}
