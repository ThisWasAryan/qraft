import type { QRReliabilityCheck, QRDotOptions, QRCornerSquareOptions, ErrorCorrectionLevel, QRStyle } from '../types';
import { getWorstCaseContrast } from '../../utils/color';

export function checkModuleShape(dotOptions: QRDotOptions, ecLevel: ErrorCorrectionLevel, width: number): QRReliabilityCheck {
  if (dotOptions.type === 'dots') {
    if (width < 600) {
      return {
        id: 'module-shape',
        factor: 'Module Shape',
        label: 'Dots at Small Size',
        passed: false,
        severity: 'warning',
        detail: 'Dotted modules can be hard to scan at small physical sizes.',
        recommendation: 'Use Square or Rounded modules, or increase size.'
      };
    }
  }
  
  if (dotOptions.type === 'classy' || dotOptions.type === 'classy-rounded' || dotOptions.type === 'extra-rounded') {
    if (ecLevel === 'L' || ecLevel === 'M') {
      return {
        id: 'module-shape',
        factor: 'Module Shape',
        label: 'Stylized Modules',
        passed: true,
        severity: 'warning',
        detail: 'Highly stylized modules reduce scan reliability without high error correction.',
        recommendation: 'Set Error Correction to Q or H.'
      };
    }
  }

  return {
    id: 'module-shape',
    factor: 'Module Shape',
    label: 'Standard Modules',
    passed: true,
    severity: 'good'
  };
}

export function checkCornerShape(sqOptions: QRCornerSquareOptions): QRReliabilityCheck {
  if (sqOptions.type === 'classy' || sqOptions.type === 'classy-rounded') {
    return {
      id: 'corner-shape',
      factor: 'Finder Shape',
      label: 'Stylized Eyes',
      passed: true,
      severity: 'warning',
      detail: 'Highly stylized finder patterns may confuse some scanners.',
      recommendation: 'Use Square or Dot eyes for maximum compatibility.'
    };
  }

  return {
    id: 'corner-shape',
    factor: 'Finder Shape',
    label: 'Reliable Eyes',
    passed: true,
    severity: 'good'
  };
}

export function checkOutputSize(width: number): QRReliabilityCheck {
  if (width < 300) {
    return {
      id: 'output-size',
      factor: 'Size',
      label: 'Too Small',
      passed: false,
      severity: 'danger',
      detail: 'Export size is extremely small.',
      recommendation: 'Increase size to > 600px.'
    };
  } else if (width < 600) {
    return {
      id: 'output-size',
      factor: 'Size',
      label: 'Small Output',
      passed: true,
      severity: 'warning',
      detail: 'May be difficult to scan depending on focal distance.'
    };
  }
  
  return {
    id: 'output-size',
    factor: 'Size',
    label: 'Good Size',
    passed: true,
    severity: 'good'
  };
}

export function checkGradientContrast(style: QRStyle): QRReliabilityCheck {
  const bg = style.backgroundOptions.color;
  const bgGradient = style.backgroundOptions.gradient;

  if (bg.toLowerCase() === 'transparent') {
    return {
      id: 'gradient-contrast',
      factor: 'Gradient',
      label: 'Transparent Background',
      passed: true,
      severity: 'good'
    };
  }

  // Calculate worst case against Dots
  const dotContrast = getWorstCaseContrast(style.dotOptions.color, style.dotOptions.gradient, bg, bgGradient);
  
  // Calculate worst case against Eye Frames (falls back to dots if not defined)
  const squareColor = style.cornerSquareOptions.color || style.dotOptions.color;
  const squareGradient = style.cornerSquareOptions.gradient || style.dotOptions.gradient;
  const squareContrast = getWorstCaseContrast(squareColor, squareGradient, bg, bgGradient);

  // Calculate worst case against Eye Centers (falls back to eye frames if not defined)
  const dotCenterColor = style.cornerDotOptions.color || squareColor;
  const dotCenterGradient = style.cornerDotOptions.gradient || squareGradient;
  const dotCenterContrast = getWorstCaseContrast(dotCenterColor, dotCenterGradient, bg, bgGradient);

  // Find the absolute minimum contrast across all elements
  const minContrast = Math.min(dotContrast, squareContrast, dotCenterContrast);

  // If any contrast is -1 (transparent), we just ignore it
  if (minContrast !== -1 && minContrast < 3) {
    return {
      id: 'gradient-contrast',
      factor: 'Gradient',
      label: 'Low Gradient Contrast',
      passed: false,
      severity: 'warning', 
      detail: `Gradient has low contrast areas (${minContrast.toFixed(1)}:1).`,
      recommendation: 'Ensure all gradient colors contrast with the background.'
    };
  }

  return {
    id: 'gradient-contrast',
    factor: 'Gradient',
    label: 'Good Gradient Contrast',
    passed: true,
    severity: 'good'
  };
}
