import type { QRGradient } from '../domain/types';

/**
 * Parse a hex color string to [R, G, B] components (0-255).
 * Supports #RRGGBB and #RGB formats.
 * Ignores alpha channel if present (#RRGGBBAA or #RGBA) for contrast purposes.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace(/^#/, '');
  
  if (cleaned.length === 3 || cleaned.length === 4) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  
  if (cleaned.length === 8) {
    cleaned = cleaned.substring(0, 6);
  }
  
  if (cleaned.length !== 6) {
    return [0, 0, 0];
  }
  
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  
  return [r, g, b];
}

/**
 * Calculate relative luminance of a color.
 * Uses the WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors.
 * Uses the WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  if (hex1.toLowerCase() === 'transparent' || hex2.toLowerCase() === 'transparent') {
    return -1; // Special case for transparency
  }
  
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const lum1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Interpolate between two colors.
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

/**
 * Extracts a robust array of color samples from a gradient or solid color.
 * For gradients, it includes the exact stops and mathematical midpoints to catch hidden contrast issues.
 */
export function extractColorSamples(color: string, gradient?: QRGradient): string[] {
  if (color.toLowerCase() === 'transparent') return ['transparent'];

  if (!gradient || gradient.colorStops.length === 0) {
    return [color];
  }

  const samples = new Set<string>();
  
  // Add all explicit stops
  for (const stop of gradient.colorStops) {
    samples.add(stop.color);
  }

  // Add midpoints between adjacent stops
  for (let i = 0; i < gradient.colorStops.length - 1; i++) {
    const c1 = gradient.colorStops[i].color;
    const c2 = gradient.colorStops[i+1].color;
    samples.add(interpolateColor(c1, c2, 0.5));
  }

  return Array.from(samples);
}

/**
 * Calculates the absolute worst-case contrast ratio between any foreground color sample
 * and any background color sample. Useful for finding the lowest contrast point in complex intersecting gradients.
 */
export function getWorstCaseContrast(
  fgColor: string, 
  fgGradient?: QRGradient, 
  bgColor: string = '#FFFFFF', 
  bgGradient?: QRGradient
): number {
  const fgSamples = extractColorSamples(fgColor, fgGradient);
  const bgSamples = extractColorSamples(bgColor, bgGradient);
  
  if (fgSamples.includes('transparent') || bgSamples.includes('transparent')) {
    return -1; // Ignore contrast for transparency
  }

  let minContrast = 999;

  for (const fg of fgSamples) {
    for (const bg of bgSamples) {
      const ratio = getContrastRatio(fg, bg);
      if (ratio < minContrast) {
        minContrast = ratio;
      }
    }
  }

  return minContrast;
}
