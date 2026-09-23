import type { QRReliabilityCheck, QRBackgroundOptions, QRDotOptions, QRCornerSquareOptions, QRCornerDotOptions } from '../types';
import { getContrastRatio } from '../../utils/color';

export function checkContrast(dotOptions: QRDotOptions, bgOptions: QRBackgroundOptions): QRReliabilityCheck {
  const bg = bgOptions.color;
  const fg = dotOptions.color;
  
  if (bg.toLowerCase() === 'transparent') {
    return {
      id: 'contrast',
      factor: 'Contrast',
      label: 'Transparent Background',
      passed: false,
      severity: 'warning',
      detail: 'Scanning depends entirely on what is placed behind the QR code.',
      recommendation: 'Use a solid background color for reliable scanning.'
    };
  }

  const ratio = getContrastRatio(fg, bg);
  
  if (ratio < 3) {
    return {
      id: 'contrast',
      factor: 'Contrast',
      label: 'Very Low Contrast',
      passed: false,
      severity: 'danger',
      detail: `Contrast ratio is ${ratio.toFixed(1)}:1. Scanners will likely fail to detect the QR code.`,
      recommendation: 'Ensure foreground is much darker than the background.'
    };
  } else if (ratio < 4.5) {
    return {
      id: 'contrast',
      factor: 'Contrast',
      label: 'Low Contrast',
      passed: true,
      severity: 'warning',
      detail: `Contrast ratio is ${ratio.toFixed(1)}:1. Some scanners may struggle under poor lighting.`,
      recommendation: 'Increase contrast to at least 4.5:1.'
    };
  }

  return {
    id: 'contrast',
    factor: 'Contrast',
    label: 'Strong Contrast',
    passed: true,
    severity: 'good',
    detail: `Contrast ratio is ${ratio.toFixed(1)}:1.`,
  };
}

export function checkEyeContrast(
  sqOptions: QRCornerSquareOptions, 
  dotOptions: QRCornerDotOptions, 
  bgOptions: QRBackgroundOptions
): QRReliabilityCheck {
  const bg = bgOptions.color;
  if (bg.toLowerCase() === 'transparent') {
    return {
      id: 'eye-contrast',
      factor: 'Finder Pattern',
      label: 'Transparent Background',
      passed: false,
      severity: 'warning',
      detail: 'Finder patterns may lack contrast depending on background.'
    };
  }

  const sqColor = sqOptions.color || '#000000';
  const sqRatio = getContrastRatio(sqColor, bg);
  
  const dotColor = dotOptions.color || sqColor;
  const dotRatio = getContrastRatio(dotColor, bg);
  
  const minRatio = Math.min(sqRatio, dotRatio);
  
  if (minRatio < 4.5) {
    return {
      id: 'eye-contrast',
      factor: 'Finder Pattern',
      label: 'Low Eye Contrast',
      passed: false,
      severity: 'danger',
      detail: `Contrast ratio for eyes is ${minRatio.toFixed(1)}:1. This is critical for detection.`,
      recommendation: 'Ensure finder patterns have high contrast against the background.'
    };
  }
  
  return {
    id: 'eye-contrast',
    factor: 'Finder Pattern',
    label: 'Good Eye Contrast',
    passed: true,
    severity: 'good',
    detail: `Contrast ratio for eyes is strong.`
  };
}
